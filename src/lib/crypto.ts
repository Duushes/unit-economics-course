// Клиентское шифрование прогресса (AES-GCM). Ключ выводится из пароля
// пользователя через PBKDF2 и не покидает клиент — в БД лежит шифртекст.

const enc = new TextEncoder();
const dec = new TextDecoder();

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBuf(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function newSalt(): string {
  return bufToB64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function encryptJSON(obj: unknown, password: string, saltB64: string): Promise<string> {
  const salt = b64ToBuf(saltB64);
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(obj)));
  return `${bufToB64(iv)}.${bufToB64(ct)}`;
}

export async function decryptJSON<T>(payload: string, password: string, saltB64: string): Promise<T> {
  const [ivB64, ctB64] = payload.split('.');
  const salt = b64ToBuf(saltB64);
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBuf(ivB64) as BufferSource },
    key,
    b64ToBuf(ctB64) as BufferSource
  );
  return JSON.parse(dec.decode(pt)) as T;
}
