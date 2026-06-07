const { query } = require('../config/db');

async function getOrdersByClient(id_cliente) {
  return query(
    `SELECT v.*, COALESCE(u.nombre, '') || ' ' || COALESCE(u.apellido, '') AS cliente_nombre
     FROM ventas v
     LEFT JOIN usuarios u ON v.id_cliente = u.id
     WHERE v.id_cliente = $1
     ORDER BY v.fecha DESC`,
    [id_cliente]
  );
}

async function getOrderById(id_venta) {
  const orderResult = await query(
    `SELECT v.*, u.nombre, u.apellido, u.email, u.documento, u.telefono, u.direccion
     FROM ventas v
     LEFT JOIN usuarios u ON v.id_cliente = u.id
     WHERE v.id = $1`,
    [id_venta]
  );
  if (!orderResult[0]) return null;
  
  const order = orderResult[0];
  const details = await query(
    `SELECT dv.*, p.nombre, p.imagen_url, c.nombre AS categoria
     FROM detalle_ventas dv
     LEFT JOIN productos p ON dv.id_producto = p.id
     LEFT JOIN categorias c ON p.id_categoria = c.id
     WHERE dv.id_venta = $1`,
    [id_venta]
  );
  
  return { ...order, detalles: details };
}

async function getAllOrders(limit = 100, offset = 0) {
  return query(
    `SELECT v.*, u.nombre, u.apellido, u.email
     FROM ventas v
     LEFT JOIN usuarios u ON v.id_cliente = u.id
     ORDER BY v.fecha DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
}

async function getOrderStats(diasAtras = 7) {
  const stats = await query(
    `SELECT 
       COUNT(*) AS total_ventas,
       SUM(v.total) AS total_ingresos,
       AVG(v.total) AS promedio_venta,
       DATE_TRUNC('day', v.fecha)::date AS fecha
     FROM ventas v
     WHERE v.fecha >= NOW() - INTERVAL '${diasAtras} days'
     GROUP BY DATE_TRUNC('day', v.fecha)
     ORDER BY fecha DESC`,
    []
  );
  return stats;
}

async function getTopProducts(limit = 10) {
  return query(
    `SELECT p.id, p.nombre, p.imagen_url, COUNT(dv.id_producto) AS total_vendidas, SUM(dv.cantidad) AS cantidad_total
     FROM detalle_ventas dv
     LEFT JOIN productos p ON dv.id_producto = p.id
     GROUP BY p.id, p.nombre, p.imagen_url
     ORDER BY total_vendidas DESC
     LIMIT $1`,
    [limit]
  );
}

async function updateOrderStatus(id_venta, estado) {
  const result = await query(
    `UPDATE ventas SET estado = $2 WHERE id = $1 RETURNING *`,
    [id_venta, estado]
  );
  return result[0];
}

async function createOrder(payload) {
  const result = await query(
    `INSERT INTO ventas (id_cliente, id_vendedor, subtotal, descuento, total, metodo_contacto, estado, codigo_cupon)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      payload.id_cliente,
      payload.id_vendedor || null,
      payload.subtotal,
      payload.descuento,
      payload.total,
      payload.metodo_contacto,
      payload.estado,
      payload.codigo_cupon,
    ]
  );
  return result[0];
}

async function createDetail(payload) {
  const result = await query(
    `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [payload.id_venta, payload.id_producto, payload.cantidad, payload.precio_unitario]
  );
  return result[0];
}

module.exports = {
  getOrdersByClient,
  getOrderById,
  getAllOrders,
  getOrderStats,
  getTopProducts,
  updateOrderStatus,
  createOrder,
  createDetail,
};
