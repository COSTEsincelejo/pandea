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

module.exports = {
  createOrder,
};
