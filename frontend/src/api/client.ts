import axios from "axios";

// Reads sessionStorage directly rather than from AuthContext: interceptors
// run outside the React tree, so there's no hook to call here. sessionStorage
// is the same single source of truth AuthContext itself reads from.
const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
