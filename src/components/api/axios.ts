import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "bypass-tunnel-reminder": "true" // This tells Pinggy to skip the warning page
  }
});