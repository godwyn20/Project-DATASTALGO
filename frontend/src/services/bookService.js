import api from './api';
import subscriptionService, { SubscriptionTiers, SubscriptionFeatures } from './subscriptionService';

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
      // Use Google Books API through our backend
      const response = await api.get('/api/googlebooks/googlebooks/search/', {
        params: { q: query }
      });
      
      // The response is already transformed by our backend
      const transformedResults = response.data.map(book => ({
        google_books_id: book.google_books_id,
        title: book.title,
        authors: book.authors,
        thumbnail_url: book.thumbnail_url,
        publication_date: book.publication_date,
        language: book.language
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
      // Get book details from our backend Google Books API
      const response = await api.get(`/api/googlebooks/googlebooks/${bookId}/`);
      const bookData = response.data;
      
      // Check subscription access
      const subscription = await subscriptionService.getCurrentSubscription();
      const canAccessPremiumBooks = subscriptionService.checkFeatureAccess(subscription.tier, 'canAccessPremiumBooks');
      
      if (bookData.isPremium && !canAccessPremiumBooks) {
        throw new Error('Upgrade your subscription to access premium books');
      }
      
      return {
        ...bookData,
        title: bookData.title || 'Untitled',
        description: bookData.description || '',
        subjects: bookData.categories ? bookData.categories.split(', ') : [],
        thumbnail_url: bookData.thumbnail_url || null
      };
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  }

  async searchBooksByCategory(category) {
    try {
      // Format the query based on category type
      let formattedQuery;
      
      // Map category IDs to appropriate Google Books API query formats
      const categoryMappings = {
        'fiction': 'subject:fiction',
        'non-fiction': 'subject:nonfiction',
        'mystery': 'subject:mystery+thriller',
        'science': 'subject:science',
        'history': 'subject:history',
        'biography': 'subject:biography+autobiography',
        'poetry': 'subject:poetry',
        'drama': 'subject:drama',
        'romance': 'subject:romance',
        'technology': 'subject:technology',
        'sci-fi': 'subject:science+fiction',
        'science-fiction': 'subject:science+fiction',
        'scifi': 'subject:science+fiction',
        'fantasy': 'subject:fantasy'
      };
      
      // Use the mapping if available, otherwise fall back to the default format
      formattedQuery = categoryMappings[category.toLowerCase()] || `subject:${category}`;
      
      // Use Google Books API through our backend
      const response = await api.get('/api/googlebooks/googlebooks/search/', {
        params: { q: formattedQuery }
      });
      
      // The response is already transformed by our backend
      const transformedResults = response.data.map(book => ({
        google_books_id: book.google_books_id,
        title: book.title,
        authors: book.authors,
        thumbnail_url: book.thumbnail_url,
        publication_date: book.publication_date,
        language: book.language
      }));

      return transformedResults;
    } catch (error) {
      console.error('Error searching books by category:', error);
      throw error;
    }
  }
}

export default new BookService();