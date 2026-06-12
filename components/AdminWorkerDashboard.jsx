import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, Key, Wifi, WifiOff, RefreshCw, Check, AlertTriangle,
  Server, Sliders, List, Clock, BarChart3, Search, ChevronDown, ChevronRight,
  Eye, EyeOff, Terminal, Database, Gauge, Zap, Users, Grid, Plug, Code,
  Copy, MoreVertical, Plus, X, ToggleLeft, ToggleRight, ExternalLink,
  DollarSign, Cpu, Globe, CheckCircle, XCircle,
} from 'lucide-react';
import {
  fetchAdminMetrics, listTenants, createTenant, getTenantDetail,
  deactivateTenant, getMeteringReport, createIntegration, deleteIntegration,
  storeBYOK, deleteBYOK,
} from '../lib/admin-client';
import { fetchConnectionScript, BYOK_PROVIDERS } from '../lib/tenant-client';

const POLL_INTERVAL = 15000;

function StatusBadge({ status, label, pulsing }) {
  const colors = {
    live: { bg: 'rgba(0,214,143,0.15)', text: 'var(--color-success)', dot: 'var(--color-success)' },
    warning: { bg: 'rgba(255,170,0,0.15)', text: 'var(--color-warning)', dot: 'var(--color-warning)' },
    error: { bg: 'rgba(255,107,107,0.15)', text: 'var(--color-danger)', dot: 'var(--color-danger)' },
    idle: { bg: 'rgba(144,144,168,0.12)', text: 'var(--color-text-muted)', dot: 'var(--color-text-muted)' },
  };
  const c = colors[status] || colors.idle;
  return (
    <motion.span animate={pulsing ? { opacity: [1, 0.5, 1] } : {}} transition={pulsing ? { duration: 1.5, repeat: Infinity } : {}} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.dot}33` }}>
      <motion.span animate={pulsing ? { scale: [1, 1.3, 1] } : {}} transition={pulsing ? { duration: 1.5, repeat: Infinity } : {}} style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'block' }} />
      {label || status}
    </motion.span>
  );
}

function ModuleCard({ title, icon: Icon, children, accent, actions }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Icon size={18} color={accent || 'var(--color-accent)'} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</span>
        </div>
        {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
      </div>
      {children}
    </motion.div>
  );
}

function ProgressBar({ current, max, color, label }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const barColor = pct > 80 ? 'var(--color-danger)' : pct > 50 ? 'var(--color-warning)' : 'var(--color-success)';
  return (
    <div>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 2 }}><span style={{ color: 'var(--color-text-muted)' }}>{label}</span><span style={{ fontWeight: 600, color: barColor }}>{current}/{max}</span></div>}
      <div style={{ height: 6, background: 'var(--color-bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} style={{ height: '100%', background: `linear-gradient(90deg, ${barColor}, ${color || 'var(--color-info)'})`, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function TenantRow({ t, expanded, onToggle, onDetail }) {
  const usage = t.usage || {};
  const limits = t.tenant?.limits || { monthly_rpc_calls: 1000 };
  const rpcPct = limits.monthly_rpc_calls > 0 ? Math.round((usage.rpc_calls / limits.monthly_rpc_calls) * 100) : 0;
  return (
    <div style={{ borderRadius: 'var(--radius-sm)', border: expanded ? '1px solid var(--color-accent)' : '1px solid var(--color-border)', background: expanded ? 'rgba(108,92,231,0.03)' : 'var(--color-bg-elevated)', transition: 'all var(--transition-fast)' }}>
      <div onClick={() => onToggle(t.tenant.id)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}>{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
        <StatusBadge status={t.tenant.active ? 'live' : 'idle'} label={t.tenant.active ? 'Active' : 'Inactive'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.tenant.name}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{t.tenant.email} · {t.tenant.plan}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: rpcPct > 80 ? 'var(--color-danger)' : rpcPct > 50 ? 'var(--color-warning)' : 'var(--color-success)' }}>{usage.rpc_calls}/{limits.monthly_rpc_calls}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>RPC calls</div>
        </div>
        <button onClick={e => { e.stopPropagation(); onDetail(t.tenant.id); }} style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'var(--color-bg-card)', color: 'var(--color-text-muted)', cursor: 'pointer' }}><MoreVertical size={14} /></button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 var(--space-3) var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <ProgressBar current={usage.rpc_calls} max={limits.monthly_rpc_calls} label="Monthly RPC Usage" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: '0.75rem' }}>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Tokens: </span><span style={{ fontWeight: 600 }}>{(usage.tokens_used || 0).toLocaleString()}</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Integrations: </span><span style={{ fontWeight: 600 }}>{usage.integrations_count || 0}</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Plan: </span><span style={{ fontWeight: 600 }}>{t.tenant.plan}</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Sub: </span><StatusBadge status={t.subscription?.status === 'active' ? 'live' : 'idle'} label={t.subscription?.status || 'none'} /></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateTenantForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email) return;
    setSubmitting(true);
    await onSubmit({ name, email, plan });
    setSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Tenant name" style={{ fontSize: '0.8rem' }} />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={{ fontSize: '0.8rem' }} />
      <select value={plan} onChange={e => setPlan(e.target.value)} style={{ fontSize: '0.8rem', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}>
        <option value="free">Free</option>
        <option value="starter">Starter</option>
        <option value="professional">Professional</option>
        <option value="enterprise">Enterprise</option>
      </select>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button onClick={handleSubmit} disabled={submitting || !name || !email} style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: !name || !email ? 'var(--color-bg-elevated)' : 'var(--color-accent)', color: !name || !email ? 'var(--color-text-muted)' : 'white', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.8rem', cursor: !name || !email ? 'not-allowed' : 'pointer' }}>{submitting ? 'Creating...' : 'Create Tenant'}</button>
        <button onClick={onCancel} style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
      </div>
    </motion.div>
  );
}

function SkillToggle({ name, description, enabled, onToggle, category }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', background: enabled ? 'rgba(0,214,143,0.04)' : 'var(--color-bg-elevated)', border: `1px solid ${enabled ? 'rgba(0,214,143,0.2)' : 'var(--color-border)'}`, transition: 'all var(--transition-fast)' }}>
      <button onClick={onToggle} style={{ border: 'none', background: 'none', cursor: 'pointer', color: enabled ? 'var(--color-success)' : 'var(--color-text-muted)', padding: 0, display: 'flex' }}>
        {enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>{name}</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{description}</div>
      </div>
      <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}>{category}</span>
    </div>
  );
}

function LocalAgentCard({ name, status, icon: Icon, detail }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: `1px solid ${status === 'connected' ? 'rgba(0,214,143,0.2)' : 'var(--color-border)'}` }}>
      <Icon size={20} color={status === 'connected' ? 'var(--color-success)' : 'var(--color-text-muted)'} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{name}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{detail}</div>
      </div>
      <StatusBadge status={status === 'connected' ? 'live' : 'idle'} label={status} pulsing={status === 'connecting'} />
    </div>
  );
}

export default function AdminWorkerDashboard({ token }) {
  const [metrics, setMetrics] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTenantDetail, setShowTenantDetail] = useState(null);
  const [tenantDetail, setTenantDetail] = useState(null);
  const [connectionScript, setConnectionScript] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sseStatus, setSseStatus] = useState('disconnected');
  const [skills, setSkills] = useState({});
  const [createdToken, setCreatedToken] = useState(null);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const start = performance.now();
    const [mRes, tRes, rRes, cRes] = await Promise.all([
      fetchAdminMetrics(token),
      listTenants(token),
      getMeteringReport(token),
      fetchConnectionScript(token).catch(() => ({ code: 'ERROR' })),
    ]);
    setLatency(Math.round(performance.now() - start));
    if (mRes.code === 'OK') setMetrics(mRes.result);
    else setError(mRes.error);
    if (tRes.code === 'OK') setTenants(tRes.result.tenants || []);
    else setError(tRes.error);
    if (rRes.code === 'OK') setReport(rRes.result);
    if (cRes.code === 'OK') setConnectionScript(cRes.result);
    if (mRes.code === 'OK') {
      setSkills(Object.fromEntries((mRes.result.tools?.schema || []).map(t => [t.name, true])));
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    pollRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [refresh]);
  useEffect(() => {
    const es = new EventSource(`https://azaria-ai-worker.evansmathibe82.workers.dev/sse?health=1`);
    es.onopen = () => setSseStatus('connected');
    es.onerror = () => setSseStatus('disconnected');
    es.onmessage = () => setSseStatus('connected');
    const timeout = setTimeout(() => { if (sseStatus === 'disconnected') setSseStatus('disconnected'); }, 5000);
    return () => { es.close(); clearTimeout(timeout); };
  }, []);

  if (!token) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <Key size={48} color="var(--color-accent)" style={{ marginBottom: 'var(--space-4)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Admin Authentication Required</h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Enter your Master Admin API token to access the worker control dashboard.</p>
      </motion.div>
    );
  }

  const handleCreateTenant = async (data) => {
    const res = await createTenant(token, data);
    if (res.code === 'OK') {
      setCreatedToken(res.result.token);
      setShowCreate(false);
      await refresh();
    } else {
      setError(res.error);
    }
  };

  const handleDeactivate = async (tenantId) => {
    await deactivateTenant(token, tenantId);
    await refresh();
  };

  const handleShowDetail = async (tenantId) => {
    const res = await getTenantDetail(token, tenantId);
    if (res.code === 'OK') {
      setTenantDetail(res.result);
      setShowTenantDetail(tenantId);
    }
  };

  const toggleSkill = (name) => {
    setSkills(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const copyScript = () => {
    if (connectionScript) {
      navigator.clipboard.writeText(JSON.stringify(connectionScript, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const MetricRow = ({ label, value, sub, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-glass-border)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: color || 'var(--color-text-primary)' }}>{value}</span>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
      </div>
    </div>
  );

  const toolCategories = [...new Set((metrics?.tools?.schema || []).map(t => t.category || 'system'))];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Multi-Tenant Command Center</h2>
          {metrics && <StatusBadge status="live" label={`v${metrics.worker?.version}`} />}
          <StatusBadge status={sseStatus === 'connected' ? 'live' : 'idle'} label={`SSE ${sseStatus}`} pulsing={sseStatus === 'connecting'} />
        </div>
        <button onClick={refresh} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontWeight: 500, fontSize: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
          <AlertTriangle size={16} />{error}
        </motion.div>
      )}

      {createdToken && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'rgba(0,214,143,0.08)', border: '1px solid rgba(0,214,143,0.2)', fontSize: '0.8rem' }}>
          <strong style={{ color: 'var(--color-success)' }}>✓ Tenant created!</strong>
          <div style={{ marginTop: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            API Token: <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', wordBreak: 'break-all', background: 'var(--color-bg-card)', padding: '4px 8px', borderRadius: 4 }}>{createdToken}</code>
          </div>
          <div style={{ marginTop: 2, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Save this token — it will not be shown again.</div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
        <ModuleCard title="Client Tenancy Desk" icon={Users} accent="var(--color-success)" actions={
          <button onClick={() => { setShowCreate(!showCreate); setCreatedToken(null); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: showCreate ? 'var(--color-bg-elevated)' : 'var(--color-accent)', color: showCreate ? 'var(--color-text-secondary)' : 'white', border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
            <Plus size={14} />{showCreate ? 'Cancel' : 'Add'}
          </button>
        }>
          <AnimatePresence>{showCreate && <CreateTenantForm onSubmit={handleCreateTenant} onCancel={() => setShowCreate(false)} />}</AnimatePresence>
          <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: '0.7rem', color: 'var(--color-text-muted)', padding: '0 var(--space-1)' }}>
            <span>{tenants.length} total</span>
            <span>·</span>
            <span>{tenants.filter(t => t.tenant.active).length} active</span>
            {report?.totals && <><span>·</span><span>{report.totals.total_rpc_calls} RPC calls</span></>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 380, overflowY: 'auto' }}>
            {tenants.map(t => (
              <TenantRow key={t.tenant.id} t={t} expanded={expandedTenant === t.tenant.id} onToggle={(id) => setExpandedTenant(expandedTenant === id ? null : id)} onDetail={handleShowDetail} />
            ))}
            {tenants.length === 0 && !loading && <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No tenants yet. Create one to get started.</div>}
          </div>
        </ModuleCard>

        <ModuleCard title="System Skill Integrator" icon={Grid} accent="var(--color-warning)">
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Toggle individual MCP tools on/off • {Object.values(skills).filter(Boolean).length}/{Object.keys(skills).length} active</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 380, overflowY: 'auto' }}>
            {toolCategories.map(cat => (
              <div key={cat}>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: 'var(--space-1) var(--space-1)', marginTop: cat !== toolCategories[0] ? 'var(--space-2)' : 0 }}>{cat}</div>
                {(metrics?.tools?.schema || []).filter(t => (t.category || 'system') === cat).map(t => (
                  <SkillToggle key={t.name} name={t.name} description={t.description} enabled={skills[t.name] !== false} onToggle={() => toggleSkill(t.name)} category={cat} />
                ))}
              </div>
            ))}
          </div>
        </ModuleCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
        <ModuleCard title="Local Integration Terminal" icon={Plug} accent="var(--color-info)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <LocalAgentCard name="Goose AI" status={sseStatus === 'connected' ? 'connected' : 'disconnected'} icon={Cpu} detail="SSE transport · MCP protocol · 30s timeout" />
            <LocalAgentCard name="OpenCode" status={sseStatus === 'connected' ? 'connected' : 'disconnected'} icon={Terminal} detail="SSE transport · MCP protocol · 30s timeout" />
            <LocalAgentCard name="Gemini CLI" status={sseStatus === 'connected' ? 'connected' : 'disconnected'} icon={Globe} detail="SSE transport · JSON-RPC mapping · 30s timeout" />
            <LocalAgentCard name="Open Design" status={sseStatus === 'connected' ? 'connected' : 'disconnected'} icon={Grid} detail="SSE transport · MCP protocol · local-first design" />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            <div style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={12} />SSE endpoint: /sse
            </div>
            <div style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={12} />30s timeout
            </div>
          </div>
        </ModuleCard>

        <ModuleCard title="Client Connection Gateway" icon={Code} accent="var(--color-accent)" actions={
          <button onClick={copyScript} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', fontWeight: 500, fontSize: '0.75rem', cursor: 'pointer' }}>
            {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}
          </button>
        }>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Share this setup script with tenants to connect their local tools to the Azaria AI edge gateway.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 300, overflowY: 'auto' }}>
            {connectionScript && connectionScript.configs ? Object.entries(connectionScript.configs).map(([name, cfg]) => (
              <div key={name} style={{ padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>{name.replace(/_/g, ' ')}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8, background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}>{cfg.type}</span>
                    <button onClick={() => { navigator.clipboard.writeText(cfg.type === 'json' ? JSON.stringify(cfg.snippet, null, 2) : cfg.snippet); }} style={{ padding: 4, background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Copy size={12} /></button>
                  </div>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>{cfg.file || cfg.command}</div>
                <pre style={{ margin: 0, padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', background: '#06060a', fontSize: '0.6rem', lineHeight: 1.4, overflowX: 'auto', maxHeight: 80, color: 'var(--color-text-secondary)' }}>
                  {cfg.type === 'json' ? JSON.stringify(cfg.snippet, null, 2) : cfg.snippet}
                </pre>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>{cfg.instructions}</div>
              </div>
            )) : <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Enter a valid admin token to see connection configs for each tool.</div>}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', paddingTop: 'var(--space-2)' }}>
            {BYOK_PROVIDERS.map(p => (
              <span key={p} style={{ fontSize: '0.65rem', padding: '4px 10px', borderRadius: 8, background: 'rgba(108,92,231,0.08)', color: 'var(--color-accent)', border: '1px solid rgba(108,92,231,0.15)' }}>{p}</span>
            ))}
          </div>
        </ModuleCard>
      </div>

      {showTenantDetail && tenantDetail && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{tenantDetail.tenant?.name} — Detail</h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={() => handleDeactivate(showTenantDetail)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--color-danger)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Deactivate</button>
              <button onClick={() => setShowTenantDetail(null)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)' }}>Usage</h4>
              <MetricRow label="RPC Calls" value={tenantDetail.usage?.rpc_calls?.toLocaleString() || '0'} sub={`/ ${tenantDetail.tenant?.limits?.monthly_rpc_calls || 1000}`} />
              <MetricRow label="Tokens Used" value={(tenantDetail.usage?.tokens_used || 0).toLocaleString()} sub={`/ ${tenantDetail.tenant?.limits?.monthly_tokens || 500000}`} />
              <MetricRow label="Integrations" value={tenantDetail.usage?.integrations_count || 0} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)' }}>Subscription</h4>
              <MetricRow label="Plan" value={tenantDetail.subscription?.plan || tenantDetail.tenant?.plan || 'free'} />
              <MetricRow label="Status" value={tenantDetail.subscription?.status || 'active'} color={tenantDetail.subscription?.status === 'active' ? 'var(--color-success)' : 'var(--color-danger)'} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-muted)' }}>BYOK</h4>
              {(tenantDetail.byok || []).length > 0 ? tenantDetail.byok.map(b => (
                <div key={b.provider} style={{ fontSize: '0.75rem', padding: 'var(--space-1) 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{b.provider}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{b.key_prefix}...</span>
                </div>
              )) : <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No BYOK keys</div>}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: metrics ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {metrics ? <Wifi size={14} /> : <WifiOff size={14} />}
          {metrics ? `Edge Gateway v${metrics.worker?.version}` : 'Disconnected'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-muted)' }}>
          {latency !== null && <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{latency}ms</span>}
          <span><Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{tenants.length} tenants</span>
          <span><BarChart3 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{metrics?.tools?.total || 0} tools</span>
          <span><Plug size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />SSE {sseStatus}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
