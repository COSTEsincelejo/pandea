const productModel = require('../models/productModel');

async function getProducts(categoria, search, disponible) {
  // Si categoria es nombre (string), buscar su ID
  let categoriaId = null;
  if (categoria && isNaN(categoria)) {
    const cat = await productModel.getCategoriaByName(categoria);
    categoriaId = cat ? cat.id : null;
  } else if (categoria) {
    categoriaId = Number(categoria) || null;
  }

  return productModel.getProducts(categoriaId, search, disponible);
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

async function getLowStockProducts(threshold = 5) {
  return productModel.getLowStockProducts(threshold);
}

async function getLowStockCount(threshold = 5) {
  const products = await productModel.getLowStockProducts(threshold);
  return products.length;
}

module.exports = {
  getProducts,
  getProduct,
  getLowStockProducts,
  getLowStockCount,
};
