// frontend/src/api/itemApi.js
import axiosClient from './axiosClient';

export const itemApi = {
  getAll: async () => {
    const response = await axiosClient.get('/items');
    return response.data; // array of items
  },

  create: async (itemPayload) => {
    // itemPayload = { itemName, itemPrice, itemType }
    const response = await axiosClient.post('/items', itemPayload);
    return response.data;
  },

  update: async (id, updatePayload) => {
    // updatePayload = { itemName, itemPrice, itemType }
    const response = await axiosClient.put(`/items/${id}`, updatePayload);
    return response.data;
  },

  remove: async (id) => {
    const response = await axiosClient.delete(`/items/${id}`);
    return response.data;
  },
};
