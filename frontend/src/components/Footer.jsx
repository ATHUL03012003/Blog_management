import { Box, Container, Typography, Divider } from '@mui/material';
import { BRAND_NAME, LOGO_SRC } from '../constants/brand';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        borderTop: '1px solid rgba(56, 189, 248, 0.12)',
        background: 'rgba(0, 21, 41, 0.95)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src={LOGO_SRC} alt={BRAND_NAME} sx={{ height: 40 }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
            Professional blog writing · Editorial workflows · React & Django
          </Typography>
        </Box>
        <Divider sx={{ my: 2.5, borderColor: 'rgba(56, 189, 248, 0.12)' }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
