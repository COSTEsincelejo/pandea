import api from '../api/client.js';

export async function getProfile() {
  const response = await api.get('/users/me');
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.put('/users/me', payload);
  return response.data;
}

export async function getMyOrders() {
  const response = await api.get('/users/me/orders');
  return response.data;
}
