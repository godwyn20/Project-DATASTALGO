import React, { useState } from 'react';
import { Box, Container, TextField, Typography, Grid } from '@mui/material';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    // TODO: Implement actual search functionality
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Books
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for books..."
          value={searchQuery}
          onChange={handleSearch}
          sx={{ mb: 3 }}
        />
      </Box>
      
      <Grid container spacing={3}>
        {searchResults.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
            {/* TODO: Add BookCard component here */}
          </Grid>
        ))}
      </Grid>

      {searchResults.length === 0 && searchQuery && (
        <Typography variant="body1" color="text.secondary" align="center">
          No results found
        </Typography>
      )}
    </Container>
  );
};

export default Search;