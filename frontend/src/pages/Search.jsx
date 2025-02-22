import React, { useState, useEffect } from 'react';
import { Box, Container, TextField, Typography, Grid, CircularProgress } from '@mui/material';
import bookService from '../services/bookService';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardMedia, CardActionArea } from '@mui/material';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = async (query, category) => {
    setLoading(true);
    setError(null);

    try {
      let results;
      if (category) {
        results = await bookService.searchBooksByCategory(category);
      } else if (query.trim()) {
        results = await bookService.searchBooks(query.trim());
      } else {
        setSearchResults([]);
        return;
      }
      setSearchResults(results);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    setSearchQuery(query);
    performSearch(query, category);
  }, [searchParams]);

  const handleSearchChange = (event) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);
    
    const debounceTimeout = setTimeout(() => {
      setSearchParams(newQuery ? { q: newQuery } : {});
    }, 300);

    return () => clearTimeout(debounceTimeout);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 10, pb: 0, minHeight: '100vh' }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ my: 4 }}>
          <Typography color="error">
            {error}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 0 }}>
          {searchResults.map((book) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.open_library_id}>
              <Card component={Link} to={`/book/${book.open_library_id}`} sx={{ textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <CardMedia
                    component="img"
                    height="280"
                    image={book.thumbnail_url || '/placeholder-book.png'}
                    alt={book.title}
                    sx={{
                      objectFit: 'cover',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      p: book.thumbnail_url ? 0 : 2
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.2,
                      minHeight: '2.4em'
                    }}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {book.authors}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
          {searchResults.length === 0 && searchQuery && (
            <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No results found
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Search;
