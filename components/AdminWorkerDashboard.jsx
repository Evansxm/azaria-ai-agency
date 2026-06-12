import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Database, Key, Wifi, WifiOff, RefreshCw, Check, AlertTriangle, Server, Sliders, List, Clock, BarChart3 } from 'lucide-react';
import { adminRpcCall, fetchAdminMetrics, fetchAdminToolSchema } from '../lib/admin-client';

const MODULE_ICON_PROPS = { size: 18 };

function StatusBadge({ status, label }) {
  const colors = {
    live: { bg: 'rgba(0,214,143,0.12)', text: 'var(--color-success)', dot: 'var(--color-success)' },
    maintenance: { bg: 'rgba(255,170,0,0.12)', text: 'var(--color-warning)', dot: 'var(--color-warning)' },
    sandbox: { bg: 'rgba(84,160,255,0.12)', text: 'var(--color-info)', dot: 'var(--color-info)' },
    error: { bg: 'rgba(255,107,107,0.12)', text: 'var(--color-danger)', dot: 'var(--color-danger)' },
    idle: { bg: 'rgba(144,144,168,0.12)', text: 'var(--color-text-muted)', dot: 'var(--color-text-muted)' },
  };
  const c = colors[status] || colors.idle;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.text }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {label || status}
    </span>
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

function ProgressBar({ current, max, color }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  return (
    <div style={{ height: 6, background: 'var(--color-bg-elevated)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color || 'var(--color-accent)'}, ${color || 'var(--color-info)'})`, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function AdminWorkerDashboard({ token }) {
  const [mode, setMode] = useState('live');
  const [metrics, setMetrics] = useState(null);
  const [tools, setTools] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [webhookKey, setWebhookKey] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [latency, setLatency] = useState(null);

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

  const modeOptions = [
    { value: 'live', label: 'Live', icon: Wifi, color: 'var(--color-success)' },
    { value: 'maintenance', label: 'Maintenance', icon: Shield, color: 'var(--color-warning)' },
    { value: 'sandbox', label: 'Sandbox', icon: Server, color: 'var(--color-info)' },
  ];

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
          {metrics && <StatusBadge status={metrics.worker?.status?.toLowerCase() === 'online_and_active' ? 'live' : 'idle'} label={metrics.worker?.status || 'Unknown'} />}
        </div>
        <button onClick={refresh} disabled={loading} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 500, fontSize: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        <ModuleCard title="Functional Controls" icon={Sliders} accent="var(--color-accent)">
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {modeOptions.map(opt => {
              const Icon = opt.icon;
              const active = mode === opt.value;
              return (
                <button key={opt.value} onClick={() => setMode(opt.value)} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all var(--transition-fast)',
                  background: active ? opt.color : 'var(--color-bg-elevated)', color: active ? 'white' : 'var(--color-text-secondary)', border: active ? 'none' : '1px solid var(--color-border)',
                }}>
                  <Icon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'rgba(0,214,143,0.06)', border: '1px solid rgba(0,214,143,0.15)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Current mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            {' — '}All requests are being processed normally through the edge gateway.
          </div>
        </ModuleCard>

        <ModuleCard title="Live Telemetry" icon={Activity} accent="var(--color-info)">
          {metrics ? (
            <>
              <MetricRow label="Worker Status" value={metrics.worker?.status || 'N/A'} color="var(--color-success)" sub={`v${metrics.worker?.version || '?'}`} />
              <MetricRow label="KV Connection" value={metrics.kv?.connected ? 'Connected' : 'Disconnected'} color={metrics.kv?.connected ? 'var(--color-success)' : 'var(--color-danger)'} sub={metrics.kv?.id || ''} />
              <MetricRow label="Rate Limit" value={`${metrics.rate_limit?.max_per_window || '?'} req/${metrics.rate_limit?.window_seconds || '?'}s`} color="var(--color-warning)" sub={metrics.rate_limit?.algorithm || ''} />
              {latency !== null && <MetricRow label="Response Latency" value={`${latency}ms`} color={latency < 500 ? 'var(--color-success)' : latency < 1000 ? 'var(--color-warning)' : 'var(--color-danger)'} />}
              <MetricRow label="Tools Registered" value={metrics.tools?.total || '0'} sub="MCP schemas available" />
            </>
          ) : (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading telemetry...' : 'No data available'}
            </div>
          )}
        </ModuleCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        <ModuleCard title="Schema Explorer" icon={List} accent="var(--color-warning)">
          {tools && tools.tools ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 320, overflowY: 'auto' }}>
              {tools.tools.map((t, i) => (
                <div key={t.name} style={{
                  padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '0.78rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-accent)' }}>{t.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', padding: '1px 8px', borderRadius: 8 }}>Tool {i + 1}</span>
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{t.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {loading ? 'Loading schema...' : 'Run refresh to load tool schema'}
            </div>
          )}
        </ModuleCard>

        <ModuleCard title="Credentials Matrix" icon={Key} accent="var(--color-danger)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                Stripe Webhook Signing Secret
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input type="password" value={webhookKey} onChange={e => { setWebhookKey(e.target.value); setWebhookSaved(false); }} placeholder="whsec_..." style={{ flex: 1, fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }} />
                <button onClick={() => { setWebhookSaved(true); setTimeout(() => setWebhookSaved(false), 2000); }} disabled={!webhookKey.startsWith('whsec_')} style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: webhookKey.startsWith('whsec_') ? 'var(--color-accent)' : 'var(--color-bg-elevated)', color: webhookKey.startsWith('whsec_') ? 'white' : 'var(--color-text-muted)', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.8rem', cursor: webhookKey.startsWith('whsec_') ? 'pointer' : 'not-allowed',
                }}>
                  {webhookSaved ? <Check size={14} /> : 'Save'}
                </button>
              </div>
              {webhookSaved && <div style={{ marginTop: 'var(--space-1)', fontSize: '0.7rem', color: 'var(--color-success)' }}>✓ Secret saved to local state</div>}
            </div>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'rgba(108,92,231,0.06)', border: '1px solid rgba(108,92,231,0.15)', fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Master Token:</span>
              <span style={{ fontFamily: 'var(--font-mono)', marginLeft: 4 }}>{token.slice(0, 12)}...{token.slice(-6)}</span>
              <div style={{ marginTop: 4 }}>Admin session active — all RPC calls are authenticated.</div>
            </div>
          </div>
        </ModuleCard>
      </div>

      {/* Connection status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: metrics ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {metrics ? <Wifi size={14} /> : <WifiOff size={14} />}
          {metrics ? 'Edge Gateway Connected' : 'Disconnected'}
        </div>
        <div style={{ color: 'var(--color-text-muted)' }}>
          {latency !== null && <><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{latency}ms RTT</>}
          {metrics && <> · <BarChart3 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{metrics.tools?.total || 0} tools</>}
        </div>
      </div>
    </motion.div>
  );
}
