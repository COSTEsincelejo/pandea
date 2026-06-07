const express = require('express');
const { body, param, query } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, expenseController.getExpenses);

router.get('/stats', requireAuth, requireAdmin, expenseController.getExpenseStats);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('concepto').isString().isLength({ min: 3 }).withMessage('Concepto debe tener al menos 3 caracteres'),
    body('monto').isNumeric({ min: 0 }).withMessage('Monto debe ser un número positivo'),
    body('fecha').isISO8601().withMessage('Fecha debe ser una fecha válida'),
  ],
  expenseController.createExpense
);

router.get(
  '/:id',
  requireAuth,
  requireAdmin,
  [param('id').isInt().withMessage('ID inválido')],
  expenseController.getExpense
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  [
    param('id').isInt().withMessage('ID inválido'),
    body('concepto').optional().isString(),
    body('monto').optional().isNumeric({ min: 0 }),
    body('fecha').optional().isISO8601(),
  ],
  expenseController.updateExpense
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  [param('id').isInt().withMessage('ID inválido')],
  expenseController.deleteExpense
);

module.exports = router;
