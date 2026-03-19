const { spawn } = require('child_process');

class TigerGraphMCPService {
  constructor(connectionConfig) {
    this.config = connectionConfig;
    this.mcpProcess = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.outputBuffer = '';
    this.initialized = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        TG_HOST: this.config.host,
        TG_GRAPHNAME: this.config.graph_name || '',
        TG_SECRET: this.config.secret,
        TG_RESTPP_PORT: String(this.config.restpp_port || 443),
        TG_GS_PORT: String(this.config.gsql_port || 443),
        PYTHONUNBUFFERED: '1',
      };

      try {
        this.mcpProcess = spawn('tigergraph-mcp', [], {
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true,
        });

        this.mcpProcess.stdout.on('data', (data) => {
          this.handleOutput(data.toString());
        });

        this.mcpProcess.stderr.on('data', (data) => {
          const msg = data.toString();
          if (msg.includes('ERROR') || msg.includes('Traceback')) {
            console.error('[TG-MCP stderr]:', msg);
          }
        });

        this.mcpProcess.on('error', (error) => {
          console.error('[TG-MCP process error]:', error);
          reject(error);
        });

        this.mcpProcess.on('close', (code) => {
          console.log('[TG-MCP] Process closed with code:', code);
          this.initialized = false;
          this.rejectAllPending(new Error(`MCP process closed with code ${code}`));
        });

        setTimeout(async () => {
          try {
            await this.initialize();
            this.initialized = true;
            resolve(true);
          } catch (err) {
            reject(err);
          }
        }, 2000);

      } catch (error) {
        reject(error);
      }
    });
  }

  handleOutput(data) {
    this.outputBuffer += data;
    const lines = this.outputBuffer.split('\n');
    this.outputBuffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const response = JSON.parse(line);
        const requestId = response.id;

        if (requestId !== undefined && this.pendingRequests.has(requestId)) {
          const { resolve, reject } = this.pendingRequests.get(requestId);
          this.pendingRequests.delete(requestId);

          if (response.error) {
            console.error(`[TG-MCP] Error response:`, response.error);
            reject(new Error(response.error.message || 'MCP error'));
          } else {
            resolve(response.result);
          }
        }
      } catch (e) {
        // Non-JSON output (debug/info logs from pyTigerGraph)
      }
    }
  }

  rejectAllPending(error) {
    for (const [, { reject }] of this.pendingRequests) {
      reject(error);
    }
    this.pendingRequests.clear();
  }

  sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.mcpProcess) {
        reject(new Error('MCP process not connected'));
        return;
      }

      const id = ++this.requestId;
      const request = { jsonrpc: '2.0', id, method, params };

      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('MCP request timeout'));
        }
      }, 180000);

      this.pendingRequests.set(id, {
        resolve: (result) => { clearTimeout(timeout); resolve(result); },
        reject: (error) => { clearTimeout(timeout); reject(error); },
      });

      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async initialize() {
    return this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'tigergraph-devhub', version: '2.0.0' },
    });
  }

  async callTool(toolName, args = {}) {
    if (!this.initialized) {
      throw new Error('MCP not initialized. Call connect() first.');
    }
    return this.sendRequest('tools/call', { name: toolName, arguments: args });
  }

  /**
   * Parses the pyTigerGraph MCP response envelope.
   * The MCP can return either pure JSON or markdown-wrapped JSON (```json ... ```).
   * Extracts the `data` field from {success, operation, data, summary, ...}.
   */
  parseResponse(result) {
    if (!result || !result.content || !result.content[0]) return result;
    const text = result.content[0].text;

    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object' && 'success' in parsed) {
        if (!parsed.success) {
          const err = new Error(parsed.error || parsed.summary || 'MCP tool failed');
          err.mcpResponse = parsed;
          throw err;
        }
        return parsed.data !== undefined ? parsed.data : parsed;
      }
      return parsed;
    } catch (e) {
      if (e.mcpResponse) throw e;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }
  }

  // ==================== Schema & Stats ====================

  async getSchema() {
    try {
      const result = await this.callTool('tigergraph__get_graph_schema', {
        graph_name: this.config.graph_name || undefined,
      });
      const data = this.parseResponse(result);
      if (data?.schema) return data.schema;
      return data;
    } catch (error) {
      console.error('[TG-MCP] getSchema error:', error.message);
      throw error;
    }
  }

  async getVertexCount(vertexType) {
    try {
      const args = {};
      if (vertexType) args.vertex_type = vertexType;
      if (this.config.graph_name) args.graph_name = this.config.graph_name;
      const result = await this.callTool('tigergraph__get_vertex_count', args);
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] getVertexCount error:', error.message);
      throw error;
    }
  }

  async getEdgeCount(edgeType) {
    try {
      const args = {};
      if (edgeType) args.edge_type = edgeType;
      if (this.config.graph_name) args.graph_name = this.config.graph_name;
      const result = await this.callTool('tigergraph__get_edge_count', args);
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] getEdgeCount error:', error.message);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const [vertexData, edgeData] = await Promise.all([
        this.getVertexCount(),
        this.getEdgeCount(),
      ]);

      const vertexCount = typeof vertexData === 'number' ? vertexData
        : (vertexData?.total ?? vertexData?.count ?? 0);
      const edgeCount = typeof edgeData === 'number' ? edgeData
        : (edgeData?.total ?? edgeData?.count ?? 0);

      return { vertexCount, edgeCount };
    } catch (error) {
      console.error('[TG-MCP] getStatistics error:', error.message);
      throw error;
    }
  }

  // ==================== Graph Operations ====================

  async listGraphs() {
    try {
      const result = await this.callTool('tigergraph__list_graphs', {});
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] listGraphs error:', error.message);
      throw error;
    }
  }

  async getNodes(vertexType, limit = 100) {
    try {
      const result = await this.callTool('tigergraph__get_nodes', {
        vertex_type: vertexType,
        limit,
        ...(this.config.graph_name && { graph_name: this.config.graph_name }),
      });
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] getNodes error:', error.message);
      throw error;
    }
  }

  async listMetadata() {
    try {
      const result = await this.callTool('tigergraph__show_graph_details', {
        graph_name: this.config.graph_name || undefined,
      });
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] listMetadata error:', error.message);
      throw error;
    }
  }

  // ==================== Query Operations ====================

  /**
   * Run an interpreted GSQL query (no install required).
   * Uses tigergraph__run_query which runs INTERPRET QUERY.
   */
  async runInterpretedQuery(queryText) {
    try {
      const result = await this.callTool('tigergraph__run_query', {
        query: queryText,
        ...(this.config.graph_name && { graph_name: this.config.graph_name }),
      });
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] runInterpretedQuery error:', error.message);
      throw error;
    }
  }

  /**
   * Run an already-installed query by name.
   */
  async runInstalledQuery(queryName, params = {}) {
    try {
      const result = await this.callTool('tigergraph__run_installed_query', {
        query_name: queryName,
        params,
        ...(this.config.graph_name && { graph_name: this.config.graph_name }),
      });
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] runInstalledQuery error:', error.message);
      throw error;
    }
  }

  /**
   * Install a query using the raw GSQL tool with USE GRAPH workaround.
   * This bypasses the broken tigergraph__install_query tool.
   */
  async installQueryViaGSQL(queryText) {
    try {
      const graphName = this.config.graph_name;
      if (!graphName) throw new Error('graph_name is required to install queries');

      const queryName = this.extractQueryName(queryText);
      const command = `USE GRAPH ${graphName}\n${queryText}\nINSTALL QUERY ${queryName}`;

      const result = await this.callTool('tigergraph__gsql', { command });
      const parsed = this.parseResponse(result);

      if (typeof parsed === 'string' && parsed.includes('Error:')) {
        throw new Error(parsed);
      }
      return { queryName, result: parsed };
    } catch (error) {
      console.error('[TG-MCP] installQueryViaGSQL error:', error.message);
      throw error;
    }
  }

  async isQueryInstalled(queryName) {
    try {
      const result = await this.callTool('tigergraph__is_query_installed', {
        query_name: queryName,
        ...(this.config.graph_name && { graph_name: this.config.graph_name }),
      });
      const data = this.parseResponse(result);
      if (data && typeof data === 'object' && 'installed' in data) return data.installed;
      return data === true || data === 'true';
    } catch (error) {
      console.error('[TG-MCP] isQueryInstalled error:', error.message);
      return false;
    }
  }

  async dropQuery(queryName) {
    try {
      const result = await this.callTool('tigergraph__drop_query', {
        query_name: queryName,
        ...(this.config.graph_name && { graph_name: this.config.graph_name }),
      });
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] dropQuery error:', error.message);
      throw error;
    }
  }

  /**
   * Execute a raw GSQL command.
   */
  async gsql(command) {
    try {
      const result = await this.callTool('tigergraph__gsql', {
        command,
        ...(this.config.graph_name && { graph_name: this.config.graph_name }),
      });
      return this.parseResponse(result);
    } catch (error) {
      console.error('[TG-MCP] gsql error:', error.message);
      throw error;
    }
  }

  // ==================== Utilities ====================

  extractQueryName(queryString) {
    const match = queryString.match(/CREATE\s+(?:OR\s+REPLACE\s+)?(?:DISTRIBUTED\s+)?QUERY\s+(\w+)/i);
    return match ? match[1] : 'unnamed_query';
  }

  disconnect() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.initialized = false;
      this.rejectAllPending(new Error('MCP disconnected'));
    }
  }
}

module.exports = TigerGraphMCPService;
