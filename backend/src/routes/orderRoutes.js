const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const orderController = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [
    body('items').isArray({ min: 1 }).withMessage('El carrito no puede estar vacío'),
    body('subtotal').isNumeric().withMessage('Subtotal inválido'),
    body('total').isNumeric().withMessage('Total inválido'),
  ],
  orderController.createOrder
);

router.get('/my-orders', requireAuth, orderController.getUserOrders);

router.get('/stats', requireAuth, requireAdmin, orderController.getOrderStats);

router.get('/top-products', requireAuth, requireAdmin, orderController.getTopProducts);

router.get(
  '/:id',
  requireAuth,
  [param('id').isInt().withMessage('ID inválido')],
  orderController.getOrder
);

router.put(
  '/:id/status',
  requireAuth,
  requireAdmin,
  [
    param('id').isInt().withMessage('ID inválido'),
    body('estado').isIn(['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']).withMessage('Estado inválido'),
  ],
  orderController.updateOrderStatus
);

module.exports = router;
