import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users';

const authService = {
  register: async (username, email, password) => {
    try {
      const response = await axios.post(API_URL + '/', {
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
      const response = await axios.post(`${API_URL}/login/`, {
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
    axios.interceptors.request.use(
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
  }
};

export default authService;