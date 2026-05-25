import { apiClient } from './axios';

export const setupInterceptors = (store) => {
  apiClient.interceptors.request.use((config) => {
    // Add auth token or other headers here
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
};
