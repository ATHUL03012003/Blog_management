import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Container, Divider, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!formData.identifier.trim()) return 'Username or Email is required.';
    if (!formData.password) return 'Password is required.';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const res = await login(formData.identifier, formData.password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} sx={{ width: '100%' }}>
        <Card sx={{ p: 2, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
               <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Welcome Back</Typography>
               <Typography variant="body2" color="text.secondary">Enter your credentials to access your account</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Username or Email"
                name="identifier"
                type="text"
                variant="outlined"
                margin="normal"
                required
                value={formData.identifier}
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
              
              <Button type="submit" fullWidth variant="contained" color="primary" size="large" sx={{ mt: 3, mb: 2 }}>
                Sign In
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <GoogleLoginButton text="continue_with" mode="login" />

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Typography component={RouterLink} to="/sign-up" color="primary" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                  Sign up here
                </Typography>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
