import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Base URL
// In dev, prefer '/api' so Vite proxy forwards to backend.
// If VITE_API_BASE_URL is provided, normalize to ensure leading '/' when relative.
const API_BASE_URL = (() => {
  const raw = String(import.meta.env.VITE_API_BASE_URL ?? "/api");
  if (/^https?:/i.test(raw)) return raw; // absolute
  return raw.startsWith("/") ? raw : "/" + raw; // ensure leading slash
})();

// Optional API prefix safety. Leave empty unless you explicitly set VITE_API_PREFIX.
export const API_PREFIX: string = String(import.meta.env.VITE_API_PREFIX ?? "");

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  // Normalize URL: ensure leading '/', and optionally apply API_PREFIX once
  if (typeof config.url === "string" && !/^https?:/i.test(config.url)) {
    let url = config.url.startsWith("/") ? config.url : "/" + config.url;
    if (API_PREFIX) {
      const prefix = API_PREFIX.startsWith("/") ? API_PREFIX : "/" + API_PREFIX;
      if (!url.startsWith(prefix + "/") && url !== prefix) {
        url = prefix + (url === "/" ? "" : url);
      }
    }
    config.url = url;
  }
  return config;
});

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export const request = <T = unknown>(config: AxiosRequestConfig) => http.request<T>(config);

export default http;
