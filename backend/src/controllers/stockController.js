const { validationResult } = require('express-validator');
const stockService = require('../services/stockService');
const productModel = require('../models/productModel');

async function getStockMovements(req, res, next) {
  try {
    const { productId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    const movements = await stockService.getStockMovements(
      productId ? parseInt(productId, 10) : null,
      parseInt(limit, 10),
      parseInt(offset, 10)
    );
    res.json(movements);
  } catch (error) {
    next(error);
  }
}

async function registerStockMovement(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idProducto, cantidad, tipo, motivo } = req.body;
    
    // Verificar que el producto existe
    const product = await productModel.getProductById(idProducto);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Registrar movimiento
    const movement = await stockService.registerStockMovement(idProducto, cantidad, tipo, motivo);

    // Actualizar stock del producto
    if (tipo === 'entrada') {
      const newStock = product.stock + cantidad;
      await productModel.updateProductStock(idProducto, newStock);
    } else if (tipo === 'salida') {
      const newStock = Math.max(0, product.stock - cantidad);
      await productModel.updateProductStock(idProducto, newStock);
    }

    res.status(201).json({ message: 'Movimiento registrado', movement });
  } catch (error) {
    next(error);
  }
}

async function getInventory(req, res, next) {
  try {
    const inventory = await stockService.getInventory();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStockMovements,
  registerStockMovement,
  getInventory,
};
