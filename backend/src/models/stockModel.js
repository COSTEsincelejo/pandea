const { query } = require('../config/db');

async function getStockMovements(idProducto = null, limit = 100, offset = 0) {
  if (idProducto) {
    return query(
      `SELECT ms.*, p.nombre AS producto_nombre
       FROM movimientos_stock ms
       LEFT JOIN productos p ON ms.id_producto = p.id
       WHERE ms.id_producto = $1
       ORDER BY ms.fecha DESC
       LIMIT $2 OFFSET $3`,
      [idProducto, limit, offset]
    );
  }

  return query(
    `SELECT ms.*, p.nombre AS producto_nombre
     FROM movimientos_stock ms
     LEFT JOIN productos p ON ms.id_producto = p.id
     ORDER BY ms.fecha DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
}

async function createStockMovement(idProducto, cantidad, tipo, motivo) {
  const result = await query(
    `INSERT INTO movimientos_stock (id_producto, cantidad, tipo, motivo)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [idProducto, cantidad, tipo, motivo]
  );
  return result[0];
}

async function getProductInventory() {
  return query(
    `SELECT p.id, p.nombre, p.stock, p.precio, c.nombre AS categoria_nombre, 
            COUNT(ms.id) AS total_movimientos
     FROM productos p
     LEFT JOIN categorias c ON p.id_categoria = c.id
     LEFT JOIN movimientos_stock ms ON p.id = ms.id_producto
     WHERE p.activo = true
     GROUP BY p.id, c.nombre
     ORDER BY p.nombre`,
    []
  );
}

module.exports = {
  getStockMovements,
  createStockMovement,
  getProductInventory,
};
