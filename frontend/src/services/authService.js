import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const authService = {
  setSession: (data) => {
    if (data.access) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/users/', userData);
      if (response.data.access) {
        authService.setSession(response.data);
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = Object.values(error.response.data).flat().join(' ');
        throw new Error(errorMessage);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/users/login/', credentials);
      if (response.data.access) {
        authService.setSession(response.data);
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || Object.values(error.response.data).flat().join(' '));
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  logout: () => {
    authService.setSession({});
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile/');
      if (response.data) {
        // Update local storage with fresh data
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || Object.values(error.response.data).flat().join(' '));
      }
      throw new Error('Failed to fetch profile data. Please try again.');
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.patch('/users/profile/', userData);
      if (response.data) {
        const updatedUser = response.data;
        // Update the user data in localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || Object.values(error.response.data).flat().join(' '));
      }
      throw new Error('Failed to update profile. Please try again.');
    }
  },

  setupAxiosInterceptors: () => {
    // Clear any existing interceptors to prevent duplicates
    axiosInstance.interceptors.request.eject(axiosInstance.interceptors.request.handlers[0]);
    axiosInstance.interceptors.response.eject(axiosInstance.interceptors.response.handlers[0]);
    
    axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(`${API_URL}/token/refresh/`, {
              refresh: refreshToken
            });

            if (response.data.access) {
              localStorage.setItem('token', response.data.access);
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            authService.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
};

// Initialize axios interceptors
authService.setupAxiosInterceptors();

export default authService;
export { axiosInstance };