const { validationResult } = require('express-validator');
const adminService = require('../services/adminService');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

async function getUsers(req, res, next) {
  try {
    const users = await adminService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.deleteUser(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function changeUserRole(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.changeUserRole(Number(req.params.id), req.body.rol);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getProducts(req, res, next) {
  try {
    const products = await adminService.getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.createProduct(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.updateProduct(Number(req.params.id), req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.deleteProduct(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await adminService.getOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.updateOrderStatus(Number(req.params.id), req.body.estado);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteOrder(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.deleteOrder(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getCoupons(req, res, next) {
  try {
    const coupons = await adminService.getCoupons();
    res.json(coupons);
  } catch (error) {
    next(error);
  }
}

async function createCoupon(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.createCoupon(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function updateCoupon(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.updateCoupon(Number(req.params.id), req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteCoupon(req, res, next) {
  try {
    const validation = handleValidation(req, res);
    if (validation) return;
    const result = await adminService.deleteCoupon(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function getActivity(req, res, next) {
  try {
    const activity = await adminService.getActivity();
    res.json(activity);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  deleteUser,
  changeUserRole,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getStats,
  getActivity,
};
