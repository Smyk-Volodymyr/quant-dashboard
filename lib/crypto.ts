import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

export function encryptString(text: string): string {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error("Invalid ENCRYPTION_SECRET length. Must be 32 characters.");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}