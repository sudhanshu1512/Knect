import axios from 'axios';

const api = axios.create({
  baseURL: "https://knect.onrender.com/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.get(
          "http://localhost:8000/api/v1/user/refresh",
          {
            withCredentials: true,
          }
        );

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (error) {
        // If refresh token fails, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
