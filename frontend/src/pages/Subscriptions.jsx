import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Box, Snackbar, Alert } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import subscriptionService, { SubscriptionTiers, SubscriptionFeatures } from '../services/subscriptionService';

const subscriptionPlans = [
  {
    id: SubscriptionTiers.QUICK_READ,
    title: 'Quick Read',
    price: '20',
    features: [
      'Full access to all books',
      'Up to 10 books per month',
      'Up to 1 download per month',
      'Perfect for casual readers'
    ],
    color: '#4caf50'
  },
  {
    id: SubscriptionTiers.EXPLORER,
    title: 'Explorer',
    price: '49',
    features: [
      'Full access to all books',
      'Up to 20 books per month',
      'Up to 3 downloads per month',
      'Great for regular readers'
    ],
    color: '#2196f3'
  },
  {
    id: SubscriptionTiers.BOOKWORM,
    title: 'Bookworm',
    price: '99',
    features: [
      'Full access to all books',
      'Unlimited books per month',
      'Unlimited downloads',
      'Access to premium books',
      'Ideal for avid readers'
    ],
    color: '#f44336'
  }
];

const Subscriptions = () => {
  const [currentTier, setCurrentTier] = useState(SubscriptionTiers.QUICK_READ);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const subscription = await subscriptionService.getCurrentSubscription();
        if (subscription.error) {
          setMessage({
            open: true,
            text: subscription.error === 'unauthorized' 
              ? 'Please log in to view your subscription' 
              : 'No active subscription found. Please select a plan below.',
            severity: 'info'
          });
          setCurrentTier(null);
        } else {
          setCurrentTier(subscription.tier);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setMessage({
          open: true,
          text: 'Failed to fetch current subscription',
          severity: 'error'
        });
        setCurrentTier(null);
      }
    };
    fetchCurrentSubscription();
  }, []);

  const handleSubscribe = async (planId) => {
    try {
      if (planId === currentTier) {
        setMessage({
          open: true,
          text: 'You are already subscribed to this plan',
          severity: 'info'
        });
        return;
      }

      const response = await subscriptionService.upgradeSubscription(planId);
      setCurrentTier(planId);
      setMessage({
        open: true,
        text: 'Successfully upgraded subscription',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setMessage({
        open: true,
        text: error.message || 'Failed to upgrade subscription. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseMessage = () => {
    setMessage({ ...message, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Choose Your Subscription Plan
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 6 }}>
        Get unlimited access to our extensive library of books
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {subscriptionPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                  {plan.title}
                </Typography>
                <Box sx={{ textAlign: 'center', my: 3 }}>
                  <Typography variant="h3" component="p" color={plan.color}>
                    ₱{plan.price}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    per month
                  </Typography>
                </Box>
                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={`${plan.id}-feature-${index}`} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckIcon sx={{ color: plan.color }} />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}                  
                </List>
              </CardContent>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.id === currentTier}
                  sx={{
                    bgcolor: plan.color,
                    '&:hover': {
                      bgcolor: plan.color,
                      filter: 'brightness(0.9)'
                    },
                    '&.Mui-disabled': {
                      bgcolor: `${plan.color}80`
                    }
                  }}
                >
                  {plan.id === currentTier ? 'Current Plan' : 'Subscribe Now'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={message.open}
        autoHideDuration={6000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseMessage} severity={message.severity}>
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Subscriptions;