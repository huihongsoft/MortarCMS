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

// Download a file through the authenticated API. Plain <a href> navigation
// cannot carry the Bearer token, so protected downloads (backups etc.) would
// 401 — fetch the blob with the token and save it via a temporary link.
export async function downloadFile(url: string, fallbackName: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('mortar_token');
    const r = await fetch('/api' + url, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
    if (!r.ok) return false;
    const blob = await r.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const cd = r.headers.get('Content-Disposition') || '';
    const m = cd.match(/filename="?([^";]+)"?/i);
    a.download = m ? m[1] : fallbackName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return true;
  } catch { return false; }
}
