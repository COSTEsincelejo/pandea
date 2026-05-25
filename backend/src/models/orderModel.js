const { executeProcedure, query } = require('../config/db');
const sql = require('mssql');

async function getOrdersByClient(id_cliente) {
  const records = await query(
    `SELECT v.*, u.nombre + ' ' + u.apellido AS cliente_nombre
     FROM ventas v
     LEFT JOIN usuarios u ON v.id_cliente = u.id
     WHERE v.id_cliente = @id_cliente
     ORDER BY v.fecha DESC`,
    [{ name: 'id_cliente', type: sql.Int, value: id_cliente }]
  );
  return records;
}

async function createOrder(payload) {
  const result = await executeProcedure('spCreateVenta', [
    { name: 'id_cliente', type: sql.Int, value: payload.id_cliente },
    { name: 'id_vendedor', type: sql.Int, value: payload.id_vendedor },
    { name: 'subtotal', type: sql.Decimal(12,2), value: payload.subtotal },
    { name: 'descuento', type: sql.Decimal(12,2), value: payload.descuento },
    { name: 'total', type: sql.Decimal(12,2), value: payload.total },
    { name: 'metodo_contacto', type: sql.VarChar(30), value: payload.metodo_contacto },
    { name: 'estado', type: sql.VarChar(30), value: payload.estado },
    { name: 'codigo_cupon', type: sql.VarChar(50), value: payload.codigo_cupon },
  ]);
  return result[0];
}

async function createDetail(payload) {
  const result = await executeProcedure('spCreateDetalleVenta', [
    { name: 'id_venta', type: sql.Int, value: payload.id_venta },
    { name: 'id_producto', type: sql.Int, value: payload.id_producto },
    { name: 'cantidad', type: sql.Int, value: payload.cantidad },
    { name: 'precio_unitario', type: sql.Decimal(12,2), value: payload.precio_unitario },
  ]);
  return result[0];
}

module.exports = {
  getOrdersByClient,
  createOrder,
  createDetail,
};
