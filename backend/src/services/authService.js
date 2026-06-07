const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');
const authModel = require('../models/authModel');

const JWT_SECRET = process.env.JWT_SECRET || 'pandea-secret-key';
const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

// Configurar transporter de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
  if (!user) return; // No revelar si el email existe

  const token = authModel.generateResetToken(user.id);
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Recuperar contraseña - Pandea',
    html: `
      <h2>Recuperar tu contraseña</h2>
      <p>Hola ${user.nombre},</p>
      <p>Recibimos una solicitud para recuperar tu contraseña. Haz clic en el enlace abajo:</p>
      <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background-color:#6c3483; color:white; text-decoration:none; border-radius:5px;">
        Recuperar contraseña
      </a>
      <p>Este enlace expira en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error enviando email:', err);
  }
}

async function validateResetToken(token) {
  const data = authModel.validateResetToken(token);
  if (!data) {
    const error = new Error('Token inválido o expirado');
    error.status = 400;
    throw error;
  }
  return { userId: data.userId };
}

async function resetPassword(token, newPassword) {
  const data = authModel.validateResetToken(token);
  if (!data) {
    const error = new Error('Token inválido o expirado');
    error.status = 400;
    throw error;
  }

  if (!newPassword || newPassword.length < 8) {
    const error = new Error('La contraseña debe tener al menos 8 caracteres');
    error.status = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const updated = await authModel.updateUserPassword(data.userId, hashedPassword);
  authModel.consumeResetToken(token);

  return { message: 'Contraseña actualizada exitosamente', user: updated };
}

module.exports = {
  register,
  login,
  recover,
  validateResetToken,
  resetPassword,
};
