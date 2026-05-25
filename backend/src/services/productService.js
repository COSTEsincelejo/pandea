const productModel = require('../models/productModel');

async function getProducts(categoria) {
  if (!categoria || categoria === 'all') {
    return productModel.getProducts(null);
  }
  return productModel.getProductsByCategory(categoria);
}

async function getProduct(id) {
  const product = await productModel.getProductById(id);
  if (!product) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return product;
}

module.exports = {
  getProducts,
  getProduct,
};
