const WORKER_URL = 'https://azaria-ai-worker.evansmathibe82.workers.dev';

export async function fetchServiceManifest() {
  const res = await fetch(WORKER_URL);
  if (!res.ok) throw new Error(`Worker manifest error: ${res.status}`);
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${WORKER_URL}/health`);
  if (!res.ok) throw new Error(`Health check error: ${res.status}`);
  return res.json();
}

export async function fetchTools() {
  const res = await fetch(`${WORKER_URL}/tools`);
  if (!res.ok) throw new Error(`Tools fetch error: ${res.status}`);
  return res.json();
}

export async function rpcCall(method, params = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${WORKER_URL}/rpc`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`RPC error ${res.status}: ${errBody}`);
  }
  return res.json();
}
