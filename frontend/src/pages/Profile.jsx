import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Box, Button, List, ListItem, ListItemText, Divider } from '@mui/material';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [readingList, setReadingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement API call to fetch user profile and reading list
    setLoading(false);
  }, []);

  if (loading) return (
    <Container>
      <Typography>Loading...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Profile
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {user?.email || 'example@email.com'}
              </Typography>
              <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Reading List
            </Typography>
            <List>
              {readingList.length > 0 ? (
                readingList.map((book, index) => (
                  <React.Fragment key={book.id}>
                    <ListItem>
                      <ListItemText
                        primary={book.title}
                        secondary={book.author}
                      />
                    </ListItem>
                    {index < readingList.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  Your reading list is empty
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;