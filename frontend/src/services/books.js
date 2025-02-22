import api from './api';

const API_URL = '/books';

const booksService = {
  getTrending: async () => {
    try {
      const response = await api.get(`${API_URL}/trending/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch trending books' };
    }
  },

  getNewReleases: async () => {
    try {
      const response = await api.get(`${API_URL}/new-releases/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch new releases' };
    }
  },

  getRecommended: async () => {
    try {
      const response = await api.get(`${API_URL}/recommended/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch recommended books' };
    }
  },

  searchBooks: async (query) => {
    try {
      const response = await api.get(`${API_URL}/search/`, {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search books' };
    }
  },

  getBookDetails: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch book details' };
    }
  }
};

export default booksService;