import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Button, Chip, Stack, Alert } from '@mui/material';
import BookService from '../services/bookService';
import subscriptionService, { SubscriptionTiers } from '../services/subscriptionService';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookData, subscriptionData] = await Promise.all([
          BookService.getBookDetails(id),
          subscriptionService.getCurrentSubscription()
        ]);
        setBook(bookData);
        setSubscription(subscriptionData);
      } catch (err) {
        setError(err.message || 'Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpgradeClick = () => {
    navigate('/subscriptions');
  };

  if (loading) return (
    <Container>
      <Typography>Loading...</Typography>
    </Container>
  );

  if (error) return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {error.includes('subscription') && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpgradeClick}
            sx={{ mt: 2 }}
          >
            Upgrade Subscription
          </Button>
        )}
      </Box>
    </Container>
  );

  if (!book) return (
    <Container>
      <Typography>Book not found</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, height: '100%', borderRadius: 0 }}>
        {book.isPremium && subscription?.tier !== SubscriptionTiers.PREMIUM && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This is a premium book. Upgrade your subscription to access premium content.
            <Button
              variant="outlined"
              size="small"
              onClick={handleUpgradeClick}
              sx={{ ml: 2 }}
            >
              Upgrade Now
            </Button>
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {book.thumbnail_url ? (
              <Box
                component="img"
                sx={{
                  width: '100%',                  
                  height: 'auto',
                  borderRadius: 1,
                  boxShadow: 3,
                  display: 'block'
                }}
                alt={book.title}
                src={book.thumbnail_url}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '500px',
                  borderRadius: 1,
                  bgcolor: 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No cover available
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                wordBreak: 'break-word',
                mb: 2,
                mt: 2
              }}
            >
              {book.title || 'Untitled'}
            </Typography>
            {book.authors && (
              <Typography 
                variant="h6" 
                color="text.secondary" 
                gutterBottom
                sx={{ 
                  wordBreak: 'break-word',
                  mb: 3
                }}
              >
                by {book.authors}
              </Typography>
            )}
            {book.description && (
              <Typography 
                variant="body1" 
                paragraph
                sx={{ 
                  mb: 4,
                  lineHeight: 1.8
                }}
              >
                {book.description}
              </Typography>
            )}
            {book.subjects && book.subjects.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Subjects
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {book.subjects.map((subject, index) => (
                    <Chip
                      key={index}
                      label={subject}
                      sx={{ m: 0.5 }}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookDetail;