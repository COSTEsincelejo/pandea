import api from '../api/client.js';

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function register(data) {
  const response = await api.post('/auth/register', data);
  return response.data;
}
