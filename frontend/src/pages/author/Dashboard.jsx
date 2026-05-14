import { Typography, Container, Box } from '@mui/material';

export default function AuthorDashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ p: 4, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>Author Dashboard</Typography>
        <Typography color="text.secondary">Draft new posts, manage your published articles, and view analytics for your content.</Typography>
      </Box>
    </Container>
  );
}
