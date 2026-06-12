const ADMIN_RPC_URL = 'https://azaria-ai-worker.evansmathibe82.workers.dev/rpc';

export async function adminRpcCall(method, params = {}, token) {
  if (!token) return { error: 'No admin token provided', code: 'NO_TOKEN' };
  try {
    const res = await fetch(ADMIN_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || `HTTP ${res.status}`, code: 'HTTP_ERROR', status: res.status };
    if (data.error) return { error: data.error.message || data.error, code: 'RPC_ERROR' };
    return { result: data.result, code: 'OK' };
  } catch (err) {
    return { error: err.message, code: 'NETWORK_ERROR' };
  }
}

export async function fetchAdminMetrics(token) {
  return adminRpcCall('admin_getSystemMetrics', {}, token);
}

export async function fetchAdminToolSchema(token) {
  try {
    const res = await fetch('https://azaria-ai-worker.evansmathibe82.workers.dev/tools', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { result: data, code: 'OK' };
  } catch (err) {
    return { error: err.message, code: 'NETWORK_ERROR' };
  }
}

export async function listTenants(token) {
  return adminRpcCall('admin_listTenants', {}, token);
}

export async function getTenantDetail(token, tenantId) {
  return adminRpcCall('admin_getTenantDetail', { tenantId }, token);
}

export async function createTenant(token, { name, email, plan }) {
  return adminRpcCall('admin_createTenant', { name, email, plan }, token);
}

export async function updateTenantLimits(token, tenantId, limits) {
  return adminRpcCall('admin_updateTenantLimits', { tenantId, limits }, token);
}

export async function deactivateTenant(token, tenantId) {
  return adminRpcCall('admin_deactivateTenant', { tenantId }, token);
}

export async function getMeteringReport(token) {
  return adminRpcCall('admin_getMeteringReport', {}, token);
}

export async function createIntegration(token, tenantId, { type, name, config }) {
  return adminRpcCall('admin_createIntegration', { tenantId, type, name, config }, token);
}

export async function deleteIntegration(token, tenantId, integrationId) {
  return adminRpcCall('admin_deleteIntegration', { tenantId, integrationId }, token);
}

export async function storeBYOK(token, tenantId, provider, keyPrefix) {
  return adminRpcCall('admin_storeBYOK', { tenantId, provider, keyPrefix }, token);
}

export async function deleteBYOK(token, tenantId, provider) {
  return adminRpcCall('admin_deleteBYOK', { tenantId, provider }, token);
}
