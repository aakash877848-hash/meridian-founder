import axios from 'axios';

const api = axios.create({
  baseURL: 'https://meridian-founder.onrender.com/api',
  withCredentials: true, // send/receive httpOnly auth cookies
});

// Transparent access-token refresh: if a request fails with a 401 whose
// code is TOKEN_EXPIRED, try refreshing once, then retry the original call.
let isRefreshing = false;
let queue = [];

const processQueue = (error) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (response && response.status === 401 && response.data?.code === 'TOKEN_EXPIRED' && !config._retry) {
      config._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject })).then(() => api(config));
      }
      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(config);
      } catch (refreshErr) {
        processQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
