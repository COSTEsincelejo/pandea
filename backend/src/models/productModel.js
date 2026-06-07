const { query } = require('../config/db');

async function getProducts(categoriaId = null, search = null, disponible = null) {
  let whereClause = 'p.activo = true';
  let params = [];
  let paramCount = 1;

  if (categoriaId !== null) {
    whereClause += ` AND p.id_categoria = $${paramCount}`;
    params.push(categoriaId);
    paramCount++;
  }

  if (search) {
    whereClause += ` AND p.nombre ILIKE $${paramCount}`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (disponible !== null) {
    if (disponible === true || disponible === 'true') {
      whereClause += ` AND p.stock > 0`;
    } else if (disponible === false || disponible === 'false') {
      whereClause += ` AND p.stock = 0`;
    }
  }

  return query(
    `SELECT p.*, c.nombre AS categoria_nombre
     FROM productos p
     LEFT JOIN categorias c ON p.id_categoria = c.id
     WHERE ${whereClause}
     ORDER BY p.nombre`,
    params
  );
}

async function getProductsByCategory(categoriaId, search = null, disponible = null) {
  const parsed = Number(categoriaId);
  return getProducts(isNaN(parsed) ? null : parsed, search, disponible);
}

async function getProductsByName(search) {
  return getProducts(null, search, null);
}

async function getLowStockProducts(threshold = 5) {
  return query(
    `SELECT p.*, c.nombre AS categoria_nombre
     FROM productos p
     LEFT JOIN categorias c ON p.id_categoria = c.id
     WHERE p.activo = true AND p.stock < $1
     ORDER BY p.stock ASC`,
    [threshold]
  );
}

async function getCategoriaByName(nombre) {
  const result = await query('SELECT * FROM categorias WHERE nombre ILIKE $1', [nombre]);
  return result[0] || null;
}

async function getProductById(id) {
  const result = await query(
    `SELECT p.*, c.nombre AS categoria_nombre
     FROM productos p
     LEFT JOIN categorias c ON p.id_categoria = c.id
     WHERE p.id = $1`,
    [id]
  );
  return result[0] || null;
}

async function updateProductStock(id, stock) {
  const result = await query(
    `UPDATE productos SET stock = $2 WHERE id = $1 RETURNING *`,
    [id, stock]
  );
  return result[0];
}

async function createProduct(payload) {
  const result = await query(
    `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, imagen_url, es_nuevo, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      payload.nombre,
      payload.descripcion,
      payload.precio,
      payload.stock || 0,
      payload.id_categoria,
      payload.imagen_url,
      payload.es_nuevo || false,
      payload.activo !== undefined ? payload.activo : true,
    ]
  );
  return result[0];
}

async function updateProduct(id, payload) {
  const result = await query(
    `UPDATE productos SET
       nombre = COALESCE($2, nombre),
       descripcion = COALESCE($3, descripcion),
       precio = COALESCE($4, precio),
       stock = COALESCE($5, stock),
       id_categoria = COALESCE($6, id_categoria),
       imagen_url = COALESCE($7, imagen_url),
       es_nuevo = COALESCE($8, es_nuevo),
       activo = COALESCE($9, activo)
     WHERE id = $1
     RETURNING *`,
    [
      id,
      payload.nombre,
      payload.descripcion,
      payload.precio,
      payload.stock,
      payload.id_categoria,
      payload.imagen_url,
      payload.es_nuevo,
      payload.activo,
    ]
  );
  return result[0];
}

async function deleteProduct(id) {
  await query('DELETE FROM productos WHERE id = $1', [id]);
  return { deleted: id };
}

module.exports = {
  getProducts,
  getProductsByCategory,
  getProductsByName,
  getLowStockProducts,
  getCategoriaByName,
  getProductById,
  updateProductStock,
  createProduct,
  updateProduct,
  deleteProduct,
};
