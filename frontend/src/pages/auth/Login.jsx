import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Divider, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import AuthPageLayout, { glassCardSx } from '../../components/AuthPageLayout';
import { BRAND_NAME, LOGO_SRC, authButtonSx, authLinkSx } from '../../constants/brand';

const fieldVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.35 + i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

const submitButtonSx = {
  ...authButtonSx,
  mt: 3,
  mb: 2,
  py: 1.5,
  width: '100%',
};

export default function Login() {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!formData.identifier.trim()) return 'Username or Email is required.';
    if (!formData.password) return 'Password is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const res = await login(formData.identifier, formData.password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <AuthPageLayout>
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.92, rotateX: 8 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        sx={glassCardSx}
      >
        <CardContent>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            sx={{ textAlign: 'center', mb: 4 }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt={BRAND_NAME}
              sx={{ height: 56, mb: 2, objectFit: 'contain' }}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#f0f9ff' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your {BRAND_NAME} account
            </Typography>
          </Box>

          {error && (
            <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.12)' }}>
                {error}
              </Alert>
            </Box>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Box component={motion.div} custom={0} variants={fieldVariants} initial="hidden" animate="visible">
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
            </Box>
            <Box component={motion.div} custom={1} variants={fieldVariants} initial="hidden" animate="visible">
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
            </Box>

            <Button
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              fullWidth
              size="large"
              disabled={loading}
              sx={submitButtonSx}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3, borderColor: 'rgba(56, 189, 248, 0.15)' }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <GoogleLoginButton text="continue_with" mode="login" />
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Typography
                component={RouterLink}
                to="/sign-up"
                sx={authLinkSx}
              >
                Sign up here
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}
