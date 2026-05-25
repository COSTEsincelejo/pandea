const { validationResult } = require('express-validator');
const userService = require('../services/userService');

async function getProfile(req, res, next) {
  try {
    const profile = await userService.getProfile(req.user.sub);
    return res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const profile = await userService.updateProfile(req.user.sub, req.body);
    return res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await userService.getMyOrders(req.user.sub);
    return res.json(orders);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getMyOrders,
};
