const { query } = require('../config/db');

async function getUsers() {
  return query(
    `SELECT id, nombre, apellido, email, documento, rol, telefono, direccion, ciudad, fecha_registro
     FROM usuarios
     ORDER BY id`,
    []
  );
}

async function deleteUser(id) {
  await query('DELETE FROM usuarios WHERE id = $1', [id]);
  return { deleted: id };
}

async function changeUserRole(id, rol) {
  await query('UPDATE usuarios SET rol = $2 WHERE id = $1', [id, rol]);
  return { updated: id, rol };
}

async function getAllOrders() {
  return query(
    `SELECT v.*, COALESCE(c.nombre, '') || ' ' || COALESCE(c.apellido, '') AS cliente_nombre,
            COALESCE(v2.nombre, '') || ' ' || COALESCE(v2.apellido, '') AS vendedor_nombre
     FROM ventas v
     LEFT JOIN usuarios c ON v.id_cliente = c.id
     LEFT JOIN usuarios v2 ON v.id_vendedor = v2.id
     ORDER BY v.fecha DESC`,
    []
  );
}

async function updateOrderStatus(id, estado) {
  await query('UPDATE ventas SET estado = $2 WHERE id = $1', [id, estado]);
  return { updated: id, estado };
}

async function deleteOrder(id) {
  await query('DELETE FROM detalle_ventas WHERE id_venta = $1', [id]);
  await query('DELETE FROM ventas WHERE id = $1', [id]);
  return { deleted: id };
}

async function getStats() {
  const users = await query('SELECT COUNT(*)::int AS totalusuarios FROM usuarios', []);
  const products = await query('SELECT COUNT(*)::int AS totalproductos FROM productos WHERE activo = true', []);
  const orders = await query('SELECT COUNT(*)::int AS totalpedidos FROM ventas', []);
  const revenue = await query("SELECT COALESCE(SUM(total), 0)::numeric(12,2) AS ingresos FROM ventas WHERE estado != 'cancelado'", []);
  return {
    totalUsuarios: users[0]?.totalusuarios || 0,
    totalProductos: products[0]?.totalproductos || 0,
    totalPedidos: orders[0]?.totalpedidos || 0,
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
