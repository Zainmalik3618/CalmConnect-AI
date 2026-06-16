
const crypto = require('crypto');

// Use a dedicated ENCRYPTION_KEY from env, fallback to a derived key from JWT_SECRET for consistency
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32)
  : crypto.scryptSync(process.env.JWT_SECRET || 'calmconnect-default-secure-salt', 'salt', 32);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts text using AES-256-GCM
 * Returns a string formatted as iv:authTag:encryptedText (all hex)
 */
exports.encrypt = (text) => {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts a string formatted as iv:authTag:encryptedText
 */
exports.decrypt = (hash) => {
  if (!hash || !hash.includes(':')) return hash; // Return original if not in encrypted format
  
  try {
    const parts = hash.split(':');
    if (parts.length !== 3) return hash;

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return '[Encrypted Message - Decryption Error]';
  }
};
