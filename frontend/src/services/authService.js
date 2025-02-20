import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users';

class AuthService {
  constructor() {
    this.init();
  }

  init() {
    // Add request interceptor for JWT token
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = this.getRefreshToken();
            const response = await axios.post(`${API_URL}/token/refresh/`, {
              refresh: refreshToken
            });
            
            if (response.data.access) {
              this.setToken(response.data.access);
              originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async register(username, email, password) {
    try {
      const response = await axios.post(API_URL + '/', {
        username,
        email,
        password
      });
      
      if (response.data.access) {
        this.setUserData(response.data);
      }
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errors = [];
          for (const [field, messages] of Object.entries(errorData)) {
            if (Array.isArray(messages)) {
              errors.push(`${field}: ${messages.join(' ')}`)
            } else if (typeof messages === 'string') {
              errors.push(`${field}: ${messages}`);
            }
          }
          throw new Error(errors.join('\n'));
        }
        throw new Error(errorData.error || errorData.message || 'Registration failed');
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login/`, {
        username,
        password
      });
      
      if (response.data.access) {
        this.setUserData(response.data);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Login failed');
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  setUserData(data) {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.access);
    localStorage.setItem('refreshToken', data.refresh);
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  handleError(error, defaultMessage) {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'object') {
        const errorMessage = Object.values(errorData)
          .flat()
          .filter(msg => msg)
          .join(' ');
        return new Error(errorMessage || defaultMessage);
      }
      return new Error(errorData.error || errorData.message || defaultMessage);
    }
    return new Error(defaultMessage);
  }
}

export default new AuthService();