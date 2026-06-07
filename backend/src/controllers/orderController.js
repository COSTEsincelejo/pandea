const { validationResult } = require('express-validator');
const orderService = require('../services/orderService');

async function createOrder(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const payload = { ...req.body, id_cliente: req.user.sub };
    const order = await orderService.createOrder(payload);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function getUserOrders(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    const orders = await orderService.getOrdersByUser(userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(parseInt(id, 10));
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function getOrderStats(req, res, next) {
  try {
    const { days = 7 } = req.query;
    const stats = await orderService.getOrderStats(parseInt(days, 10));
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function getTopProducts(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const products = await orderService.getTopProducts(parseInt(limit, 10));
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { estado } = req.body;
    const order = await orderService.updateOrderStatus(parseInt(id, 10), estado);
    res.json(order);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  getOrderStats,
  getTopProducts,
  updateOrderStatus,
};
