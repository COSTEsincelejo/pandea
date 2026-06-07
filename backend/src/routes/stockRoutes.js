const express = require('express');
const { body, param, query } = require('express-validator');
const stockController = require('../controllers/stockController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', stockController.getInventory);

router.get(
  '/movements/:productId',
  [param('productId').isInt(), query('limit').optional().isInt(), query('offset').optional().isInt()],
  stockController.getStockMovements
);

router.post(
  '/movements',
  requireAuth,
  requireAdmin,
  [
    body('idProducto').isInt().withMessage('ID de producto inválido'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('tipo').isIn(['entrada', 'salida']).withMessage('Tipo debe ser entrada o salida'),
    body('motivo').isString().withMessage('Motivo es requerido'),
  ],
  stockController.registerStockMovement
);

module.exports = router;
