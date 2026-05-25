const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');

async function getProfile(userId) {
  const user = await userModel.getUserById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }
  delete user.password_hash;
  return user;
}

async function updateProfile(userId, payload) {
  const user = await userModel.updateUser(userId, payload);
  if (!user) {
    const error = new Error('No se pudo actualizar el perfil');
    error.status = 400;
    throw error;
  }
  delete user.password_hash;
  return user;
}

async function getMyOrders(userId) {
  return orderModel.getOrdersByClient(userId);
}

module.exports = {
  getProfile,
  updateProfile,
  getMyOrders,
};
