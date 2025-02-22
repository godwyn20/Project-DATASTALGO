import api from './api';

class BookService {
  async getTrendingBooks() {
    const response = await api.get('/api/books/trending/');
    return response.data;
  }

  async getNewReleases() {
    const response = await api.get('/api/books/new-releases/');
    return response.data;
  }

  async getRecommendedBooks() {
    const response = await api.get('/api/books/recommended/');
    return response.data;
  }

  async searchBooks(query) {
    try {
      // Search OpenLibrary directly
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      // Transform the response to match our app's format
      const transformedResults = data.docs.slice(0, 20).map(book => ({
        open_library_id: book.key.split('/').pop(),
        title: book.title,
        authors: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
        thumbnail_url: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
        first_publish_year: book.first_publish_year,
        language: book.language ? book.language[0] : null
      }));

      return transformedResults;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  async toggleFavorite(bookId) {
    const response = await api.post(`/api/books/${bookId}/favorite/`);
    return response.data;
  }

  async updateReadingProgress(bookId, progress) {
    const response = await api.post(`/api/books/${bookId}/update_progress/`, {
      progress
    });
    return response.data;
  }

  async getBookDetails(bookId) {
    try {
      const response = await api.get(`/api/books/${bookId}/`);
      const bookData = response.data;
      
      // Fetch additional details from Open Library
      const olResponse = await fetch(`https://openlibrary.org/works/${bookId}.json`);
      const olData = await olResponse.json();
      
      // Merge Open Library data with our data, prioritizing our API's title
      return {
        ...bookData,
        title: bookData.title || olData.title || 'Untitled',
        description: olData.description?.value || olData.description || bookData.description,
        subjects: olData.subjects || [],
        covers: olData.covers?.map(id => `https://covers.openlibrary.org/b/id/${id}-L.jpg`) || [],
        links: olData.links || []
      };
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  }

  async getBooksByCategory(category) {
    const response = await api.get(`/api/books/category/${category}/`);
    return response.data;
  }
}

export default new BookService();