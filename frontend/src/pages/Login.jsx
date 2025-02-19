import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Alert } from '@mui/material';
import { login } from '../store/slices/authSlice';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (!result.error) {
      navigate('/browse');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #000000 30%, #1a1a1a 90%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
            Sign In
          </Typography>

          {error && <Alert severity="error" sx={{ '& .MuiAlert-message': { color: '#000000' } }}>{error.message}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{ 
                mb: 2,
                input: { color: 'white' },
                '& label': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 3,
                input: { color: 'white' },
                '& label': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mb: 2, backgroundColor: '#e50914', '&:hover': { backgroundColor: '#b20710' } }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Typography variant="body2" align="center" sx={{ color: 'white' }}>
              New to BookFlix?{' '}
              <Link to="/register" style={{ color: '#e50914', textDecoration: 'none' }}>
                Sign up now
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;