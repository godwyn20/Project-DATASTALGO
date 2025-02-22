import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Button, Chip, Stack } from '@mui/material';
import BookService from '../services/bookService';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const data = await BookService.getBookDetails(id);
        setBook(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
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
    <Container maxWidth="lg" sx={{ py: 0, minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, height: '100%', borderRadius: 0 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {book.covers && book.covers[0] ? (
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
                src={book.covers[0]}
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
                mb: 2
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
              <Typography variant="body1" paragraph sx={{ mt: 3 }}>
                {book.description}
              </Typography>
            )}
            
            {book.subjects && book.subjects.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Subjects</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {book.subjects.map((subject, index) => (
                    <Chip key={index} label={subject} variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}

            {book.links && book.links.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>External Links</Typography>
                <Stack direction="row" spacing={2}>
                  {book.links.map((link, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.title}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}

            <Box sx={{ mt: 4 }}>
              <Button variant="contained" color="primary" onClick={() => BookService.toggleFavorite(id)}>
                Add to Favorites
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookDetail;