'use client';

import { useState, useEffect } from 'react';
import { X, Database, Loader2, Check, AlertCircle, Trash2, ChevronDown } from 'lucide-react';
import {
  connectTigerGraph,
  getTigerGraphConnections,
  deleteTigerGraphConnection,
  activateTigerGraphConnection,
  disconnectTigerGraph,
  getTigerGraphGraphs,
  TigerGraphConnection,
} from '@/lib/api';

interface TigerGraphConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connection: TigerGraphConnection | null) => void;
  currentConnection?: TigerGraphConnection | null;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

export default function TigerGraphConnectModal({
  isOpen,
  onClose,
  onConnect,
  currentConnection,
  isAuthenticated = false,
  onRequireAuth,
}: TigerGraphConnectModalProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'saved'>('new');
  const [connections, setConnections] = useState<TigerGraphConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [availableGraphs, setAvailableGraphs] = useState<string[]>([]);
  const [graphsLoading, setGraphsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Default',
    host: '',
    restpp_port: '',
    gsql_port: '',
    secret: '',
    graph_name: '',
  });

  const isLikelyCloudHost = (host: string) => {
    const value = host.toLowerCase();
    return value.includes('tgcloud.io') || value.includes('savanna') || value.includes('.i.tgcloud.io');
  };

  const toPortNumber = (value: string) => {
    if (!value?.trim()) return null;
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 65535) return null;
    return parsed;
  };

  const normalizeConnectionInput = () => {
    const hostInput = formData.host.trim();
    if (!hostInput) {
      throw new Error('Host is required');
    }

    const withProtocol = /^https?:\/\//i.test(hostInput)
      ? hostInput
      : `http://${hostInput}`;
    const parsed = new URL(withProtocol);
    const isCloud = isLikelyCloudHost(parsed.hostname);
    const embeddedPort = toPortNumber(parsed.port);
    const normalizedHost = `${parsed.protocol || (isCloud ? 'https:' : 'http:')}//${parsed.hostname}`;

    let restppPort = toPortNumber(formData.restpp_port);
    let gsqlPort = toPortNumber(formData.gsql_port);

    if (restppPort == null && gsqlPort == null && embeddedPort != null) {
      if (embeddedPort === 9000 || embeddedPort === 14240) {
        restppPort = 9000;
        gsqlPort = 14240;
      } else {
        restppPort = embeddedPort;
        gsqlPort = embeddedPort;
      }
    }

    if (restppPort == null) restppPort = isCloud ? 443 : 9000;
    if (gsqlPort == null) gsqlPort = isCloud ? 443 : 14240;

    return {
      host: normalizedHost,
      restpp_port: restppPort,
      gsql_port: gsqlPort,
      secret: formData.secret.trim(),
      graph_name: formData.graph_name || undefined,
    };
  };

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen]);

  const loadConnections = async () => {
    const conns = await getTigerGraphConnections();
    setConnections(conns);
    if (conns.length > 0) {
      setActiveTab('saved');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const fetchAvailableGraphs = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to use TigerGraph connection tools.');
      onRequireAuth?.();
      return;
    }
    if (!formData.host || !formData.secret) {
      setError('Enter host and secret first, then fetch graphs');
      return;
    }

    setGraphsLoading(true);
    setError(null);

    try {
      const normalized = normalizeConnectionInput();
      const result = await connectTigerGraph({
        host: normalized.host,
        restpp_port: normalized.restpp_port,
        gsql_port: normalized.gsql_port,
        secret: normalized.secret,
        graph_name: normalized.graph_name,
        name: '__temp_graph_fetch__',
      });

      if (!result.success) {
        setError(result.error || 'Failed to connect');
        setGraphsLoading(false);
        return;
      }

      const graphs = await getTigerGraphGraphs();
      setAvailableGraphs(graphs);

      if (graphs.length > 0 && !formData.graph_name) {
        setFormData((prev) => ({ ...prev, graph_name: graphs[0] }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch graphs');
    } finally {
      setGraphsLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in before connecting to TigerGraph.');
      onRequireAuth?.();
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.host || !formData.secret) {
      setError('Host and Secret are required');
      setLoading(false);
      return;
    }

    let normalized;
    try {
      normalized = normalizeConnectionInput();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Invalid connection details');
      return;
    }

    const result = await connectTigerGraph({
      host: normalized.host,
      restpp_port: normalized.restpp_port,
      gsql_port: normalized.gsql_port,
      secret: normalized.secret,
      graph_name: normalized.graph_name,
      name: formData.name,
    });

    setLoading(false);

    if (result.success && result.connection) {
      if ((result as any).mcpConnected) {
        setSuccess('Connected successfully with live MCP!');
      } else if ((result as any).mcpError) {
        setSuccess(`Connection saved! Note: MCP not available (${(result as any).mcpError}).`);
      } else {
        setSuccess('Connection saved successfully!');
      }
      onConnect(result.connection);
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } else {
      setError(result.error || 'Failed to connect');
    }
  };

  const handleActivateConnection = async (connectionId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in before activating a saved TigerGraph connection.');
      onRequireAuth?.();
      return;
    }
    setLoading(true);
    setError(null);

    const result = await activateTigerGraphConnection(connectionId);

    if (result.success) {
      const updatedConnections = await getTigerGraphConnections();
      setConnections(updatedConnections);
      const activeConn = updatedConnections.find((c) => c.id === connectionId);
      if (activeConn) {
        setSuccess('Connection activated!');
        onConnect(activeConn);
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1000);
      }
    } else {
      setError(result.error || 'Failed to activate connection');
    }

    setLoading(false);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this connection?')) return;

    const result = await deleteTigerGraphConnection(connectionId);

    if (result.success) {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    } else {
      setError(result.error || 'Failed to delete connection');
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await disconnectTigerGraph();
    onConnect(null);
    await loadConnections();
    setLoading(false);
  };

  if (!isOpen) return null;

  const inputClasses =
    'w-full rounded-lg bg-themed-tertiary border border-themed px-4 py-2 text-themed placeholder:text-themed-muted focus:border-tiger-orange focus:outline-none focus:ring-1 focus:ring-tiger-orange/30 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-themed-secondary border border-themed shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-themed px-6 py-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-tiger-orange" />
            <h2 className="text-lg font-semibold text-themed">Connect TigerGraph</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-themed-muted hover:bg-themed-tertiary hover:text-themed transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Connection Banner */}
        {currentConnection && (
          <div className="mx-6 mt-4 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-400">
                  Connected to <span className="font-medium">{currentConnection.host}</span>
                  {currentConnection.graph_name && (
                    <span className="text-green-500/70"> / {currentConnection.graph_name}</span>
                  )}
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-themed px-6 pt-4">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-tiger-orange text-tiger-orange'
                : 'border-transparent text-themed-muted hover:text-themed'
            }`}
          >
            New Connection
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-tiger-orange text-tiger-orange'
                : 'border-transparent text-themed-muted hover:text-themed'
            }`}
          >
            Saved ({connections.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 p-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-400">{success}</span>
            </div>
          )}

          {activeTab === 'new' ? (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-themed-secondary mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="My TigerGraph Instance"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-themed-secondary mb-1">
                  Host <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleInputChange}
                  placeholder="https://your-instance.i.tgcloud.io"
                  required
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-themed-secondary mb-1">
                    REST++ Port
                  </label>
                  <input
                    type="text"
                    name="restpp_port"
                    value={formData.restpp_port}
                    onChange={handleInputChange}
                    placeholder="9000 (on-prem) / 443 (cloud)"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-themed-secondary mb-1">
                    GSQL Port
                  </label>
                  <input
                    type="text"
                    name="gsql_port"
                    value={formData.gsql_port}
                    onChange={handleInputChange}
                    placeholder="14240 (on-prem) / 443 (cloud)"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-themed-secondary mb-1">
                  Secret <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="secret"
                  value={formData.secret}
                  onChange={handleInputChange}
                  placeholder="Your TigerGraph secret"
                  required
                  className={inputClasses}
                />
                <p className="mt-1 text-xs text-themed-muted">
                  Generate a secret in TigerGraph Admin Portal &gt; Management &gt; Users
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-themed-secondary">
                    Graph Name
                  </label>
                  <button
                    type="button"
                    onClick={fetchAvailableGraphs}
                    disabled={graphsLoading || !formData.host || !formData.secret}
                    className="text-xs text-tiger-orange hover:text-tiger-orange-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    {graphsLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Database className="w-3 h-3" />
                    )}
                    Fetch Graphs
                  </button>
                </div>

                {availableGraphs.length > 0 ? (
                  <div className="relative">
                    <select
                      name="graph_name"
                      value={formData.graph_name}
                      onChange={handleInputChange}
                      className={`${inputClasses} appearance-none pr-10`}
                    >
                      <option value="">Select a graph...</option>
                      {availableGraphs.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-themed-muted pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    name="graph_name"
                    value={formData.graph_name}
                    onChange={handleInputChange}
                    placeholder="MyGraph (optional — or click Fetch Graphs)"
                    className={inputClasses}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isAuthenticated}
                className="w-full rounded-lg bg-tiger-orange px-4 py-3 font-medium text-white hover:bg-tiger-orange-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  !isAuthenticated ? (
                    <>
                      <Database className="h-4 w-4" />
                      Sign in to connect
                    </>
                  ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Connect
                  </>
                  )
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {connections.length === 0 ? (
                <div className="text-center py-8 text-themed-muted">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No saved connections</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="mt-2 text-tiger-orange hover:text-tiger-orange-light text-sm"
                  >
                    Create your first connection
                  </button>
                </div>
              ) : (
                connections.map((conn) => (
                  <div
                    key={conn.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      conn.is_active && conn.connected
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-themed bg-themed-tertiary/30 hover:bg-themed-tertiary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-themed">{conn.name}</span>
                          {conn.is_active && conn.connected && (
                            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-themed-secondary mt-0.5">{conn.host}</p>
                        {conn.graph_name && (
                          <p className="text-xs text-themed-muted">Graph: {conn.graph_name}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!(conn.is_active && conn.connected) && (
                          <button
                            onClick={() => handleActivateConnection(conn.id)}
                            disabled={loading}
                            className="rounded-lg bg-tiger-orange/20 px-3 py-1.5 text-sm text-tiger-orange hover:bg-tiger-orange/30 transition-colors disabled:opacity-50"
                          >
                            Connect
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteConnection(conn.id)}
                          className="rounded-lg p-1.5 text-themed-muted hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
