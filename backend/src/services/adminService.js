const adminModel = require('../models/adminModel');
const productModel = require('../models/productModel');
const couponModel = require('../models/couponModel');

async function getUsers() {
  return adminModel.getUsers();
}

async function deleteUser(id) {
  return adminModel.deleteUser(id);
}

async function changeUserRole(id, rol) {
  return adminModel.changeUserRole(id, rol);
}

async function getProducts() {
  return productModel.getProducts(null);
}

async function createProduct(payload) {
  const modelPayload = {
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    precio: payload.precio,
    stock: payload.stock || 0,
    id_categoria: payload.categoria || payload.id_categoria || null,
    imagen_url: payload.imagen_url || payload.imagenUrl || null,
    es_nuevo: payload.es_nuevo || payload.esNuevo || false,
    activo: payload.activo !== undefined ? payload.activo : true,
  };
  const product = await productModel.createProduct(modelPayload);
  return product;
}

async function updateProduct(id, payload) {
  const modelPayload = {
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    precio: payload.precio,
    stock: payload.stock,
    id_categoria: payload.categoria || payload.id_categoria || null,
    imagen_url: payload.imagen_url || payload.imagenUrl || null,
    es_nuevo: payload.es_nuevo || payload.esNuevo,
    activo: payload.activo,
  };
  const product = await productModel.updateProduct(id, modelPayload);
  return product;
}

async function deleteProduct(id) {
  return productModel.deleteProduct(id);
}

async function getOrders() {
  return adminModel.getAllOrders();
}

async function updateOrderStatus(id, estado) {
  return adminModel.updateOrderStatus(id, estado);
}

async function deleteOrder(id) {
  return adminModel.deleteOrder(id);
}

async function getCoupons() {
  return couponModel.getCoupons();
}

async function createCoupon(payload) {
  return couponModel.createCoupon(payload);
}

async function updateCoupon(id, payload) {
  return couponModel.updateCoupon({ id, ...payload });
}

async function deleteCoupon(id) {
  return couponModel.deleteCoupon(id);
}

async function getStats() {
  return adminModel.getStats();
}

async function getActivity() {
  return adminModel.getActivity();
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
