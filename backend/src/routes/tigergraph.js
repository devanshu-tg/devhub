const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { encrypt, decrypt, isEncryptionConfigured } = require('../utils/encryption');
const TigerGraphMCPService = require('../services/tigergraph-mcp');
const { authenticate } = require('../middleware/auth');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mcpConnections = new Map();

function getMCPConnection(userId) {
  return mcpConnections.get(userId);
}

async function setMCPConnection(userId, connection) {
  const existing = mcpConnections.get(userId);
  if (existing) {
    existing.disconnect();
  }
  mcpConnections.set(userId, connection);
}

function removeMCPConnection(userId) {
  const existing = mcpConnections.get(userId);
  if (existing) {
    existing.disconnect();
    mcpConnections.delete(userId);
  }
}

// ==================== Connection Management ====================

router.post('/connect', authenticate, async (req, res) => {
  try {
    const { host, restpp_port, gsql_port, secret, graph_name, name, skipMCPValidation } = req.body;
    const userId = req.user.id;

    if (!host || !secret) {
      return res.status(400).json({ error: 'Host and secret are required' });
    }

    if (!isEncryptionConfigured()) {
      return res.status(500).json({ error: 'Encryption not configured on server' });
    }

    let mcpConnected = false;
    let mcpError = null;

    if (!skipMCPValidation) {
      const mcpService = new TigerGraphMCPService({
        host,
        restpp_port: restpp_port || 443,
        gsql_port: gsql_port || 443,
        secret,
        graph_name,
      });

      try {
        await mcpService.connect();
        await setMCPConnection(userId, mcpService);
        mcpConnected = true;
      } catch (error) {
        console.warn('MCP connection failed (non-fatal):', error.message);
        mcpError = error.message;
      }
    }

    const encryptedSecret = encrypt(secret);

    const { data: existingConn } = await supabase
      .from('user_tigergraph_connections')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name || 'Default')
      .single();

    let savedConnection;
    if (existingConn) {
      const { data, error } = await supabase
        .from('user_tigergraph_connections')
        .update({
          host,
          restpp_port: restpp_port || 443,
          gsql_port: gsql_port || 443,
          secret_encrypted: encryptedSecret,
          graph_name,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConn.id)
        .select()
        .single();

      if (error) throw error;
      savedConnection = data;
    } else {
      const { data, error } = await supabase
        .from('user_tigergraph_connections')
        .insert({
          user_id: userId,
          name: name || 'Default',
          host,
          restpp_port: restpp_port || 443,
          gsql_port: gsql_port || 443,
          secret_encrypted: encryptedSecret,
          graph_name,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      savedConnection = data;
    }

    res.json({
      success: true,
      mcpConnected,
      mcpError: mcpError || undefined,
      connection: {
        id: savedConnection.id,
        name: savedConnection.name,
        host: savedConnection.host,
        graph_name: savedConnection.graph_name,
        is_active: savedConnection.is_active,
      },
    });
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({ error: 'Failed to save connection', details: error.message });
  }
});

router.get('/connections', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_tigergraph_connections')
      .select('id, name, host, restpp_port, gsql_port, graph_name, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const activeMCP = getMCPConnection(userId);
    const connectionsWithStatus = data.map(conn => ({
      ...conn,
      connected: !!activeMCP && conn.is_active,
    }));

    res.json({ connections: connectionsWithStatus });
  } catch (error) {
    console.error('List connections error:', error);
    res.status(500).json({ error: 'Failed to list connections' });
  }
});

router.post('/connections/:id/activate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: conn, error: fetchError } = await supabase
      .from('user_tigergraph_connections')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !conn) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const secret = decrypt(conn.secret_encrypted);

    const mcpService = new TigerGraphMCPService({
      host: conn.host,
      restpp_port: conn.restpp_port,
      gsql_port: conn.gsql_port,
      secret,
      graph_name: conn.graph_name,
    });

    try {
      await mcpService.connect();
    } catch (error) {
      return res.status(400).json({
        error: 'Failed to reconnect to TigerGraph',
        details: error.message,
      });
    }

    await supabase
      .from('user_tigergraph_connections')
      .update({ is_active: false })
      .eq('user_id', userId);

    const { error: updateError } = await supabase
      .from('user_tigergraph_connections')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    await setMCPConnection(userId, mcpService);

    res.json({ success: true, connection_id: id });
  } catch (error) {
    console.error('Activate connection error:', error);
    res.status(500).json({ error: 'Failed to activate connection' });
  }
});

router.delete('/connections/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: conn, error: fetchError } = await supabase
      .from('user_tigergraph_connections')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !conn) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    if (conn.is_active) {
      removeMCPConnection(userId);
    }

    const { error } = await supabase
      .from('user_tigergraph_connections')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

router.post('/disconnect', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    removeMCPConnection(userId);

    await supabase
      .from('user_tigergraph_connections')
      .update({ is_active: false })
      .eq('user_id', userId);

    res.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

// ==================== Schema, Stats, Metadata ====================

router.get('/schema', authenticate, async (req, res) => {
  try {
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });

    const schema = await mcpService.getSchema();
    res.json({ schema });
  } catch (error) {
    console.error('Get schema error:', error);
    res.status(500).json({ error: 'Failed to get schema', details: error.message });
  }
});

router.get('/statistics', authenticate, async (req, res) => {
  try {
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });

    const stats = await mcpService.getStatistics();
    res.json({ statistics: stats });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics', details: error.message });
  }
});

router.get('/metadata', authenticate, async (req, res) => {
  try {
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });

    const metadata = await mcpService.listMetadata();
    res.json({ metadata });
  } catch (error) {
    console.error('Get metadata error:', error);
    res.status(500).json({ error: 'Failed to get metadata', details: error.message });
  }
});

router.get('/nodes/:nodeType', authenticate, async (req, res) => {
  try {
    const { nodeType } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });

    const nodes = await mcpService.getNodes(nodeType, limit);
    res.json({ nodes });
  } catch (error) {
    console.error('Get nodes error:', error);
    res.status(500).json({ error: 'Failed to get nodes', details: error.message });
  }
});

// ==================== Graphs ====================

router.get('/graphs', authenticate, async (req, res) => {
  try {
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });

    const data = await mcpService.listGraphs();
    res.json({ graphs: data?.graphs || data || [] });
  } catch (error) {
    console.error('List graphs error:', error);
    res.status(500).json({ error: 'Failed to list graphs', details: error.message });
  }
});

// ==================== Query Operations ====================

router.get('/queries', authenticate, async (req, res) => {
  try {
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });

    const metadata = await mcpService.listMetadata();
    res.json({ queries: metadata });
  } catch (error) {
    console.error('Get queries error:', error);
    res.status(500).json({ error: 'Failed to get queries', details: error.message });
  }
});

router.post('/query/run', authenticate, async (req, res) => {
  try {
    const { query_name, params } = req.body;
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });
    if (!query_name) return res.status(400).json({ error: 'Query name is required' });

    const result = await mcpService.runInstalledQuery(query_name, params || {});
    res.json({ result });
  } catch (error) {
    console.error('Run query error:', error);
    res.status(500).json({ error: 'Failed to run query', details: error.message });
  }
});

router.post('/query/interpreted', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const result = await mcpService.runInterpretedQuery(query);
    res.json({ result });
  } catch (error) {
    console.error('Run interpreted query error:', error);
    res.status(500).json({ error: 'Failed to run interpreted query', details: error.message });
  }
});

router.post('/query/create', authenticate, async (req, res) => {
  try {
    const { query } = req.body;
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const result = await mcpService.gsql(query);
    res.json({ result });
  } catch (error) {
    console.error('Create query error:', error);
    res.status(500).json({ error: 'Failed to create query', details: error.message });
  }
});

router.post('/query/install', authenticate, async (req, res) => {
  try {
    const { query_text } = req.body;
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });
    if (!query_text) return res.status(400).json({ error: 'query_text is required' });

    const result = await mcpService.installQueryViaGSQL(query_text);
    res.json({ success: true, queryName: result.queryName, result: result.result });
  } catch (error) {
    console.error('Install query error:', error);
    res.status(500).json({ error: 'Failed to install query', details: error.message });
  }
});

router.post('/query/install-and-run', authenticate, async (req, res) => {
  try {
    const { query_text, params } = req.body;
    const mcpService = getMCPConnection(req.user.id);
    if (!mcpService) return res.status(400).json({ error: 'Not connected to TigerGraph' });
    if (!query_text) return res.status(400).json({ error: 'query_text is required' });

    const startTime = Date.now();

    const installResult = await mcpService.installQueryViaGSQL(query_text);
    const queryName = installResult.queryName;

    let runResult = null;
    let runError = null;
    try {
      runResult = await mcpService.runInstalledQuery(queryName, params || {});
    } catch (err) {
      runError = err.message;
    }

    const elapsed = Date.now() - startTime;

    res.json({
      success: true,
      queryName,
      installResult: installResult.result,
      runResult,
      runError: runError || undefined,
      elapsed,
    });
  } catch (error) {
    console.error('Install-and-run error:', error);
    res.status(500).json({ error: 'Failed to install and run query', details: error.message });
  }
});

router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const mcpService = getMCPConnection(userId);

    const { data: activeConn } = await supabase
      .from('user_tigergraph_connections')
      .select('id, name, host, graph_name')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    res.json({
      connected: !!mcpService,
      connection: activeConn || null,
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

module.exports = router;
module.exports.getMCPConnection = getMCPConnection;
