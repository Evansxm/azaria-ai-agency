const ADMIN_RPC_URL = 'https://azaria-ai-worker.evansmathibe82.workers.dev/rpc';

export async function adminRpcCall(method, params = {}, token) {
  if (!token) {
    return { error: 'No admin token provided', code: 'NO_TOKEN' };
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  try {
    const res = await fetch(ADMIN_RPC_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || `HTTP ${res.status}`, code: 'HTTP_ERROR', status: res.status };
    }
    if (data.error) {
      return { error: data.error.message || data.error, code: 'RPC_ERROR' };
    }
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
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { result: data, code: 'OK' };
  } catch (err) {
    return { error: err.message, code: 'NETWORK_ERROR' };
  }
}
