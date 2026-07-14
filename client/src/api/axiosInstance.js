// ─────────────────────────────────────────────────────────────────────────────
// axiosInstance.js — The configured HTTP client used for all API calls.
//
// Instead of importing axios directly and repeating the base URL in every file,
// we create one shared instance here that all components use.
//
// Two automatic behaviours are wired in:
//
//   Before every request (request interceptor):
//     If the user is logged in, their Firebase identity token is automatically
//     attached to the request header as "Authorization: Bearer <token>".
//     The server checks this token to verify who the user is before allowing
//     protected actions (like creating an issue or viewing payment records).
//
//   After every response (response interceptor):
//     If the server replies with a 401 (Unauthorized — usually means the token
//     expired), the user is automatically redirected to the login page.
//     This prevents the user from seeing a cryptic error — they just get sent
//     back to login to refresh their session.
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';
import auth from '../firebase/firebase.config';

// Create an axios instance pointing at our backend API.
// In development this is http://localhost:5000/api.
// In production it is the Vercel backend URL set in the .env file.
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// ── Request interceptor: attach the Firebase auth token to every request ──
axiosInstance.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      // getIdToken() returns a fresh JWT token (auto-refreshes if expired)
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Response interceptor: handle expired/invalid sessions ──
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // successful responses pass through unchanged
  },
  (error) => {
    // 401 = the server rejected our auth token — redirect to login
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
