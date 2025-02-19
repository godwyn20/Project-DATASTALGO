import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Alert } from '@mui/material';
import { register } from '../store/slices/authSlice';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      dispatch({ type: 'auth/setError', payload: { message: 'Passwords do not match' } });
      return;
    }
    
    // Validate password length
    if (formData.password.length < 8) {
      dispatch({ type: 'auth/setError', payload: { message: 'Password must be at least 8 characters long' } });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      dispatch({ type: 'auth/setError', payload: { message: 'Please enter a valid email address' } });
      return;
    }
    
    const { confirmPassword, ...registerData } = formData;
    const result = await dispatch(register(registerData));
    
    if (!result.error) {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setSuccessMessage('Registration successful! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
            Sign Up
          </Typography>

          {error && <Alert severity="error" sx={{ '& .MuiAlert-message': { color: '#000000' } }}>{error.message}</Alert>}
          {successMessage && <Alert severity="success" sx={{ '& .MuiAlert-message': { color: '#000000' } }}>{successMessage}</Alert>}

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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
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
              autoComplete="new-password"
              value={formData.password}
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
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
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
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
            <Typography variant="body2" align="center" sx={{ color: 'white' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#e50914', textDecoration: 'none' }}>
                Sign in now
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Register;