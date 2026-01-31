import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'pgy-no-browser-warning': 'true' // This bypasses the Pinggy warning page
  }
});