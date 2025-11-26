// frontend/src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'https://fullstack-admin-panel-demo.vercel.app/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
