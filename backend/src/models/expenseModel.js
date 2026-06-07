const { query } = require('../config/db');

async function getExpenses(idAdmin = null, limit = 100, offset = 0) {
  let whereClause = '';
  let params = [];

  if (idAdmin) {
    whereClause = 'WHERE g.id_admin = $1';
    params = [idAdmin];
  }

  return query(
    `SELECT g.*, u.nombre, u.apellido
     FROM gastos g
     LEFT JOIN usuarios u ON g.id_admin = u.id
     ${whereClause}
     ORDER BY g.fecha DESC
     LIMIT ${idAdmin ? '$2' : '$1'} OFFSET ${idAdmin ? '$3' : '$2'}`,
    idAdmin ? [...params, limit, offset] : [limit, offset]
  );
}

async function getExpenseById(id) {
  const result = await query(
    `SELECT g.*, u.nombre, u.apellido
     FROM gastos g
     LEFT JOIN usuarios u ON g.id_admin = u.id
     WHERE g.id = $1`,
    [id]
  );
  return result[0] || null;
}

async function createExpense(concepto, monto, fecha, idAdmin) {
  const result = await query(
    `INSERT INTO gastos (concepto, monto, fecha, id_admin)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [concepto, monto, fecha, idAdmin]
  );
  return result[0];
}

async function updateExpense(id, concepto, monto, fecha) {
  const result = await query(
    `UPDATE gastos SET concepto = $2, monto = $3, fecha = $4 WHERE id = $1 RETURNING *`,
    [id, concepto, monto, fecha]
  );
  return result[0];
}

async function deleteExpense(id) {
  await query('DELETE FROM gastos WHERE id = $1', [id]);
  return { deleted: id };
}

async function getExpenseStats(mesAtras = 1) {
  return query(
    `SELECT 
       SUM(monto) AS total_gastos,
       AVG(monto) AS promedio_gasto,
       COUNT(*) AS cantidad_gastos,
       DATE_TRUNC('day', fecha)::date AS fecha
     FROM gastos
     WHERE fecha >= CURRENT_DATE - INTERVAL '${mesAtras} month'
     GROUP BY DATE_TRUNC('day', fecha)
     ORDER BY fecha DESC`,
    []
  );
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
};
