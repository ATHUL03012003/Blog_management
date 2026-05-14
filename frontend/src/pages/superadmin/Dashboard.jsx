import { Typography, Container, Box } from '@mui/material';

export default function SuperAdminDashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ p: 4, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>Super Admin Panel</Typography>
        <Typography color="text.secondary">Control global policies, billings, and manage multiple blog sub-instances and admins.</Typography>
      </Box>
    </Container>
  );
}
