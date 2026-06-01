import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json"
  }
});

export function getApiError(error) {
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((item) => item.msg).join(", ");
    }
    return error.response.data.detail;
  }

  if (error.message) {
    return error.message;
  }

  return "Something went wrong";
}

export default api;
