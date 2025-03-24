import authService from './authService';
import { axiosInstance } from './authService';


// Get the auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const SubscriptionTiers = {
  QUICK_READ: 'QUICK_READ',  // PHP 20
  EXPLORER: 'EXPLORER',      // PHP 49
  BOOKWORM: 'BOOKWORM'      // PHP 99
};

export const SubscriptionFeatures = {
  [SubscriptionTiers.QUICK_READ]: {
    canDownloadBooks: true,
    canAccessPremiumBooks: false,
    maxBooksPerMonth: 10,
    maxDownloads: 1,
    description: 'Perfect for casual readers',
    price: 20
  },
  [SubscriptionTiers.EXPLORER]: {
    canDownloadBooks: true,
    canAccessPremiumBooks: false,
    maxBooksPerMonth: 20,
    maxDownloads: 3,
    description: 'Great for regular readers',
    price: 49
  },
  [SubscriptionTiers.BOOKWORM]: {
    canDownloadBooks: true,
    canAccessPremiumBooks: true,
    maxBooksPerMonth: -1, // unlimited
    maxDownloads: -1, // unlimited
    description: 'Ideal for avid readers',
    price: 99
  }
};

const subscriptionService = {
  getCurrentSubscription: async () => {
    if (!authService.isAuthenticated()) {
      console.log('No authentication token found');
      return { tier: null, error: 'unauthorized' };
    }

    try {
      // Make sure we're using the correct endpoint path
      const response = await axiosInstance.get('/subscriptions/current/');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      if (error.response?.status === 401) {
        return { tier: null, error: 'unauthorized' };
      }
      // Handle 404 as an expected case when no subscription exists
      if (error.response?.status === 404) {
        return { tier: null, error: 'no_subscription' };
      }
      return { tier: null, error: 'fetch_failed' };
    }
  },

  upgradeSubscription: async (newTier) => {
    if (!authService.isAuthenticated()) {
      throw new Error('Please log in to upgrade your subscription');
    }

    try {
      const response = await axiosInstance.post(
        '/api/subscriptions/upgrade/',
        { tier: newTier }
      );
      return response.data;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to upgrade subscription. Please try again.';
      throw new Error(errorMessage);
    }
  },

  checkFeatureAccess: (userTier, feature) => {
    return SubscriptionFeatures[userTier]?.[feature] || false;
  }
};

export default subscriptionService;