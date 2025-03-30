import bs58 from "bs58";
import nacl from "tweetnacl";
import { Buffer } from "buffer"; // Polyfill for React Native

// Ensure the global Buffer is set (React Native)
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

// Helper Functions
export function decryptPayload(
  data: string,
  nonce: string,
  sharedSecret: Uint8Array
) {
  const decrypted = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret
  );
  if (!decrypted) throw new Error("Failed to decrypt payload");

  return JSON.parse(Buffer.from(decrypted).toString("utf-8"));
}

export function encryptPayload(
  payload: object,
  sharedSecret: Uint8Array
): [Uint8Array, Uint8Array] {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);

  // Explicitly cast Buffer to Uint8Array
  const encryptedPayload = nacl.box.after(
    Uint8Array.from(Buffer.from(JSON.stringify(payload))), 
    nonce,
    sharedSecret
  );

  return [nonce, encryptedPayload];
}
