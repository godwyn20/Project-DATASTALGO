import React from 'react';
import { Box, Grid, Card, CardMedia, CardContent, Typography, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

const BookList = ({ books, onFavoriteToggle }) => {
  if (!books || books.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">No books found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ p: 2 }}>
      {books.map((book) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={book.id || book.key}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              sx={{
                height: 200,
                objectFit: 'contain',
                bgcolor: 'grey.100'
              }}
              image={book.thumbnail_url || `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`}
              alt={book.title}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="h2" noWrap>
                {book.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {book.authors}
              </Typography>
              {onFavoriteToggle && (
                <IconButton
                  onClick={() => onFavoriteToggle(book.id)}
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  {book.is_favorited ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BookList;