import axios from "axios";

// Use /api so React page routes like /events can be served by the SPA.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const identityApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`
});

export const userApi = axios.create({
  baseURL: `${API_BASE_URL}/api/users`
});

export const eventApi = axios.create({
  baseURL: `${API_BASE_URL}/api/events`
});

export const bookingApi = axios.create({
  baseURL: `${API_BASE_URL}/api/bookings`
});

export const chatbotApi = axios.create({
  baseURL: `${API_BASE_URL}/api/chatbot`
});

export const setAuthToken = (token) => {
  const header = token ? `Bearer ${token}` : "";
  identityApi.defaults.headers.common.Authorization = header;
  userApi.defaults.headers.common.Authorization = header;
  bookingApi.defaults.headers.common.Authorization = header;
  eventApi.defaults.headers.common.Authorization = header;
  chatbotApi.defaults.headers.common.Authorization = header;
};
