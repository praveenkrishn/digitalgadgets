import axios from "axios";

import { getStoredAuth } from "../utils/storage.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api"
});

api.interceptors.request.use((config) => {
  const session = getStoredAuth();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

export default api;
