import authService from './authService';
import { axiosInstance } from './authService';


// Get the auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const SubscriptionTiers = {
  FREE: 'FREE',            // PHP 0
  BOOKWORM: 'BOOKWORM'      // PHP 99
};

export const SubscriptionFeatures = {
  [SubscriptionTiers.FREE]: {
    canDownloadBooks: true,
    canAccessPremiumBooks: false,
    bookLimit: 10, // Lifetime access limit
    maxDownloads: 1,
    description: 'Free default subscription',
    price: 0,
    price_usd: 0.00
  },
  [SubscriptionTiers.BOOKWORM]: {
    canDownloadBooks: true,
    canAccessPremiumBooks: true,
    bookLimit: -1, // Unlimited lifetime access
    maxDownloads: -1, // unlimited
    description: 'Ideal for avid readers',
    price: 99,
    price_usd: 1.98
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
      // Return FREE tier as the default subscription instead of error
      if (error.response?.status === 404) {
        console.log('No subscription found, defaulting to FREE tier');
        return { 
          tier: SubscriptionTiers.FREE,
          tier_details: SubscriptionFeatures[SubscriptionTiers.FREE],
          is_active: true,
          status: 'active'
        };
      }
      return { tier: null, error: 'fetch_failed' };
    }
  },

  upgradeSubscription: async (newTier) => {
    if (!authService.isAuthenticated()) {
      throw new Error('Please log in to upgrade your subscription');
    }

    try {
      // Get all available tiers from backend
      const tiersResponse = await axiosInstance.get('/subscriptions/tiers/');
      const tiers = tiersResponse.data;
      
      // Normalize tier names for comparison
      const normalizedNewTier = newTier.toLowerCase().trim();
      
      // Find matching tier - check both direct name and our SubscriptionTiers enum
      const selectedTier = tiers.find(tier => {
        const normalizedTierName = tier.name.toLowerCase().trim();
        return normalizedTierName === normalizedNewTier ||
               normalizedTierName === SubscriptionTiers[newTier]?.toLowerCase().trim();
      });
      
      if (!selectedTier) {
        const availableTiers = tiers.map(t => t.name).join(', ');
        throw new Error(`Subscription tier '${newTier}' not found. Available tiers: ${availableTiers}`);
      }
      
      // Use the tier ID from backend for upgrade
      const response = await axiosInstance.post(
        '/subscriptions/upgrade/',
        { tier_id: selectedTier.id },
        { headers: getAuthHeader() }
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