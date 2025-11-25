import { Buffer } from 'buffer';

export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptMessage(
  key: CryptoKey,
  message: string
): Promise<{ content: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(message)
  );

  return {
    content: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

export async function decryptMessage(
  key: CryptoKey,
  content: string,
  iv: string
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: Uint8Array.from(Buffer.from(iv, 'base64')) },
    key,
    Uint8Array.from(Buffer.from(content, 'base64'))
  );

  return new TextDecoder().decode(decrypted);
}
