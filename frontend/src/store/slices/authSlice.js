import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/login/`, { username, password });
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue({
          message: error.response.data.error || Object.values(error.response.data).flat().join(' ')
        });
      }
      return rejectWithValue({
        message: 'An error occurred during login. Please try again.'
      });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/`, {
        username,
        email,
        password,
      });
      // Check if the response contains user data
      if (response.data) {
        return {
          user: response.data,
          access: response.data.access,
          refresh: response.data.refresh
        };
      }
      return rejectWithValue({
        message: 'Invalid response from server'
      });
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = '';
        
        // Handle different error response formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('. ');
        }
        
        return rejectWithValue({
          message: errorMessage || 'Registration failed. Please check your input.'
        });
      }
      return rejectWithValue({
        message: 'An error occurred during registration. Please try again.'
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.token = payload.token;
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
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
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
        state.error = null;
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;