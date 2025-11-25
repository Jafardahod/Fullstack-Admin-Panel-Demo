// frontend/src/api/userApi.js
import axiosClient from './axiosClient';

export const userApi = {
  getAll: async () => {
    const response = await axiosClient.get('/users');
    return response.data; // array of users
  },

  create: async (userPayload) => {
    // userPayload = { userId, username, fullName, email, mobile, country, state, city, address, pincode, password }
    const response = await axiosClient.post('/users', userPayload);
    return response.data;
  },

  update: async (id, updatePayload) => {
    // updatePayload = { fullName, email, mobile, country, state, city, address, pincode }
    const response = await axiosClient.put(`/users/${id}`, updatePayload);
    return response.data;
  },

  remove: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },
};
