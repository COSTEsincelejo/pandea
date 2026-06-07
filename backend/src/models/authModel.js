const { query } = require('../config/db');

// Tabla de tokens de recuperación (puede ser temporal, en memoria o en BD)
// Para producción, se recomienda usar Redis o una tabla en la BD con expiración

const passwordResetTokens = new Map();

function generateResetToken(userId, expiresIn = 3600000) {
  // Token expira en 1 hora por defecto
  const token = require('crypto').randomBytes(32).toString('hex');
  passwordResetTokens.set(token, {
    userId,
    expiresAt: Date.now() + expiresIn,
  });
  return token;
}

function validateResetToken(token) {
  const data = passwordResetTokens.get(token);
  if (!data) return null;
  if (Date.now() > data.expiresAt) {
    passwordResetTokens.delete(token);
    return null;
  }
  return data;
}

function consumeResetToken(token) {
  passwordResetTokens.delete(token);
}

async function getUserByEmail(email) {
  const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result[0] || null;
}

async function updateUserPassword(userId, passwordHash) {
  const result = await query(
    'UPDATE usuarios SET password_hash = $2 WHERE id = $1 RETURNING id, nombre, email',
    [userId, passwordHash]
  );
  return result[0];
}

module.exports = {
  generateResetToken,
  validateResetToken,
  consumeResetToken,
  getUserByEmail,
  updateUserPassword,
};
