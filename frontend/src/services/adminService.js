import api from '../api/client.js';

export async function getAdminStats() {
  const response = await api.get('/admin/stats');
  return response.data;
}

export async function getAdminActivity() {
  const response = await api.get('/admin/activity');
  return response.data;
}

export async function getAdminUsers() {
  const response = await api.get('/admin/users');
  return response.data;
}

export async function deleteAdminUser(id) {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
}

export async function changeAdminUserRole(id, rol) {
  const response = await api.put(`/admin/users/${id}/role`, { rol });
  return response.data;
}

export async function getAdminProducts() {
  const response = await api.get('/admin/products');
  return response.data;
}

export async function createAdminProduct(payload) {
  const response = await api.post('/admin/products', payload);
  return response.data;
}

export async function updateAdminProduct(id, payload) {
  const response = await api.put(`/admin/products/${id}`, payload);
  return response.data;
}

export async function deleteAdminProduct(id) {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
}

export async function getAdminOrders() {
  const response = await api.get('/admin/orders');
  return response.data;
}

export async function updateAdminOrderStatus(id, estado) {
  const response = await api.put(`/admin/orders/${id}`, { estado });
  return response.data;
}

export async function deleteAdminOrder(id) {
  const response = await api.delete(`/admin/orders/${id}`);
  return response.data;
}

export async function getAdminCoupons() {
  const response = await api.get('/admin/coupons');
  return response.data;
}

export async function createAdminCoupon(payload) {
  const response = await api.post('/admin/coupons', payload);
  return response.data;
}

export async function updateAdminCoupon(id, payload) {
  const response = await api.put(`/admin/coupons/${id}`, payload);
  return response.data;
}

export async function deleteAdminCoupon(id) {
  const response = await api.delete(`/admin/coupons/${id}`);
  return response.data;
}
