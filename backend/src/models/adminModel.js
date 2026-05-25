const { query } = require('../config/db');
const sql = require('mssql');

async function getUsers() {
  return query(
    `SELECT id, nombre, apellido, email, documento, rol, telefono, direccion, ciudad, fecha_registro
     FROM usuarios
     ORDER BY id`,
    []
  );
}

async function deleteUser(id) {
  await query('DELETE FROM usuarios WHERE id = @id', [{ name: 'id', type: sql.Int, value: id }]);
  return { deleted: id };
}

async function changeUserRole(id, rol) {
  await query('UPDATE usuarios SET rol = @rol WHERE id = @id', [
    { name: 'id', type: sql.Int, value: id },
    { name: 'rol', type: sql.VarChar(20), value: rol },
  ]);
  return { updated: id, rol };
}

async function getAllOrders() {
  return query(
    `SELECT v.*, c.nombre + ' ' + c.apellido AS cliente_nombre, v2.nombre + ' ' + v2.apellido AS vendedor_nombre
     FROM ventas v
     LEFT JOIN usuarios c ON v.id_cliente = c.id
     LEFT JOIN usuarios v2 ON v.id_vendedor = v2.id
     ORDER BY v.fecha DESC`,
    []
  );
}

async function updateOrderStatus(id, estado) {
  await query('UPDATE ventas SET estado = @estado WHERE id = @id', [
    { name: 'id', type: sql.Int, value: id },
    { name: 'estado', type: sql.VarChar(30), value: estado },
  ]);
  return { updated: id, estado };
}

async function deleteOrder(id) {
  await query('DELETE FROM detalle_ventas WHERE id_venta = @id', [{ name: 'id', type: sql.Int, value: id }]);
  await query('DELETE FROM ventas WHERE id = @id', [{ name: 'id', type: sql.Int, value: id }]);
  return { deleted: id };
}

async function getStats() {
  const users = await query('SELECT COUNT(*) AS totalUsuarios FROM usuarios', []);
  const products = await query('SELECT COUNT(*) AS totalProductos FROM productos WHERE activo = 1', []);
  const orders = await query('SELECT COUNT(*) AS totalPedidos FROM ventas', []);
  const revenue = await query("SELECT ISNULL(SUM(total), 0) AS ingresos FROM ventas WHERE estado != 'cancelado'", []);
  return {
    totalUsuarios: users[0]?.totalUsuarios || 0,
    totalProductos: products[0]?.totalProductos || 0,
    totalPedidos: orders[0]?.totalPedidos || 0,
    ingresos: revenue[0]?.ingresos || 0,
  };
}

async function getActivity() {
  return query('SELECT * FROM actividad ORDER BY fecha DESC', []);
}

module.exports = {
  getUsers,
  deleteUser,
  changeUserRole,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getStats,
  getActivity,
};
