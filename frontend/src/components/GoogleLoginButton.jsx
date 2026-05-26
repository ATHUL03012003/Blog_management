import { useState, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function GoogleLoginButton({ text = 'continue_with', mode = 'login' }) {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [buttonWidth, setButtonWidth] = useState(MAX_WIDTH);
  const containerRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const available = el.getBoundingClientRect().width;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.floor(available)));
      setButtonWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
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
      ref={containerRef}
      sx={{
        width: '100%',
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        '& > div': {
          width: '100% !important',
          maxWidth: '100%',
          display: 'flex',
          justifyContent: 'center',
        },
        '& iframe': {
          maxWidth: '100% !important',
        },
      }}
    >
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
        width={buttonWidth}
        text={text}
        shape="rectangular"
      />
    </Box>
  );
}
