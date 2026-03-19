const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

function getEncryptionKey() {
  const key = process.env.TG_CREDENTIALS_KEY;
  if (!key) {
    throw new Error('TG_CREDENTIALS_KEY environment variable is not set');
  }
  
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  return crypto.scryptSync(key, 'tigergraph-devhub-salt', KEY_LENGTH);
}

function encrypt(text) {
  if (!text) {
    throw new Error('Cannot encrypt empty text');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty text');
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const [ivHex, authTagHex, encrypted] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

function isEncryptionConfigured() {
  return !!process.env.TG_CREDENTIALS_KEY;
}

module.exports = {
  encrypt,
  decrypt,
  isEncryptionConfigured
};
