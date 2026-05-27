import { Typography, Container, Box } from '@mui/material';
import UserRoleManagement from '../../components/admin/UserRoleManagement';

export default function AdminDashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ p: 4, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 3, mb: 1 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography color="text.secondary">
          Manage users, adjust site configurations, and monitor analytics.
        </Typography>
      </Box>
      <UserRoleManagement />
    </Container>
  );
}
