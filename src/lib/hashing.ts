import "server-only";
import crypto from "crypto";

const keyHex = process.env.CRYPTO_ENCRYPTION_KEY;
if (!keyHex) {
  throw new Error("Missing CRYPTO_ENCRYPTION_KEY in environment");
}

const SECRET_KEY = Buffer.from(keyHex, "hex");
const IV_LENGTH = 12;

export function encrypt(text: string, key: Buffer = SECRET_KEY): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), encrypted.toString("hex"), authTag.toString("hex")].join(":");
}

export function decrypt(encryptedData: string, key: Buffer = SECRET_KEY): string {
  const [ivHex, encryptedHex, authTagHex] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}
