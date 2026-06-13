const encoder = new TextEncoder();

// Helper to convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to convert Hex string to ArrayBuffer
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

// Base64Url helpers that work in all JS environments (Edge and Node)
function base64Encode(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64Decode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

const SECRET = process.env.SESSION_SECRET || 'restaurant_incident_tool_default_secure_secret_key_32_bytes';

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(payload: any): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64Encode(payloadStr);
  const key = await getCryptoKey(SECRET);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const signatureHex = bufferToHex(signatureBuffer);
  return `${payloadB64}.${signatureHex}`;
}

export async function verifyToken(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, signatureHex] = parts;
    const key = await getCryptoKey(SECRET);
    const signatureBuffer = hexToBuffer(signatureHex);
    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(payloadB64)
    );
    if (!verified) return null;
    const payloadStr = base64Decode(payloadB64);
    return JSON.parse(payloadStr);
  } catch (e) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return bufferToHex(hashBuffer);
}
