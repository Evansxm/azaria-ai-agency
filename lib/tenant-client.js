const TENANT_RPC_URL = 'https://azaria-ai-worker.evansmathibe82.workers.dev/rpc';
const TENANT_TOOLS_URL = 'https://azaria-ai-worker.evansmathibe82.workers.dev/tools';
const TENANT_SSE_URL = 'https://azaria-ai-worker.evansmathibe82.workers.dev/sse';

export async function tenantRpcCall(method, params = {}, token) {
  if (!token) return { error: 'No tenant token provided', code: 'NO_TOKEN' };
  try {
    const res = await fetch(TENANT_RPC_URL, {
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

export async function fetchUsageReport(token) {
  return tenantRpcCall('get_usage_report', {}, token);
}

export async function registerWebhook(token, url, events) {
  return tenantRpcCall('register_webhook', { url, events }, token);
}

export async function fetchConnectionScript(token) {
  return tenantRpcCall('get_connection_script', {}, token);
}

export function getSSEUrl(token) {
  return `${TENANT_SSE_URL}?token=${token}`;
}

export function getToolsUrl(token) {
  return TENANT_TOOLS_URL;
}

export const BYOK_PROVIDERS = ['openai', 'anthropic', 'gemini', 'groq', 'together'];
