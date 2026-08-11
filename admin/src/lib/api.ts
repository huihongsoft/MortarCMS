import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// ---- Global top progress bar while any API request is in flight ----
let pendingRequests = 0;
function setProgressBar(active: boolean) {
  let bar = document.getElementById('api-loading-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'api-loading-bar';
    document.body.appendChild(bar);
  }
  if (active) {
    pendingRequests++;
    bar.classList.add('active');
  } else {
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) bar.classList.remove('active');
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mortar_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  setProgressBar(true);
  return config;
});

api.interceptors.response.use(
  (res) => {
    setProgressBar(false);
    return res;
  },
  (err) => {
    setProgressBar(false);
    if (err.response?.status === 401) {
      localStorage.removeItem('mortar_token');
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin#/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
