const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'pandea-secret-key';
const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

async function register(payload) {
  const existing = await userModel.getUserByEmail(payload.email);
  if (existing) {
    const error = new Error('El correo ya está registrado');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const createdUser = await userModel.createUser({
    nombre: payload.nombre,
    apellido: payload.apellido,
    email: payload.email,
    password_hash: passwordHash,
    rol: payload.rol || 'cliente',
    documento: payload.documento,
    telefono: payload.telefono || null,
    direccion: payload.direccion || null,
    ciudad: payload.ciudad || null,
  });

  const token = jwt.sign({ sub: createdUser.id, rol: createdUser.rol }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  const user = { ...createdUser };
  delete user.password_hash;

  return { token, user };
}

async function login(email, password) {
  const user = await userModel.getUserByEmail(email);
  if (!user) {
    const error = new Error('Credenciales incorrectas');
    error.status = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    const error = new Error('Credenciales incorrectas');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ sub: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  const safeUser = { ...user };
  delete safeUser.password_hash;

  return { token, user: safeUser };
}

async function recover(email) {
  const user = await userModel.getUserByEmail(email);
  if (!user) return;
  return;
}

module.exports = {
  register,
  login,
  recover,
};
