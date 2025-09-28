// src/utils/cryptoBrowser.js
const enc = new TextEncoder();
const dec = new TextDecoder();

function abToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToAb(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(plainText, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plainText));
  return { cipher: abToBase64(cipher), iv: abToBase64(iv), salt: abToBase64(salt) };
}

export async function decryptData({ cipher, iv, salt }, password) {
  const cipherAb = base64ToAb(cipher);
  const ivAb = base64ToAb(iv);
  const saltAb = base64ToAb(salt);
  const key = await deriveKey(password, saltAb);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(ivAb) }, key, cipherAb);
  return dec.decode(plainBuffer);
}
