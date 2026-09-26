import axios from 'axios';
import { currentLang, isLangScoped } from './contentLang';

const api = axios.create({ baseURL: '/api', withCredentials: true });

// Attach the JWT to authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mortar_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  // Reading /en/post/<slug> must fetch the English row: the language comes from
  // the address bar, so every component keeps calling '/posts' unchanged. On the
  // default language there is nothing to add and the request is identical to
  // what a single-language install has always sent.
  const lang = currentLang();
  if (lang && isLangScoped(config.url)) {
    config.params = { ...(config.params || {}), lang };
  }
  return config;
});

export default api;
