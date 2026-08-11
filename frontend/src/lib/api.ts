import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// Attach the JWT to authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mortar_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

export default api;
