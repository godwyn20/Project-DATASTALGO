import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Grid, Box, Button, List, ListItem, ListItemText, Divider, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import bookService from '../services/bookService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone: '',
    birthdate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authService.getProfile();
        const userData = response.data;
        setUser(userData);
        setFormData({
          first_name: userData.first_name || '',
          middle_name: userData.middle_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          birthdate: userData.birthdate || ''
        });

        const books = await bookService.getSavedBooks();
        setSavedBooks(books);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <Container>
      <Typography>Loading...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8, minHeight: '100vh' }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 0 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
                Profile Information
              </Typography>
              {isEditing ? (
                <Box component="form" sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Middle Name"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 3 }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        try {
                          await authService.updateProfile(formData);
                          const updatedUser = authService.getCurrentUser();
                          setUser(updatedUser);
                          setIsEditing(false);
                        } catch (error) {
                          console.error('Error updating profile:', error);
                          // You might want to show an error message to the user here
                        }
                      }}
                      sx={{ flex: 1 }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                      sx={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Name
                    </Typography>
                    <Typography variant="h6">
                      {user ? `${user.first_name} ${user.middle_name || '( )'} ${user.last_name}` : 'Not set'}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="h6">{user?.email}</Typography>
                  </Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Phone
                    </Typography>
                    <Typography variant="h6">{user?.phone || 'Not set'}</Typography>
                  </Box>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Birthdate
                    </Typography>
                    <Typography variant="h6">{user?.birthdate || 'Not set'}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => setIsEditing(true)}
                    sx={{ mt: 2 }}
                  >
                    Edit Profile
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 0 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
              Saved Books
            </Typography>
            <List sx={{ mt: 2 }}>
              {savedBooks.length > 0 ? (
                savedBooks.map((book, index) => (
                  <React.Fragment key={book.id}>
                    <ListItem
                      button
                      component={Link}
                      to={`/books/${book.google_books_id}`}
                      sx={{
                        display: 'flex',
                        gap: 3,
                        alignItems: 'flex-start',
                        py: 3,
                        px: 2,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src={book.thumbnail_url}
                        alt={book.title}
                        sx={{
                          width: 100,
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                          boxShadow: 2
                        }}
                      />
                      <ListItemText
                        primary={
                          <Typography variant="h6" gutterBottom>
                            {book.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                              {book.authors?.join(', ')}
                            </Typography>
                            {book.publication_date && (
                              <Typography variant="body2" color="text.secondary">
                                Published: {new Date(book.publication_date).getFullYear()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < savedBooks.length - 1 && <Divider sx={{ my: 2 }} />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="h6" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
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