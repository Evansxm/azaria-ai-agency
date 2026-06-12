function generateId(len = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < len; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

function generateApiToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'azr_sk_';
  for (let i = 0; i < 48; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
  return token;
}

async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const DEFAULT_LIMITS = {
  monthly_rpc_calls: 1000,
  monthly_tokens: 500000,
  storage_mb: 50,
  rate_per_min: 30,
};

function currentPeriod() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function createTenant(kv, { name, email, plan = 'free' }) {
  const tenantId = generateId();
  const now = new Date().toISOString();
  const tenant = {
    id: tenantId, name, email, plan, created: now, active: true,
    limits: { ...DEFAULT_LIMITS },
    meta: {},
  };
  await kv.put(`tenant:${tenantId}`, JSON.stringify(tenant));
  const token = generateApiToken();
  const tokenHash = await sha256Hex(token);
  await kv.put(`token:${tokenHash}`, JSON.stringify({
    tenant_id: tenantId, created: now, active: true, permissions: ['rpc'],
  }));
  await kv.put(`subscription:${tenantId}`, JSON.stringify({
    tenant_id: tenantId, plan, status: 'active', current_period_start: now, current_period_end: now,
  }));
  const period = currentPeriod();
  await kv.put(`metering:${tenantId}:${period}`, JSON.stringify({
    tenant_id: tenantId, period, rpc_calls: 0, tokens_used: 0, storage_bytes: 0, integrations_count: 0, last_active: now,
  }));
  return { tenant, token };
}

export async function getTenant(kv, tenantId) {
  const raw = await kv.get(`tenant:${tenantId}`, 'json');
  return raw || null;
}

export async function listTenants(kv) {
  const list = await kv.list({ prefix: 'tenant:' });
  const tenants = [];
  for (const key of list.keys) {
    const raw = await kv.get(key.name, 'json');
    if (raw) tenants.push(raw);
  }
  return tenants;
}

export async function updateTenantLimits(kv, tenantId, limits) {
  const tenant = await getTenant(kv, tenantId);
  if (!tenant) return null;
  tenant.limits = { ...tenant.limits, ...limits };
  await kv.put(`tenant:${tenantId}`, JSON.stringify(tenant));
  return tenant;
}

export async function deactivateTenant(kv, tenantId) {
  const tenant = await getTenant(kv, tenantId);
  if (!tenant) return false;
  tenant.active = false;
  await kv.put(`tenant:${tenantId}`, JSON.stringify(tenant));
  return true;
}

export async function recordUsage(kv, tenantId, metrics = {}) {
  const period = currentPeriod();
  const key = `metering:${tenantId}:${period}`;
  const usage = await kv.get(key, 'json') || {
    tenant_id: tenantId, period, rpc_calls: 0, tokens_used: 0, storage_bytes: 0, integrations_count: 0, last_active: new Date().toISOString(),
  };
  if (metrics.rpc_calls) usage.rpc_calls += metrics.rpc_calls;
  if (metrics.tokens_used) usage.tokens_used += metrics.tokens_used;
  if (metrics.storage_bytes) usage.storage_bytes += metrics.storage_bytes;
  usage.last_active = new Date().toISOString();
  await kv.put(key, JSON.stringify(usage), { expirationTtl: 86400 * 62 });
  return usage;
}

export async function getUsage(kv, tenantId, period) {
  const p = period || currentPeriod();
  const raw = await kv.get(`metering:${tenantId}:${p}`, 'json');
  return raw || { tenant_id: tenantId, period: p, rpc_calls: 0, tokens_used: 0, storage_bytes: 0, integrations_count: 0 };
}

export async function getAllUsageSummary(kv) {
  const list = await kv.list({ prefix: 'tenant:' });
  const summary = [];
  for (const key of list.keys) {
    const tenantRaw = await kv.get(key.name, 'json');
    if (!tenantRaw) continue;
    const usage = await getUsage(kv, tenantRaw.id);
    const subRaw = await kv.get(`subscription:${tenantRaw.id}`, 'json');
    summary.push({
      tenant: { id: tenantRaw.id, name: tenantRaw.name, email: tenantRaw.email, plan: tenantRaw.plan, active: tenantRaw.active },
      usage,
      subscription: subRaw || null,
    });
  }
  return summary;
}

export async function checkUsageLimit(kv, tenantId) {
  const tenant = await getTenant(kv, tenantId);
  if (!tenant || !tenant.active) return { allowed: false, reason: 'inactive' };
  const usage = await getUsage(kv, tenantId);
  if (usage.rpc_calls >= tenant.limits.monthly_rpc_calls) return { allowed: false, reason: 'rpc_limit' };
  if (usage.tokens_used >= tenant.limits.monthly_tokens) return { allowed: false, reason: 'token_limit' };
  return { allowed: true, remaining_rpc: tenant.limits.monthly_rpc_calls - usage.rpc_calls, remaining_tokens: tenant.limits.monthly_tokens - usage.tokens_used };
}

export async function createIntegration(kv, tenantId, { type, name, config }) {
  const integration = {
    id: generateId(24), tenant_id: tenantId, type, name, config: config || {}, enabled: true,
    created: new Date().toISOString(), last_used: null,
  };
  await kv.put(`integration:${tenantId}:${integration.id}`, JSON.stringify(integration));
  const usage = await getUsage(kv, tenantId);
  usage.integrations_count = (usage.integrations_count || 0) + 1;
  const period = currentPeriod();
  await kv.put(`metering:${tenantId}:${period}`, JSON.stringify(usage), { expirationTtl: 86400 * 62 });
  return integration;
}

export async function getIntegrations(kv, tenantId) {
  const list = await kv.list({ prefix: `integration:${tenantId}:` });
  const results = [];
  for (const key of list.keys) {
    const raw = await kv.get(key.name, 'json');
    if (raw) results.push(raw);
  }
  return results;
}

export async function deleteIntegration(kv, tenantId, integrationId) {
  await kv.delete(`integration:${tenantId}:${integrationId}`);
  return true;
}

export async function storeToken(kv, tenantId) {
  const token = generateApiToken();
  const tokenHash = await sha256Hex(token);
  await kv.put(`token:${tokenHash}`, JSON.stringify({
    tenant_id: tenantId, created: new Date().toISOString(), active: true, permissions: ['rpc'],
  }));
  return token;
}

export async function validateToken(kv, token) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const record = await kv.get(`token:${tokenHash}`, 'json');
  if (!record || !record.active) return null;
  const tenant = await getTenant(kv, record.tenant_id);
  if (!tenant || !tenant.active) return null;
  return { ...record, tenant };
}

export async function storeBYOK(kv, tenantId, provider, keyPrefix) {
  const entry = { tenant_id: tenantId, provider, key_prefix: keyPrefix, created: new Date().toISOString(), active: true };
  await kv.put(`byok:${tenantId}:${provider}`, JSON.stringify(entry));
  return entry;
}

export async function getBYOKs(kv, tenantId) {
  const list = await kv.list({ prefix: `byok:${tenantId}:` });
  const results = [];
  for (const key of list.keys) {
    const raw = await kv.get(key.name, 'json');
    if (raw) results.push(raw);
  }
  return results;
}

export async function deleteBYOK(kv, tenantId, provider) {
  await kv.delete(`byok:${tenantId}:${provider}`);
  return true;
}

export async function createSubscription(kv, tenantId, sessionId, plan) {
  const sub = {
    tenant_id: tenantId, stripe_session_id: sessionId, plan, status: 'active',
    current_period_start: new Date().toISOString(), current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
  };
  await kv.put(`subscription:${tenantId}`, JSON.stringify(sub));
  const tenant = await getTenant(kv, tenantId);
  if (tenant) {
    tenant.plan = plan;
    await kv.put(`tenant:${tenantId}`, JSON.stringify(tenant));
  }
  return sub;
}

export async function getSubscription(kv, tenantId) {
  const raw = await kv.get(`subscription:${tenantId}`, 'json');
  return raw || null;
}
