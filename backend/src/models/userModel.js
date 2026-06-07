const { query } = require('../config/db');

async function createUser(payload) {
  const result = await query(
    `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, documento, telefono, direccion, ciudad)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      payload.nombre,
      payload.apellido,
      payload.email,
      payload.password_hash,
      payload.rol,
      payload.documento,
      payload.telefono,
      payload.direccion,
      payload.ciudad,
    ]
  );
  return result[0];
}

async function getUserByEmail(email) {
  const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result[0] || null;
}

async function getUserById(id) {
  const result = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return result[0] || null;
}

async function updateUser(id, payload) {
  const result = await query(
    `UPDATE usuarios SET
       nombre = COALESCE($2, nombre),
       apellido = COALESCE($3, apellido),
       email = COALESCE($4, email),
       direccion = COALESCE($5, direccion),
       ciudad = COALESCE($6, ciudad),
       telefono = COALESCE($7, telefono),
       documento = COALESCE($8, documento)
     WHERE id = $1
     RETURNING *`,
    [
      id,
      payload.nombre,
      payload.apellido,
      payload.email,
      payload.direccion,
      payload.ciudad,
      payload.telefono,
      payload.documento,
    ]
  );
  return result[0];
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
};
