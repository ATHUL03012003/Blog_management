import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function GoogleLoginButton({ text = 'continue_with', mode = 'login' }) {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to frontend/.env
      </Alert>
    );
  }

  const handleSuccess = async (credentialResponse) => {
    setError('');
    const res = await loginWithGoogle(credentialResponse.credential, mode);
    if (!res.success) {
      setError(res.error);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError('Google sign-in was cancelled or failed')}
        theme="filled_black"
        size="large"
        width="400"
        text={text}
        shape="rectangular"
      />
    </Box>
  );
}
