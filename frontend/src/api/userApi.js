// frontend/src/api/userApi.js
import axiosClient from './axiosClient';

export const userApi = {
  getAll: async (q = '') => {
    const url = q ? `/users?q=${encodeURIComponent(q)}` : '/users';
    const response = await axiosClient.get(url);
    return response.data;
  },
  create: async (userPayload) => {
    const response = await axiosClient.post('/users', userPayload);
    return response.data;
  },
  update: async (id, updatePayload) => {
    const response = await axiosClient.put(`/users/${id}`, updatePayload);
    return response.data;
  },
  remove: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },
};
