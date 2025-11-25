// frontend/src/api/itemApi.js
import axiosClient from './axiosClient';

export const itemApi = {
  getAll: async (q = '') => {
    const url = q ? `/items?q=${encodeURIComponent(q)}` : '/items';
    const response = await axiosClient.get(url);
    return response.data;
  },
  create: async (itemPayload) => {
    const response = await axiosClient.post('/items', itemPayload);
    return response.data;
  },
  update: async (id, updatePayload) => {
    const response = await axiosClient.put(`/items/${id}`, updatePayload);
    return response.data;
  },
  remove: async (id) => {
    const response = await axiosClient.delete(`/items/${id}`);
    return response.data;
  },
};
