import axios from './axios';

export const profileApi = {
  updateProfile: (data) => axios.put('/api/auth/users/me/profile', data),
  changePassword: (data) => axios.put('/api/auth/users/me/password', data),
};