import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const authService = {
  register: async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/users/`, {
        username,
        email,
        password
      });
      if (response.data.access) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data
        ? Object.values(error.response.data).flat().join(' ')
        : 'Registration failed. Please try again.';
      throw { message: errorMessage };
    }
  },

  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/token/`, {
        username,
        password
      });
      if (response.data.access) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      throw { message: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  // Add axios interceptor to include token in requests
  setupAxiosInterceptors: () => {
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

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post('http://localhost:8000/api/users/token/refresh/', {
              refresh: refreshToken
            });

            if (response.data.access) {
              localStorage.setItem('token', response.data.access);
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
};

export default authService;