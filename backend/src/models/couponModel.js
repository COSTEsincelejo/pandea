const { executeProcedure, query } = require('../config/db');
const sql = require('mssql');

async function getCouponByCode(codigo) {
  const result = await executeProcedure('spGetCuponByCodigo', [
    { name: 'codigo', type: sql.VarChar(50), value: codigo },
  ]);
  return result[0] || null;
}

async function getCoupons() {
  return executeProcedure('spGetCupones', []);
}

async function createCoupon(payload) {
  const result = await executeProcedure('spCreateCupon', [
    { name: 'codigo', type: sql.VarChar(50), value: payload.codigo },
    { name: 'tipo', type: sql.VarChar(20), value: payload.tipo },
    { name: 'valor', type: sql.Decimal(10,2), value: payload.valor },
    { name: 'min_orden', type: sql.Decimal(12,2), value: payload.min_orden },
    { name: 'max_usos', type: sql.Int, value: payload.max_usos },
    { name: 'descripcion', type: sql.VarChar(300), value: payload.descripcion },
    { name: 'activo', type: sql.Bit, value: payload.activo },
  ]);
  return result[0];
}

async function updateCoupon(payload) {
  const result = await executeProcedure('spUpdateCupon', [
    { name: 'id', type: sql.Int, value: payload.id },
    { name: 'codigo', type: sql.VarChar(50), value: payload.codigo },
    { name: 'tipo', type: sql.VarChar(20), value: payload.tipo },
    { name: 'valor', type: sql.Decimal(10,2), value: payload.valor },
    { name: 'min_orden', type: sql.Decimal(12,2), value: payload.min_orden },
    { name: 'max_usos', type: sql.Int, value: payload.max_usos },
    { name: 'activo', type: sql.Bit, value: payload.activo },
    { name: 'descripcion', type: sql.VarChar(300), value: payload.descripcion },
  ]);
  return result[0];
}

async function deleteCoupon(id) {
  return executeProcedure('spDeleteCupon', [
    { name: 'id', type: sql.Int, value: id },
  ]);
}

async function incrementCouponUses(codigo) {
  const result = await getCouponByCode(codigo);
  if (!result) return null;
  await query(
    'UPDATE cupones SET usos = usos + 1 WHERE codigo = @codigo',
    [{ name: 'codigo', type: sql.VarChar(50), value: codigo }]
  );
  return { ...result, usos: (result.usos || 0) + 1 };
}

module.exports = {
  getCouponByCode,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUses,
};
