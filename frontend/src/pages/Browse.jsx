import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { searchBooks, toggleFavorite } from '../store/slices/bookSlice';

function Browse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, favorites, isLoading } = useSelector((state) => state.books);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Load initial book recommendations
    dispatch(searchBooks('bestsellers'));
  }, [dispatch, navigate, token]);

  const handleFavoriteClick = (bookId) => {
    dispatch(toggleFavorite(bookId));
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const isFavorite = (bookId) => {
    return favorites.some(book => book.id === bookId);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#141414',
        color: 'white',
        pt: 8,
        pb: 4
      }}
    >
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Browse Books
        </Typography>

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={3}>
            {searchResults.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#1f1f1f',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={book.thumbnail_url || '/book-placeholder.jpg'}
                    alt={book.title}
                    onClick={() => handleBookClick(book.id)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {book.title}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteClick(book.id);
                        }}
                        sx={{ color: '#e50914' }}
                      >
                        {isFavorite(book.id) ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {book.authors}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Browse;