import crypto from 'crypto';

export async function encryptMessage(message, senderPublicKey, recipientPublicKey) {
  const aesKey = crypto.randomBytes(32);

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  let encryptedMessage = cipher.update(message, 'utf8', 'base64');
  encryptedMessage += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  const encryptedKeyForSender = crypto.publicEncrypt(
    { key: senderPublicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    aesKey
  );

  const encryptedKeyForRecipient = crypto.publicEncrypt(
    { key: recipientPublicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    aesKey
  );

  return {
    encryptedMessage,
    encryptedKeyForSender: encryptedKeyForSender.toString('base64'),
    encryptedKeyForRecipient: encryptedKeyForRecipient.toString('base64'),
    iv: iv.toString('base64'),
    authTag,
  };
}

export async function decryptMessage(encryptedMessage, encryptedKey, iv, privateKey, authTag) {    
  const aesKey = crypto.privateDecrypt(
    { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(encryptedKey, 'base64')
  );

  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  let decryptedMessage = decipher.update(encryptedMessage, 'base64', 'utf8');
  decryptedMessage += decipher.final('utf8');
  return decryptedMessage;
}

export function decryptPrivateKeyWithPassword(encryptedPrivateKey, password) {
  const crypto = require('crypto');
  const key = crypto.createHash('sha256').update(password).digest();
  const iv = Buffer.alloc(16, 0); // Static IV; must match the IV used during encryption.
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}