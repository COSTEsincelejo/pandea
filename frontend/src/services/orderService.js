import api from '../api/client.js';

export async function createOrder(payload) {
  const response = await api.post('/orders', payload);
  return response.data;
}
