import axios from "axios";
import { API, clearTokens, getAccessToken, refreshAccessToken } from "../services/auth";

const AxiosInstance = axios.create({
    baseURL: `${API}/`,
    timeout:5000,
    headers:({"Content-Type": "application/json"})
})
  AxiosInstance.interceptors.request.use((config) =>{
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config
  });

  AxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status !== 401 || originalRequest?._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      if (!(await refreshAccessToken())) {
        clearTokens();
        return Promise.reject(error);
      }
      originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
      return AxiosInstance(originalRequest);
    }
  );

  export default AxiosInstance;