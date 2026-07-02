import { describe, it, expect } from 'vitest';
import { encryptJSON, decryptJSON, newSalt } from './crypto';

describe('client-side crypto (AES-GCM + PBKDF2)', () => {
  it('encrypt → decrypt roundtrip restores the object', async () => {
    const salt = newSalt();
    const data = { progress: [1, 2, 3], view: 'hub', score: 12 };
    const enc = await encryptJSON(data, 'hunter2', salt);
    const dec = await decryptJSON<typeof data>(enc, 'hunter2', salt);
    expect(dec).toEqual(data);
  });

  it('ciphertext is not plaintext', async () => {
    const salt = newSalt();
    const enc = await encryptJSON({ secret: 'unit-economics' }, 'pw', salt);
    expect(enc).not.toContain('unit-economics');
    expect(enc).toContain('.'); // iv.ciphertext
  });

  it('wrong password fails to decrypt', async () => {
    const salt = newSalt();
    const enc = await encryptJSON({ a: 1 }, 'right', salt);
    await expect(decryptJSON(enc, 'wrong', salt)).rejects.toBeDefined();
  });

  it('salts are unique', () => {
    expect(newSalt()).not.toBe(newSalt());
  });
});
