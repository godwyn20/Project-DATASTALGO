import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ username, password });
      return response;
    } catch (error) {
      return rejectWithValue({
        message: error.message
      });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue({
        message: error.message
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: false,
    error: null,
    isAuthenticated: authService.isAuthenticated(),
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      authService.logout();
    },
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.access;
        state.refreshToken = payload.refresh;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        state.isAuthenticated = false;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.access;
        state.refreshToken = payload.refresh;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;