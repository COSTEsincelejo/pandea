const express = require('express');
const { query, param } = require('express-validator');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', [query('categoria').optional().isString()], productController.getProducts);
router.get('/:id', [param('id').isInt().withMessage('ID de producto inválido')], productController.getProduct);

module.exports = router;
