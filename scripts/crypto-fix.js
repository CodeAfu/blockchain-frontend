const crypto = require("crypto");

const keyHex = "772d901d8231f1ada0c3a4c695fca38fa88ccec47210bca18fb590293d1eb21c";
const SECRET_KEY = Buffer.from(keyHex, "hex");
const IV_LENGTH = 12;

function encrypt(text, key = SECRET_KEY) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), encrypted.toString("hex"), authTag.toString("hex")].join(":");
}

console.log(encrypt(""));
