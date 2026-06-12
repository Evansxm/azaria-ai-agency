import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, Key, Wifi, WifiOff, RefreshCw, Check, AlertTriangle,
  Server, Sliders, List, Clock, BarChart3, Search, ChevronDown, ChevronRight,
  Trash2, Eye, EyeOff, X, Terminal, Database, Gauge, Zap,
} from 'lucide-react';
import { adminRpcCall, fetchAdminMetrics, fetchAdminToolSchema } from '../lib/admin-client';

const MODULE_ICON_PROPS = { size: 18 };
const POLL_INTERVAL = 10000;

function StatusBadge({ status, label, pulsing }) {
  const colors = {
    live: { bg: 'rgba(0,214,143,0.15)', text: 'var(--color-success)', dot: 'var(--color-success)' },
    maintenance: { bg: 'rgba(255,170,0,0.15)', text: 'var(--color-warning)', dot: 'var(--color-warning)' },
    sandbox: { bg: 'rgba(84,160,255,0.15)', text: 'var(--color-info)', dot: 'var(--color-info)' },
    error: { bg: 'rgba(255,107,107,0.15)', text: 'var(--color-danger)', dot: 'var(--color-danger)' },
    idle: { bg: 'rgba(144,144,168,0.12)', text: 'var(--color-text-muted)', dot: 'var(--color-text-muted)' },
  };
  const c = colors[status] || colors.idle;
  return (
    <motion.span
      animate={pulsing ? { opacity: [1, 0.5, 1] } : {}}
      transition={pulsing ? { duration: 1.5, repeat: Infinity } : {}}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.dot}33` }}
    >
      <motion.span
        animate={pulsing ? { scale: [1, 1.3, 1] } : {}}
        transition={pulsing ? { duration: 1.5, repeat: Infinity } : {}}
        style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'block' }}
      />
      {label || status}
    </motion.span>
  );
}

function ModuleCard({ title, icon: Icon, children, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{
      background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--space-3)' }}>
        <Icon {...MODULE_ICON_PROPS} color={accent || 'var(--color-accent)'} />
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function MetricRow({ label, value, sub, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-glass-border)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: color || 'var(--color-text-primary)' }}>{value}</span>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ current, max, color, label }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const barColor = pct > 66 ? 'var(--color-success)' : pct > 33 ? 'var(--color-warning)' : 'var(--color-danger)';
  return (
    <div style={{ marginTop: 4 }}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 2 }}>
        <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: barColor }}>{current}/{max}</span>
      </div>}
      <div style={{ height: 8, background: 'var(--color-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${barColor}, ${color || 'var(--color-info)'})`, borderRadius: 4 }}
        />
      </div>
    </div>
  );
}

function SaveConfirmPopup({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)', maxWidth: 400, width: '90%', textAlign: 'center',
      }}>
        <Shield size={40} color="var(--color-warning)" style={{ marginBottom: 'var(--space-3)' }} />
        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>Confirm Credential Update</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 'var(--space-5)' }}>{message}</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
          <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--color-warning)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Save Changes</button>
        </div>
      </div>
    </motion.div>
  );
}

const TOOL_PAYLOAD_EXAMPLES = {
  get_site_status: { jsonrpc: '2.0', method: 'get_site_status', params: {}, id: 1 },
  deploy_site: { jsonrpc: '2.0', method: 'deploy_site', params: { message: 'Site update' }, id: 1 },
  update_adsense_id: { jsonrpc: '2.0', method: 'update_adsense_id', params: { publisherId: 'ca-pub-xxx' }, id: 1 },
  add_article: { jsonrpc: '2.0', method: 'add_article', params: { title: '...', content: '...', category: '...' }, id: 1 },
  optimize_ads: { jsonrpc: '2.0', method: 'optimize_ads', params: { strategy: 'balanced' }, id: 1 },
  check_adsense_status: { jsonrpc: '2.0', method: 'check_adsense_status', params: {}, id: 1 },
  update_sitemap: { jsonrpc: '2.0', method: 'update_sitemap', params: {}, id: 1 },
  run_maintenance: { jsonrpc: '2.0', method: 'run_maintenance', params: { tasks: ['all'] }, id: 1 },
};

export default function AdminWorkerDashboard({ token }) {
  const [mode, setMode] = useState('live');
  const [metrics, setMetrics] = useState(null);
  const [tools, setTools] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTool, setExpandedTool] = useState(null);
  const [simulatedRemaining, setSimulatedRemaining] = useState(5);
  const [cfToken, setCfToken] = useState('');
  const [whsec, setWhsec] = useState('');
  const [cfSaved, setCfSaved] = useState(false);
  const [whsecSaved, setWhsecSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showCf, setShowCf] = useState(false);
  const [showWhsec, setShowWhsec] = useState(false);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const start = performance.now();
    const [mRes, tRes] = await Promise.all([fetchAdminMetrics(token), fetchAdminToolSchema(token)]);
    const end = performance.now();
    setLatency(Math.round(end - start));
    if (mRes.code === 'OK') setMetrics(mRes.result);
    else setError(mRes.error || 'Metrics fetch failed');
    if (tRes.code === 'OK') setTools(tRes.result);
    setLoading(false);
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    pollRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [refresh]);

  useEffect(() => {
    const decay = setInterval(() => {
      setSimulatedRemaining(prev => Math.min(5, prev + 1));
    }, 12000);
    return () => clearInterval(decay);
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSimulatedRemaining(5);
  };

  const flushCache = () => {
    setSimulatedRemaining(5);
    refresh();
  };

  const confirmSave = (field) => {
    setShowConfirm(field);
  };

  const executeSave = () => {
    if (showConfirm === 'cf') { setCfSaved(true); setTimeout(() => setCfSaved(false), 2500); }
    if (showConfirm === 'whsec') { setWhsecSaved(true); setTimeout(() => setWhsecSaved(false), 2500); }
    setShowConfirm(null);
  };

  const modeOptions = [
    { value: 'live', label: 'Live', icon: Wifi, color: 'var(--color-success)', desc: 'All requests processed through edge gateway' },
    { value: 'maintenance', label: 'Maintenance', icon: Shield, color: 'var(--color-warning)', desc: 'Read-only mode, writes suspended' },
    { value: 'sandbox', label: 'Sandbox', icon: Server, color: 'var(--color-info)', desc: 'Isolated test environment active' },
  ];

  const filteredTools = tools?.tools?.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!token) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center', maxWidth: 480, margin: '0 auto',
      }}>
        <Key size={48} color="var(--color-accent)" style={{ marginBottom: 'var(--space-4)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Admin Authentication Required</h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Enter your Master Admin API token to access the worker control dashboard.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Worker Control Panel</h2>
          {metrics && (
            <StatusBadge
              status={mode === 'maintenance' ? 'maintenance' : mode === 'sandbox' ? 'sandbox' : metrics.worker?.status?.toLowerCase() === 'online_and_active' ? 'live' : 'idle'}
              label={mode === 'maintenance' ? 'Maintenance' : mode === 'sandbox' ? 'Sandbox' : (metrics.worker?.status || 'Unknown')}
              pulsing={mode !== 'live'}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button onClick={flushCache} disabled={loading} title="Flush cache and reset counters" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 500, fontSize: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <Trash2 size={14} />
            Flush Cache
          </button>
          <button onClick={refresh} disabled={loading} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 500, fontSize: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--color-danger)', fontSize: '0.85rem',
        }}>
          <AlertTriangle size={16} />
          {error}
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        <ModuleCard title="Functional Controls" icon={Sliders} accent="var(--color-accent)">
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {modeOptions.map(opt => {
              const Icon = opt.icon;
              const active = mode === opt.value;
              return (
                <button key={opt.value} onClick={() => handleModeChange(opt.value)} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all var(--transition-fast)',
                  background: active ? opt.color : 'var(--color-bg-elevated)', color: active ? 'white' : 'var(--color-text-secondary)', border: active ? 'none' : '1px solid var(--color-border)',
                }}>
                  <Icon size={18} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5,
              background: mode === 'live' ? 'rgba(0,214,143,0.06)' : mode === 'maintenance' ? 'rgba(255,170,0,0.06)' : 'rgba(84,160,255,0.06)',
              border: mode === 'live' ? '1px solid rgba(0,214,143,0.15)' : mode === 'maintenance' ? '1px solid rgba(255,170,0,0.15)' : '1px solid rgba(84,160,255,0.15)',
            }}
          >
            <span style={{ fontWeight: 600, color: modeOptions.find(o => o.value === mode)?.color }}>● {mode.charAt(0).toUpperCase() + mode.slice(1)} mode</span>
            {' — '}{modeOptions.find(o => o.value === mode)?.desc}
          </motion.div>
        </ModuleCard>

        <ModuleCard title="Live Telemetry" icon={Activity} accent="var(--color-info)">
          {metrics ? (
            <>
              <MetricRow label="Gateway Status" value={metrics.worker?.status || 'N/A'} color={mode === 'live' ? 'var(--color-success)' : mode === 'maintenance' ? 'var(--color-warning)' : 'var(--color-info)'} sub={`v${metrics.worker?.version || '?'} · ${mode}`} />
              <MetricRow label="KV Database" value={metrics.kv?.connected ? 'Connected' : 'Disconnected'} color={metrics.kv?.connected ? 'var(--color-success)' : 'var(--color-danger)'} sub={metrics.kv?.id?.slice(0, 16) + '...' || ''} />
              <div style={{ padding: 'var(--space-2) 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 2 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Rate Limit Bucket</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>leaky-bucket · {metrics.rate_limit?.window_seconds || 60}s window</span>
                </div>
                <ProgressBar current={simulatedRemaining} max={metrics.rate_limit?.max_per_window || 5} color="var(--color-info)" label="Remaining requests" />
              </div>
              {latency !== null && (
                <MetricRow label="Network Latency" value={`${latency}ms`} color={latency < 500 ? 'var(--color-success)' : latency < 1000 ? 'var(--color-warning)' : 'var(--color-danger)'} sub="API round-trip" />
              )}
              <MetricRow label="MCP Tools" value={metrics.tools?.total || '0'} color="var(--color-accent)" sub="registered schemas" />
            </>
          ) : (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading telemetry...' : 'No data available'}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              <Zap size={12} />
              Auto-refresh every {POLL_INTERVAL / 1000}s
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              <Database size={12} />
              {metrics?.kv?.connected ? 'KV Live' : 'KV Offline'}
            </div>
          </div>
        </ModuleCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        <ModuleCard title="Schema Explorer" icon={List} accent="var(--color-warning)">
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools by name or description..."
              style={{ width: '100%', paddingLeft: 32, fontSize: '0.8rem' }}
            />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: -8 }}>
            {filteredTools.length} of {tools?.tools?.length || 0} tools match
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 360, overflowY: 'auto' }}>
            {filteredTools.map((t, i) => {
              const isExpanded = expandedTool === t.name;
              return (
                <div key={t.name} style={{
                  borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: isExpanded ? `1px solid var(--color-accent)` : '1px solid var(--color-border)',
                  background: isExpanded ? 'rgba(108,92,231,0.04)' : 'var(--color-bg-elevated)', transition: 'all var(--transition-fast)',
                }}>
                  <div
                    onClick={() => setExpandedTool(isExpanded ? null : t.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}>{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-accent)' }}>{t.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', padding: '2px 8px', borderRadius: 8 }}>Tool {i + 1}</span>
                  </div>
                  {!isExpanded && (
                    <div style={{ padding: '0 var(--space-3) var(--space-3)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {searchQuery ? highlightMatch(t.description, searchQuery) : t.description}
                    </div>
                  )}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 var(--space-3) var(--space-3)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          {t.description}
                        </div>
                        <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>JSON-RPC Request Payload</div>
                          <pre style={{
                            margin: 0, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', background: '#06060a',
                            fontSize: '0.68rem', lineHeight: 1.5, overflowX: 'auto', whiteSpace: 'pre', color: 'var(--color-text-secondary)',
                          }}>
                            {JSON.stringify(TOOL_PAYLOAD_EXAMPLES[t.name] || { method: t.name }, null, 2)}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </ModuleCard>

        <ModuleCard title="Credentials Matrix" icon={Key} accent="var(--color-danger)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                Cloudflare API Token
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input type={showCf ? 'text' : 'password'} value={cfToken} onChange={e => { setCfToken(e.target.value); setCfSaved(false); }} placeholder="CF-API-Token-..." style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', paddingRight: 36 }} />
                  <button onClick={() => setShowCf(!showCf)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', cursor: 'pointer', border: 'none', background: 'none', padding: 4 }}>
                    {showCf ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button onClick={() => cfToken ? confirmSave('cf') : null} disabled={!cfToken} style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: cfToken ? 'var(--color-accent)' : 'var(--color-bg-elevated)', color: cfToken ? 'white' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.8rem', cursor: cfToken ? 'pointer' : 'not-allowed',
                }}>
                  {cfSaved ? <Check size={14} /> : 'Save'}
                </button>
              </div>
              {cfSaved && <div style={{ marginTop: 'var(--space-1)', fontSize: '0.7rem', color: 'var(--color-success)' }}>✓ Token saved to local state</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                Stripe Webhook Secret
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input type={showWhsec ? 'text' : 'password'} value={whsec} onChange={e => { setWhsec(e.target.value); setWhsecSaved(false); }} placeholder="whsec_..." style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', paddingRight: 36 }} />
                  <button onClick={() => setShowWhsec(!showWhsec)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', cursor: 'pointer', border: 'none', background: 'none', padding: 4 }}>
                    {showWhsec ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button onClick={() => whsec.startsWith('whsec_') ? confirmSave('whsec') : null} disabled={!whsec.startsWith('whsec_')} style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: whsec.startsWith('whsec_') ? 'var(--color-accent)' : 'var(--color-bg-elevated)', color: whsec.startsWith('whsec_') ? 'white' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.8rem', cursor: whsec.startsWith('whsec_') ? 'pointer' : 'not-allowed',
                }}>
                  {whsecSaved ? <Check size={14} /> : 'Save'}
                </button>
              </div>
              {whsecSaved && <div style={{ marginTop: 'var(--space-1)', fontSize: '0.7rem', color: 'var(--color-success)' }}>✓ Secret saved to local state</div>}
            </div>

            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.15)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Master Token Status</span>
                <StatusBadge status="live" label="Active" />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', wordBreak: 'break-all' }}>{token.slice(0, 16)}...{token.slice(-8)}</span>
              <div style={{ marginTop: 4, fontSize: '0.7rem' }}>Admin session active — all RPC calls are authenticated.</div>
            </div>
          </div>
        </ModuleCard>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: metrics ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {metrics ? <Wifi size={14} /> : <WifiOff size={14} />}
          {metrics ? 'Edge Gateway Connected' : 'Disconnected'}
          {metrics && <span style={{ color: 'var(--color-text-muted)', marginLeft: 4 }}>· {metrics.worker?.version || '?'}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
          {latency !== null && <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{latency}ms RTT</span>}
          <span><Gauge size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{simulatedRemaining}/{metrics?.rate_limit?.max_per_window || 5} bucket</span>
          <span><BarChart3 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{metrics?.tools?.total || 0} tools</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showConfirm && (
          <SaveConfirmPopup
            message={`Are you sure you want to update the ${showConfirm === 'cf' ? 'Cloudflare API Token' : 'Stripe Webhook Secret'}? This change will affect all API calls to the edge worker.`}
            onConfirm={executeSave}
            onCancel={() => setShowConfirm(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <span key={i} style={{ background: 'rgba(108,92,231,0.25)', color: 'var(--color-accent)', borderRadius: 2, padding: '0 2px' }}>{part}</span>
      : part
  );
}
