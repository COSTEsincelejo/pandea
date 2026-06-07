const { validationResult } = require('express-validator');
const productService = require('../services/productService');

async function getProducts(req, res, next) {
  try {
    const { categoria, search, disponible } = req.query;
    const products = await productService.getProducts(categoria, search, disponible);
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const product = await productService.getProduct(parseInt(req.params.id, 10));
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function getLowStockAlert(req, res, next) {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : 5;
    const count = await productService.getLowStockCount(threshold);
    res.json({ lowStockCount: count, threshold });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProduct,
  getLowStockAlert,
};
