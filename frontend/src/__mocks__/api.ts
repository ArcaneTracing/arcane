import axios from "axios";
const BASE_API_URL = "/api";

export const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true
});


api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

    }
    return Promise.reject(error);
  }
);