import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

// Get the auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const SubscriptionTiers = {
  QUICK_READ: 'QUICK_READ',  // PHP 39
  EXPLORER: 'EXPLORER',      // PHP 129
  BOOKWORM: 'BOOKWORM'      // PHP 899
};

export const SubscriptionFeatures = {
  [SubscriptionTiers.QUICK_READ]: {
    canDownloadBooks: true,
    maxBooksPerMonth: 10,
    maxDownloads: 5,
    description: 'Perfect for casual readers',
    price: 39
  },
  [SubscriptionTiers.EXPLORER]: {
    canDownloadBooks: true,
    maxBooksPerMonth: 20,
    maxDownloads: 10,
    description: 'Great for regular readers',
    price: 99
  },
  [SubscriptionTiers.BOOKWORM]: {
    canDownloadBooks: true,
    maxBooksPerMonth: -1, // unlimited
    maxDownloads: -1, // unlimited
    description: 'Ideal for avid readers',
    price: 299
  }
};

const subscriptionService = {
  getCurrentSubscription: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found');
      return { tier: null, error: 'unauthorized' };
    }

    try {
      const response = await axios.get(`${BASE_URL}/subscriptions/current/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      if (error.response?.status === 401) {
        return { tier: null, error: 'unauthorized' };
      }
      return { tier: null, error: 'fetch_failed' };
    }
  },

  upgradeSubscription: async (newTier) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/subscriptions/upgrade/`,
        { tier: newTier },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  },

  checkFeatureAccess: (userTier, feature) => {
    return SubscriptionFeatures[userTier]?.[feature] || false;
  }
};

export default subscriptionService;