import React from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const subscriptionPlans = [
  {
    id: 'daily',
    title: 'Quick Read',
    price: '39',
    features: [
      'Full access to all books',
      '24-hour unlimited reading',
      'Access on all devices',
      'Offline reading'
    ],
    color: '#2196f3'
  },
  {
    id: 'weekly',
    title: 'Explorer',
    price: '129',
    features: [
      'Full access to all books',
      '7-day unlimited reading',
      'Access on all devices',
      'Offline reading',
      'Bookmark synchronization'
    ],
    color: '#9c27b0'
  },
  {
    id: 'monthly',
    title: 'Bookworm',
    price: '899',
    features: [
      'Full access to all books',
      '30-day unlimited reading',
      'Access on all devices',
      'Offline reading',
      'Bookmark synchronization',
      'Priority support'
    ],
    color: '#f44336'
  }
];

const Subscriptions = () => {
  const handleSubscribe = (planId) => {
    // TODO: Implement subscription logic
    console.log(`Subscribing to ${planId} plan`);
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
                
                  </Typography>
                </Box>
                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
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
                  sx={{
                    bgcolor: plan.color,
                    '&:hover': {
                      bgcolor: plan.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
                >
                  Subscribe Now
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Subscriptions;