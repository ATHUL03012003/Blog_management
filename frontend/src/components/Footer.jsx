import { Box, Container, Typography, Divider } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        borderTop: '1px solid rgba(51, 65, 85, 0.6)',
        background: 'rgba(15, 23, 42, 0.9)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(90deg, #A78BFA 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NEXUSBLog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role-based blogging · Editorial workflows · Built with React & Django
          </Typography>
        </Box>
        <Divider sx={{ my: 2.5, borderColor: 'rgba(51,65,85,0.6)' }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          © {new Date().getFullYear()} NEXUSBLog. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
