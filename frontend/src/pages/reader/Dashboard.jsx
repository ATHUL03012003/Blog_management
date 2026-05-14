import { Typography, Container, Box } from '@mui/material';

export default function ReaderDashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ p: 4, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>Reader Dashboard</Typography>
        <Typography color="text.secondary">Discover your favorite posts, browse categories, and manage bookmarked content here.</Typography>
      </Box>
    </Container>
  );
}
