// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
  isOtpVerified: false, 
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isOtpVerified: false, 
  },
  reducers: {
    setUserInfo: (state, action) => {
      state.user = action.payload; // Update the user data
    },
    setToken: (state, action) => {
      state.token = action.payload; // Update the token
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      return null;
    },
    verifyOtp: (state) => {
      state.isOtpVerified = true;
    },
    logout: (state) => {
      state.user = null;
      state.isOtpVerified = false;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user; // Store the user data
      state.token = action.payload.token; // Store the token
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, setUserInfo, setToken, setUser, verifyOtp, clearUser } = authSlice.actions;

export default authSlice.reducer;