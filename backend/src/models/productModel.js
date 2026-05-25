const { executeProcedure, query } = require('../config/db');
const sql = require('mssql');

async function getProducts(categoriaId = null) {
  const result = await executeProcedure('spGetProductos', [
    { name: 'categoria', type: sql.Int, value: categoriaId },
  ]);
  return result;
}

async function getProductsByCategory(categoriaId) {
  const parsed = Number(categoriaId);
  return getProducts(isNaN(parsed) ? null : parsed);
}

async function getProductById(id) {
  const result = await executeProcedure('spGetProductoById', [
    { name: 'id', type: sql.Int, value: id },
  ]);
  return result[0] || null;
}

async function updateProductStock(id, stock) {
  const result = await executeProcedure('spUpdateProducto', [
    { name: 'id', type: sql.Int, value: id },
    { name: 'nombre', type: sql.VarChar(200), value: null },
    { name: 'descripcion', type: sql.Text, value: null },
    { name: 'precio', type: sql.Decimal(12,2), value: null },
    { name: 'stock', type: sql.Int, value: stock },
    { name: 'id_categoria', type: sql.Int, value: null },
    { name: 'imagen_url', type: sql.VarChar(500), value: null },
    { name: 'es_nuevo', type: sql.Bit, value: null },
    { name: 'activo', type: sql.Bit, value: null },
  ]);
  return result[0];
}

async function createProduct(payload) {
  const result = await executeProcedure('spCreateProducto', [
    { name: 'nombre', type: sql.VarChar(200), value: payload.nombre },
    { name: 'descripcion', type: sql.Text, value: payload.descripcion },
    { name: 'precio', type: sql.Decimal(12,2), value: payload.precio },
    { name: 'stock', type: sql.Int, value: payload.stock || 0 },
    { name: 'id_categoria', type: sql.Int, value: payload.id_categoria || null },
    { name: 'imagen_url', type: sql.VarChar(500), value: payload.imagen_url },
    { name: 'es_nuevo', type: sql.Bit, value: payload.es_nuevo ? 1 : 0 },
    { name: 'activo', type: sql.Bit, value: payload.activo !== undefined ? payload.activo : 1 },
  ]);
  return result[0];
}

async function updateProduct(id, payload) {
  const result = await executeProcedure('spUpdateProducto', [
    { name: 'id', type: sql.Int, value: id },
    { name: 'nombre', type: sql.VarChar(200), value: payload.nombre },
    { name: 'descripcion', type: sql.Text, value: payload.descripcion },
    { name: 'precio', type: sql.Decimal(12,2), value: payload.precio },
    { name: 'stock', type: sql.Int, value: payload.stock },
    { name: 'id_categoria', type: sql.Int, value: payload.id_categoria },
    { name: 'imagen_url', type: sql.VarChar(500), value: payload.imagen_url },
    { name: 'es_nuevo', type: sql.Bit, value: payload.es_nuevo !== undefined ? (payload.es_nuevo ? 1 : 0) : null },
    { name: 'activo', type: sql.Bit, value: payload.activo },
  ]);
  return result[0];
}

async function deleteProduct(id) {
  await executeProcedure('spDeleteProducto', [
    { name: 'id', type: sql.Int, value: id },
  ]);
  return { deleted: id };
}

module.exports = {
  getProducts,
  getProductsByCategory,
  getProductById,
  updateProductStock,
  createProduct,
  updateProduct,
  deleteProduct,
};
