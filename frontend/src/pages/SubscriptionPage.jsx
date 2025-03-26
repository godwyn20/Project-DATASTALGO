import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await api.get('/subscriptions/tiers/');
        setTiers(response.data);
      } catch (error) {
        console.error('Error fetching tiers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

  const navigate = useNavigate();

  const handleSubscribe = async (tierId) => {
    try {
      const response = await api.post('/subscriptions/payment/', { tier_id: tierId });
      
      if (response.data.approval_url) {
        window.location.href = response.data.approval_url;
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error processing subscription');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
      <p className="text-gray-600 mb-8">Choose the plan that best fits your reading needs</p>
      
      {loading ? (
        <div>Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div 
              key={tier.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-4">{tier.name}</h2>
              <p className="text-3xl font-bold mb-4">₱{tier.price}</p>
              <p className="text-gray-600 mb-4">${tier.price_usd} USD (one-time payment)</p>
              <p className="text-gray-600 mb-4">{tier.description}</p>
              
              <button
                onClick={() => handleSubscribe(tier.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                {tier.payment_required ? 'Subscribe Now' : 'Start Free Tier'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}