export async function hashPII(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function stripPII(payload) {
  const sensitiveKeys = ['email', 'phone', 'idNumber', 'passport', 'ssn', 'creditCard'];
  const stripped = { ...payload };
  for (const key of sensitiveKeys) {
    if (stripped[key]) {
      stripped[key] = '[REDACTED-SHA256]';
    }
  }
  return stripped;
}
