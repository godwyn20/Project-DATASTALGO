import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material';

const BookRow = ({ title, books }) => {
  return (
    <Box sx={{ mb: 3, overflow: 'hidden' }}>
      <Typography variant="h5" sx={{ px: 4, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: '16px',
          padding: '20px 0',
          px: 4,
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '4px',
          },
        }}
      >
        {books.map((book) => (
          <Card
            key={book.id}
            component={Link}
            to={`/book/${book.id}`}
            sx={{
              minWidth: '200px',
              backgroundColor: '#2f2f2f',
              transition: 'transform 0.2s',
              textDecoration: 'none',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Box
              sx={{
                height: '300px',
                backgroundColor: !book.cover_image ? '#424242' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {book.cover_image ? (
                <CardMedia
                  component="img"
                  height="300"
                  image={book.cover_image}
                  alt={book.title}
                />
              ) : (
                <Typography variant="h6" sx={{ color: 'white', p: 2, textAlign: 'center' }}>
                  {book.title}
                </Typography>
              )}
            </Box>
            <CardContent>
              <Typography variant="subtitle1" component="div" sx={{ color: 'white' }}>
                {book.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.500' }}>
                {book.author}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default BookRow;