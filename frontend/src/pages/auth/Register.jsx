import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Divider, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import AuthPageLayout, { glassCardSx } from '../../components/AuthPageLayout';
import { BRAND_NAME, LOGO_SRC, authButtonSx, authLinkSx } from '../../constants/brand';

const fieldVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.35 + i * 0.07, duration: 0.45, ease: 'easeOut' },
  }),
};

const submitButtonSx = {
  ...authButtonSx,
  mt: 3,
  mb: 2,
  py: 1.5,
  width: '100%',
};

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password))
      return 'Password must contain at least one letter and one number.';

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

    setLoading(true);
    const res = await register(formData);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    } else {
      navigate('/sign-in');
    }
  };

  const fields = [
    { label: 'Username', name: 'username', type: 'text' },
    { label: 'Email address', name: 'email', type: 'email' },
    { label: 'Password', name: 'password', type: 'password' },
    { label: 'Confirm Password', name: 'password2', type: 'password' },
  ];

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
            sx={{ textAlign: 'center', mb: 3 }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt={BRAND_NAME}
              sx={{ height: 56, mb: 2, objectFit: 'contain' }}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#f0f9ff' }}>
              Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join {BRAND_NAME} today
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
            {fields.map((field, i) => (
              <Box key={field.name} component={motion.div} custom={i} variants={fieldVariants} initial="hidden" animate="visible">
                <TextField
                  fullWidth
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  variant="outlined"
                  margin="normal"
                  required
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </Box>
            ))}

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
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>

          <Divider sx={{ my: 3, borderColor: 'rgba(56, 189, 248, 0.15)' }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
            <GoogleLoginButton text="signup_with" mode="register" />
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Typography
                component={RouterLink}
                to="/sign-in"
                sx={authLinkSx}
              >
                Log in here
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthPageLayout>
  );
}
