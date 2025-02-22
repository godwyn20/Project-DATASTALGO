import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress } from '@mui/material';
import BookService from '../services/bookService';
import BookCard from '../components/BookCard';

const Books = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState({
    trending: [],
    newReleases: [],
    recommended: []
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [trending, newReleases, recommended] = await Promise.all([
          BookService.getTrendingBooks(),
          BookService.getNewReleases(),
          BookService.getRecommendedBooks()
        ]);

        setCategories({
          trending: Array.isArray(trending) ? trending : [],
          newReleases: Array.isArray(newReleases) ? newReleases : [],
          recommended: Array.isArray(recommended) ? recommended : []
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Trending Books Section */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
          Trending Now
        </Typography>
        <Grid container spacing={3}>
          {categories.trending.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.open_library_id}>
              <BookCard 
                title={book.title}
                author={book.authors}
                cover={book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` : null}
                description={book.description || 'No description available'}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* New Releases Section */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
          New Releases
        </Typography>
        <Grid container spacing={3}>
          {categories.newReleases.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.open_library_id}>
              <BookCard 
                title={book.title}
                author={book.authors}
                cover={book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` : null}
                description={book.description || 'No description available'}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recommended Books Section */}
      <Box mb={6}>
        <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', mb: 3 }}>
          Recommended for You
        </Typography>
        <Grid container spacing={3}>
          {categories.recommended.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.open_library_id}>
              <BookCard 
                title={book.title}
                author={book.authors}
                cover={book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` : null}
                description={book.description || 'No description available'}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Books;