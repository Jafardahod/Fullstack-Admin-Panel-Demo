// frontend/src/api/userApi.js
import axiosClient from './axiosClient';

export const userApi = {
  // list users (optional search `q`)
  getAll: async (q = '') => {
    const url = q ? `/users?q=${encodeURIComponent(q)}` : '/users';
    const response = await axiosClient.get(url);
    return response.data;
  },

  // create user
  create: async (userPayload) => {
    const response = await axiosClient.post('/users', userPayload);
    return response.data;
  },

  // update user
  update: async (id, updatePayload) => {
    const response = await axiosClient.put(`/users/${id}`, updatePayload);
    return response.data;
  },

  // legacy/remove - kept for compatibility (DELETE now performs soft-deactivate on backend)
  remove: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },

  // explicit deactivate helper (calls DELETE which your backend uses to set is_active = 0)
  deactivate: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  },

  // activate helper (PATCH /users/:id/activate)
  activate: async (id) => {
    const response = await axiosClient.patch(`/users/${id}/activate`);
    return response.data;
  },
};

export default userApi;
