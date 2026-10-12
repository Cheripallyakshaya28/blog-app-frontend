import { create } from "zustand";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://blogapp-h3ux.onrender.com"
    : "http://localhost:4000");

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  error: null,

  login: async (userCred) => {
    try {
      set((state) => ({ ...state, loading: true }));

      let res = await axios.post(
        `${BASE_URL}/auth/login`,
        userCred,
        { withCredentials: true }
      );

      if (res.status === 200) {
        set({
          currentUser: res.data?.payload,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (err) {
      console.log("err is ", err);
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.error || "Login failed",
      });
    }
  },

  logout: async () => {
    try {
      set((state) => ({ ...state, loading: true }));

      let res = await axios.get(
        `${BASE_URL}/auth/logout`,
        { withCredentials: true }
      );

      if (res.status === 200) {
        set({
          currentUser: null,
          loading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    } catch (err) {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.error || "Logout failed",
      });
    }
  },
}));
