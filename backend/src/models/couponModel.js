const { query } = require('../config/db');

async function getCouponByCode(codigo) {
  const result = await query('SELECT * FROM cupones WHERE codigo = $1', [codigo]);
  return result[0] || null;
}

async function getCoupons() {
  return query('SELECT * FROM cupones ORDER BY codigo', []);
}

async function createCoupon(payload) {
  const result = await query(
    `INSERT INTO cupones (codigo, tipo, valor, min_orden, max_usos, descripcion, activo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      payload.codigo,
      payload.tipo,
      payload.valor,
      payload.min_orden || 0,
      payload.max_usos || 100,
      payload.descripcion,
      payload.activo !== undefined ? payload.activo : true,
    ]
  );
  return result[0];
}

async function updateCoupon(payload) {
  const result = await query(
    `UPDATE cupones SET
       codigo = COALESCE($2, codigo),
       tipo = COALESCE($3, tipo),
       valor = COALESCE($4, valor),
       min_orden = COALESCE($5, min_orden),
       max_usos = COALESCE($6, max_usos),
       activo = COALESCE($7, activo),
       descripcion = COALESCE($8, descripcion)
     WHERE id = $1
     RETURNING *`,
    [
      payload.id,
      payload.codigo,
      payload.tipo,
      payload.valor,
      payload.min_orden,
      payload.max_usos,
      payload.activo,
      payload.descripcion,
    ]
  );
  return result[0];
}

async function deleteCoupon(id) {
  await query('DELETE FROM cupones WHERE id = $1', [id]);
  return { deleted: id };
}

async function incrementCouponUses(codigo) {
  const result = await query(
    `UPDATE cupones SET usos = usos + 1
     WHERE codigo = $1
     RETURNING *`,
    [codigo]
  );
  return result[0] || null;
}

module.exports = {
  getCouponByCode,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUses,
};
