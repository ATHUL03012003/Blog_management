import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Container, Divider, MenuItem, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!formData.username.trim() || formData.username.length < 3) return 'Username must be at least 3 characters.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address.';

    if (formData.password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) return 'Password must contain at least one letter and one number.';

    if (formData.password !== formData.password2) return 'Passwords do not match.';

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const res = await register(formData);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    } else {
      navigate('/sign-in'); // Redirect to login after successful register
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ width: '100%' }}>
        <Card sx={{ p: 2, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Create an Account</Typography>
              <Typography variant="body2" color="text.secondary">Join NEXUSBLog today</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Username"
                name="username"
                variant="outlined"
                margin="normal"
                required
                value={formData.username}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Email address"
                name="email"
                type="email"
                variant="outlined"
                margin="normal"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                variant="outlined"
                margin="normal"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="password2"
                type="password"
                variant="outlined"
                margin="normal"
                required
                value={formData.password2}
                onChange={handleChange}
              />

              <Button type="submit" fullWidth variant="contained" color="primary" size="large" sx={{ mt: 3, mb: 2 }}>
                Sign Up
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Button fullWidth variant="outlined" sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: 20, marginRight: 10 }} />
              Sign up with Google
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Typography component={RouterLink} to="/sign-in" color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                  Log in here
                </Typography>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
