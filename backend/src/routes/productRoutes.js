const express = require('express');
const { query, param } = require('express-validator');
const productController = require('../controllers/productController');

const router = express.Router();

router.get(
  '/',
  [
    query('categoria').optional().isString(),
    query('search').optional().isString(),
    query('disponible').optional().isString(),
  ],
  productController.getProducts
);

router.get('/low-stock', productController.getLowStockAlert);

router.get(
  '/:id',
  [param('id').isInt().withMessage('ID de producto inválido')],
  productController.getProduct
);

module.exports = router;
