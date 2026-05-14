import { Typography, Container, Box } from '@mui/material';

export default function AdminDashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ p: 4, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Typography color="text.secondary">Manage users, adjust site configurations, and monitor analytics.</Typography>
      </Box>
    </Container>
  );
}
