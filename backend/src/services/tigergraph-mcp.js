const { spawn } = require('child_process');
const axios = require('axios');
const https = require('https');

const JWT_LIFETIME = 7776000; // 90 days
const REQUEST_TIMEOUT_MS = 180000;
const MCP_STARTUP_DELAY_MS = 3000;
const STATS_TIMEOUT_MS = 15000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isLikelyCloudHost(host = '') {
  const value = String(host).toLowerCase();
  return value.includes('tgcloud.io') || value.includes('savanna') || value.includes('.i.tgcloud.io');
}

function toPortNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 65535) return null;
  return parsed;
}

class TigerGraphMCPService {
  constructor(connectionConfig) {
    this.config = connectionConfig;
    this.mcpProcess = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.outputBuffer = '';
    this.initialized = false;
    this.jwtToken = connectionConfig.jwt_token || null;
    this._schemaCache = null; // { value, timestamp }
    this._statsCache = null;  // { value, timestamp }
  }

  resolveHostConfig() {
    const rawHost = (this.config.host || '').trim();
    if (!rawHost) {
      throw new Error('TigerGraph host is required');
    }

    const withProtocol = /^https?:\/\//i.test(rawHost) ? rawHost : `http://${rawHost}`;
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname;
    const isCloud = isLikelyCloudHost(hostname);
    const protocol = parsed.protocol || (isCloud ? 'https:' : 'http:');
    const embeddedPort = toPortNumber(parsed.port);

    return {
      rawHost,
      baseHost: `${protocol}//${hostname}`,
      isCloud,
      embeddedPort,
    };
  }

  /**
   * Fetch a JWT token from TigerGraph using the secret.
   * POST {host}/gsql/v1/tokens  { "secret": "<SECRET>", "lifetime": 7776000 }
   */
  async fetchJWTToken() {
    const hostCfg = this.resolveHostConfig();
    const gsqlPort = String(
      toPortNumber(this.config.gsql_port)
      || hostCfg.embeddedPort
      || (hostCfg.isCloud ? 443 : 14240)
    );
    const url = `${hostCfg.baseHost}:${gsqlPort}/gsql/v1/tokens`;

    try {
      const resp = await axios.post(url, {
        secret: this.config.secret,
        lifetime: JWT_LIFETIME,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      const token = resp.data?.token || resp.data?.results?.token;
      if (!token) {
        throw new Error(`No token in response: ${JSON.stringify(resp.data)}`);
      }

      this.jwtToken = token;
      return token;
    } catch (error) {
      const detail = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      throw new Error(`Failed to fetch JWT token from ${url}: ${detail}`);
    }
  }

  async connect() {
    if (!this.jwtToken) {
      if (!this.config.secret) {
        throw new Error('Either jwt_token or secret is required to connect');
      }
      await this.fetchJWTToken();
    }

    return new Promise((resolve, reject) => {
      const hostCfg = this.resolveHostConfig();
      const restppPort = String(
        toPortNumber(this.config.restpp_port)
        || (hostCfg.isCloud ? 443 : 9000)
      );
      const gsqlPort = String(
        toPortNumber(this.config.gsql_port)
        || hostCfg.embeddedPort
        || (hostCfg.isCloud ? 443 : 14240)
      );
      const tgCloud = this.config.tgcloud !== undefined
        ? String(this.config.tgcloud)
        : String(hostCfg.isCloud);

      const env = {
        ...process.env,
        TG_HOST: hostCfg.baseHost,
        TG_GRAPHNAME: this.config.graph_name || '',
        TG_JWT_TOKEN: this.jwtToken,
        TG_TGCLOUD: tgCloud,
        TG_RESTPP_PORT: restppPort,
        // Set both aliases for compatibility across MCP / pyTigerGraph variants.
        TG_GS_PORT: gsqlPort,
        TG_GSQL_PORT: gsqlPort,
        PYTHONUNBUFFERED: '1',
      };
      console.log(`[TG-MCP] connect config host=${hostCfg.baseHost} restpp=${restppPort} gsql=${gsqlPort} cloud=${tgCloud}`);

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

            if (!this.config.graph_name) {
              await this.autoDiscoverGraph();
            }

            resolve(true);
          } catch (err) {
            reject(err);
          }
        }, MCP_STARTUP_DELAY_MS);

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
      }, REQUEST_TIMEOUT_MS);

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
      clientInfo: { name: 'tigergraph-devhub', version: '3.0.0' },
    });
  }

  async callTool(toolName, args = {}) {
    if (!this.initialized) {
      throw new Error('MCP not initialized. Call connect() first.');
    }
    return this.sendRequest('tools/call', { name: toolName, arguments: args });
  }

  async autoDiscoverGraph() {
    try {
      const result = await this.sendRequest('tools/call', {
        name: 'tigergraph__list_graphs',
        arguments: {},
      });
      const data = this.parseResponse(result);
      const graphs = Array.isArray(data) ? data
        : (data?.graphs || data?.graph_names || []);

      if (graphs.length > 0) {
        this.config.graph_name = graphs[0];
        console.log(`[TG-MCP] Auto-discovered graph: ${this.config.graph_name}`);
      } else {
        console.warn('[TG-MCP] No graphs found on server');
      }
    } catch (err) {
      console.warn('[TG-MCP] Auto-discover graph failed:', err.message);
    }
  }

  /**
   * Parses the pyTigerGraph MCP response envelope.
   * The MCP can return either pure JSON or markdown-wrapped JSON.
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

  // ==================== Cache helpers ====================

  _isCacheValid(cache) {
    return cache && (Date.now() - cache.timestamp < CACHE_TTL_MS);
  }

  getCachedSchema() {
    return this._isCacheValid(this._schemaCache) ? this._schemaCache.value : null;
  }

  getCachedStats() {
    return this._isCacheValid(this._statsCache) ? this._statsCache.value : null;
  }

  invalidateCache() {
    this._schemaCache = null;
    this._statsCache = null;
  }

  // ==================== Schema & Stats ====================

  async getSchema({ skipCache = false } = {}) {
    if (!skipCache && this._isCacheValid(this._schemaCache)) {
      return this._schemaCache.value;
    }

    try {
      const result = await this.callTool('tigergraph__get_graph_schema', {
        graph_name: this.config.graph_name || undefined,
      });
      const data = this.parseResponse(result);
      const schema = data?.schema || data;
      this._schemaCache = { value: schema, timestamp: Date.now() };
      return schema;
    } catch (error) {
      console.error('[TG-MCP] getSchema error:', error.message);
      try {
        const fallbackResult = await this.callTool('tigergraph__show_graph_details', {
          graph_name: this.config.graph_name || undefined,
          detail_type: 'schema',
        });
        const fallback = this.parseResponse(fallbackResult);
        let schema;
        if (fallback?.schema) {
          schema = fallback.schema;
        } else if (typeof fallback === 'string') {
          schema = {
            GraphName: this.config.graph_name || 'default',
            raw_schema: fallback,
            degraded: true,
          };
        } else {
          schema = fallback;
        }
        this._schemaCache = { value: schema, timestamp: Date.now() };
        return schema;
      } catch (fallbackError) {
        console.error('[TG-MCP] getSchema fallback also failed:', fallbackError.message);
        throw error;
      }
    }
  }

  async _getVertexCountRaw(vertexType) {
    const args = {};
    if (vertexType) args.vertex_type = vertexType;
    if (this.config.graph_name) args.graph_name = this.config.graph_name;
    const result = await this.callTool('tigergraph__get_vertex_count', args);
    return this.parseResponse(result);
  }

  async _getEdgeCountRaw(edgeType) {
    const args = {};
    if (edgeType) args.edge_type = edgeType;
    if (this.config.graph_name) args.graph_name = this.config.graph_name;
    const result = await this.callTool('tigergraph__get_edge_count', args);
    return this.parseResponse(result);
  }

  async getVertexCount(vertexType) {
    try {
      return await this._getVertexCountRaw(vertexType);
    } catch (error) {
      console.error('[TG-MCP] getVertexCount error:', error.message);
      throw error;
    }
  }

  async getEdgeCount(edgeType) {
    try {
      return await this._getEdgeCountRaw(edgeType);
    } catch (error) {
      console.error('[TG-MCP] getEdgeCount error:', error.message);
      throw error;
    }
  }

  async getStatistics({ skipCache = false } = {}) {
    if (!skipCache && this._isCacheValid(this._statsCache)) {
      return this._statsCache.value;
    }

    const timeoutRejection = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Stats fetch timed out')), STATS_TIMEOUT_MS)
    );

    try {
      const [vertexRes, edgeRes] = await Promise.race([
        Promise.allSettled([
          this._getVertexCountRaw(),
          this._getEdgeCountRaw(),
        ]),
        timeoutRejection.then(() => {
          throw new Error('Stats fetch timed out');
        }),
      ]);

      const vertexData = vertexRes.status === 'fulfilled' ? vertexRes.value : 0;
      const edgeData = edgeRes.status === 'fulfilled' ? edgeRes.value : 0;

      const vertexCount = typeof vertexData === 'number' ? vertexData
        : (vertexData?.total ?? vertexData?.count ?? 0);
      const edgeCount = typeof edgeData === 'number' ? edgeData
        : (edgeData?.total ?? edgeData?.count ?? 0);

      const stats = {
        vertexCount,
        edgeCount,
        degraded: vertexRes.status === 'rejected' || edgeRes.status === 'rejected',
      };
      this._statsCache = { value: stats, timestamp: Date.now() };
      return stats;
    } catch (error) {
      console.warn('[TG-MCP] getStatistics failed (non-fatal):', error.message);
      const degraded = { vertexCount: 0, edgeCount: 0, degraded: true };
      this._statsCache = { value: degraded, timestamp: Date.now() };
      return degraded;
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

  async installQueryViaGSQL(queryText) {
    try {
      const graphName = this.config.graph_name;
      if (!graphName) throw new Error('graph_name is required to install queries');

      const { queryName, createQueryBlock } = this.extractInstallableQuery(queryText);
      const command = `USE GRAPH ${graphName}\n${createQueryBlock}\nINSTALL QUERY ${queryName}`;

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

  extractInstallableQuery(rawQueryText) {
    const source = String(rawQueryText || '');
    const fenceMatch = source.match(/```(?:gsql|sql)?\s*\n([\s\S]*?)```/i);
    const text = (fenceMatch ? fenceMatch[1] : source).trim();
    if (!text) {
      throw new Error('query_text is empty. Provide a CREATE QUERY statement.');
    }

    const createRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?(?:DISTRIBUTED\s+)?QUERY\s+([A-Za-z_]\w*)/i;
    const createMatch = createRegex.exec(text);
    if (!createMatch || createMatch.index === undefined) {
      throw new Error('query_text must include a CREATE QUERY statement.');
    }

    const queryName = createMatch[1];
    const fromCreate = text.slice(createMatch.index).trim();

    // Keep only the first CREATE QUERY block to avoid mixing admin commands
    // (e.g. USE GRAPH / DROP QUERY / INSTALL QUERY) from LLM-generated snippets.
    const firstBrace = fromCreate.indexOf('{');
    if (firstBrace < 0) {
      throw new Error(`CREATE QUERY ${queryName} is missing a body block.`);
    }

    let depth = 0;
    let endIndex = -1;
    for (let i = firstBrace; i < fromCreate.length; i += 1) {
      const ch = fromCreate[i];
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex < 0) {
      throw new Error(`CREATE QUERY ${queryName} has an unbalanced body block.`);
    }

    const createQueryBlock = fromCreate.slice(0, endIndex + 1).trim();
    return { queryName, createQueryBlock };
  }

  getJWTToken() {
    return this.jwtToken;
  }

  getGraphName() {
    return this.config.graph_name;
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
