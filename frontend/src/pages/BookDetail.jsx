import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Implement API call to fetch book details
    setLoading(false);
  }, [id]);

  if (loading) return (
    <Container>
      <Typography>Loading...</Typography>
    </Container>
  );

  if (error) return (
    <Container>
      <Typography color="error">{error}</Typography>
    </Container>
  );

  if (!book) return (
    <Container>
      <Typography>Book not found</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1
              }}
              alt={book.title}
              src={book.coverImage || 'placeholder-image.jpg'}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>
            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="primary">
                Add to Reading List
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookDetail;