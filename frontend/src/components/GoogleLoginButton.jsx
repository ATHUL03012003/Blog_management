import { useState, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const BUTTON_WIDTH = 320;

export default function GoogleLoginButton({ text = 'continue_with', mode = 'login' }) {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [showButton, setShowButton] = useState(false);
  const mountedRef = useRef(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setShowButton(true);
  }, []);

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
    <Box
      sx={{
        width: '100%',
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 44,
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
      {showButton && (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Google sign-in was cancelled or failed')}
          theme="filled_black"
          size="large"
          width={BUTTON_WIDTH}
          text={text}
          shape="rectangular"
        />
      )}
    </Box>
  );
}
