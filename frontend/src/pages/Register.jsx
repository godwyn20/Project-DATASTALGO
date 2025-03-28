import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { register, clearError } from '../store/slices/authSlice';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate Email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Validate Username
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    // Validate Password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await dispatch(register(formData)).unwrap();
      setSuccessMessage('Registration successful! Welcome to Bookflix!');
      setFormData({
        email: '',
        username: '',
        password: ''
      });
      setTimeout(() => {
        dispatch(clearError());
        navigate('/');
      }, 2000);
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setValidationErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    }
  };

  const textFieldStyle = {
    input: { color: 'white' },
    '& label': { color: 'white' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'white' },
      '&:hover fieldset': { borderColor: 'white' },
      '&.Mui-focused fieldset': { borderColor: 'white' }
    },
    '& input[type="date"]::-webkit-calendar-picker-indicator': {
      filter: 'invert(1)'
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
      <Container maxWidth="md">
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            padding: 4,
            borderRadius: 2,
            width: '100%'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white' }}>
            Sign Up
          </Typography>

          {error && <Alert severity="error" sx={{ '& .MuiAlert-message': { color: '#000000' } }}>{error.message}</Alert>}
          {successMessage && <Alert severity="success" sx={{ 
            width: '100%',
            marginBottom: 2,
            backgroundColor: '#2e7d32',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '& .MuiAlert-message': { 
              color: '#ffffff',
              textAlign: 'center'
            },
            '& .MuiAlert-icon': {
              color: '#ffffff'
            }
          }}>{successMessage}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                sx={textFieldStyle}
              />
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                error={!!validationErrors.username}
                helperText={validationErrors.username}
                sx={textFieldStyle}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                sx={textFieldStyle}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#ff0000',
                '&:hover': {
                  bgcolor: '#cc0000'
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>

            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'white' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#ff0000', textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Register;