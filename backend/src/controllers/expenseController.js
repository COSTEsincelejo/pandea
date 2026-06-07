const { validationResult } = require('express-validator');
const expenseService = require('../services/expenseService');

async function getExpenses(req, res, next) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const idAdmin = req.user?.sub || null; // El ID del admin autenticado
    
    const expenses = await expenseService.getExpenses(
      idAdmin,
      parseInt(limit, 10),
      parseInt(offset, 10)
    );
    res.json(expenses);
  } catch (error) {
    next(error);
  }
}

async function getExpense(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await expenseService.getExpenseById(parseInt(req.params.id, 10));
    res.json(expense);
  } catch (error) {
    next(error);
  }
}

async function createExpense(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { concepto, monto, fecha } = req.body;
    const idAdmin = req.user?.sub;

    const expense = await expenseService.createExpense(concepto, monto, fecha, idAdmin);
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
}

async function updateExpense(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { concepto, monto, fecha } = req.body;
    const expense = await expenseService.updateExpense(parseInt(req.params.id, 10), concepto, monto, fecha);
    res.json(expense);
  } catch (error) {
    next(error);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await expenseService.deleteExpense(parseInt(req.params.id, 10));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getExpenseStats(req, res, next) {
  try {
    const { months = 1 } = req.query;
    const stats = await expenseService.getExpenseStats(parseInt(months, 10));
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
};
