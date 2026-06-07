const expenseModel = require('../models/expenseModel');

async function getExpenses(idAdmin, limit = 100, offset = 0) {
  return expenseModel.getExpenses(idAdmin, limit, offset);
}

async function getExpenseById(id) {
  const expense = await expenseModel.getExpenseById(id);
  if (!expense) {
    const error = new Error('Gasto no encontrado');
    error.status = 404;
    throw error;
  }
  return expense;
}

async function createExpense(concepto, monto, fecha, idAdmin) {
  if (!concepto || !monto || !fecha) {
    const error = new Error('Faltan datos requeridos');
    error.status = 400;
    throw error;
  }

  return expenseModel.createExpense(concepto, monto, fecha, idAdmin);
}

async function updateExpense(id, concepto, monto, fecha) {
  const existing = await getExpenseById(id);
  if (!existing) {
    const error = new Error('Gasto no encontrado');
    error.status = 404;
    throw error;
  }

  return expenseModel.updateExpense(id, concepto, monto, fecha);
}

async function deleteExpense(id) {
  const existing = await getExpenseById(id);
  if (!existing) {
    const error = new Error('Gasto no encontrado');
    error.status = 404;
    throw error;
  }

  return expenseModel.deleteExpense(id);
}

async function getExpenseStats(months = 1) {
  return expenseModel.getExpenseStats(months);
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
};
