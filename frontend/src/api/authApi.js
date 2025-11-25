// frontend/src/api/authApi.js
import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    // credentials = { username, password }
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data; // { token, user }
  },
};
