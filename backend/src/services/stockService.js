const stockModel = require('../models/stockModel');
const { updateProductStock } = require('../models/productModel');

async function getStockMovements(idProducto, limit, offset) {
  return stockModel.getStockMovements(idProducto, limit, offset);
}

async function registerStockMovement(idProducto, cantidad, tipo, motivo) {
  const movement = await stockModel.createStockMovement(idProducto, cantidad, tipo, motivo);

  // Actualizar stock del producto
  if (tipo === 'entrada') {
    await updateProductStock(idProducto, new Promise((resolve) => {
      resolve(); // placeholder, será actualizado en el controlador
    }));
  } else if (tipo === 'salida') {
    // Restar del stock
  }

  return movement;
}

async function getInventory() {
  return stockModel.getProductInventory();
}

module.exports = {
  getStockMovements,
  registerStockMovement,
  getInventory,
};
