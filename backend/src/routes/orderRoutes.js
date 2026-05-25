const express = require('express');
const { body, validationResult } = require('express-validator');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

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

module.exports = router;
