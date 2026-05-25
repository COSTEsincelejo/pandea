const { executeProcedure } = require('../config/db');
const sql = require('mssql');

async function createUser(payload) {
  const result = await executeProcedure('spCreateUsuario', [
    { name: 'nombre', type: sql.VarChar(100), value: payload.nombre },
    { name: 'apellido', type: sql.VarChar(100), value: payload.apellido },
    { name: 'email', type: sql.VarChar(150), value: payload.email },
    { name: 'password_hash', type: sql.VarChar(255), value: payload.password_hash },
    { name: 'rol', type: sql.VarChar(20), value: payload.rol },
    { name: 'documento', type: sql.VarChar(30), value: payload.documento },
    { name: 'telefono', type: sql.VarChar(20), value: payload.telefono },
    { name: 'direccion', type: sql.VarChar(255), value: payload.direccion },
    { name: 'ciudad', type: sql.VarChar(100), value: payload.ciudad },
  ]);
  return result[0];
}

async function getUserByEmail(email) {
  const result = await executeProcedure('spGetUsuarioByEmail', [
    { name: 'email', type: sql.VarChar(150), value: email },
  ]);
  return result[0] || null;
}

async function getUserById(id) {
  const result = await executeProcedure('spGetUsuarioById', [
    { name: 'id', type: sql.Int, value: id },
  ]);
  return result[0] || null;
}

async function updateUser(id, payload) {
  const result = await executeProcedure('spUpdateUsuario', [
    { name: 'id', type: sql.Int, value: id },
    { name: 'nombre', type: sql.VarChar(100), value: payload.nombre },
    { name: 'apellido', type: sql.VarChar(100), value: payload.apellido },
    { name: 'email', type: sql.VarChar(150), value: payload.email },
    { name: 'direccion', type: sql.VarChar(255), value: payload.direccion },
    { name: 'ciudad', type: sql.VarChar(100), value: payload.ciudad },
    { name: 'telefono', type: sql.VarChar(20), value: payload.telefono },
    { name: 'documento', type: sql.VarChar(30), value: payload.documento },
  ]);
  return result[0];
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
};
