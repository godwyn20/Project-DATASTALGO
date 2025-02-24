import React from 'react';
import { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, CardMedia, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'fiction', name: 'Fiction', image: '/categories/fiction.png' },
  { id: 'non-fiction', name: 'Non-Fiction', image: '/categories/non-fiction.png' },
  { id: 'mystery', name: 'Mystery', image: '/categories/mystery.png' },
  { id: 'science', name: 'Science', image: '/categories/science.png' },
  { id: 'history', name: 'History', image: '/categories/history.png' },
  { id: 'biography', name: 'Biography', image: '/categories/biography.png' },
  { id: 'poetry', name: 'Poetry', image: '/categories/poetry.png' },
  { id: 'drama', name: 'Drama', image: '/categories/drama.png' },
  { id: 'romance', name: 'Romance', image: '/categories/romance.png' },
  { id: 'technology', name: 'Technology', image: '/categories/technology.png' },
];

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate(`/search?category=${categoryId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Browse by Category
      </Typography>
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Card
              onClick={() => handleCategoryClick(category.id)}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={category.image}
                alt={category.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" align="center">
                  {category.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Categories;