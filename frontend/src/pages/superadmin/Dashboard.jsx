import { Typography, Container, Box } from '@mui/material';
import UserRoleManagement from '../../components/admin/UserRoleManagement';

export default function SuperAdminDashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ p: 4, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 3, mb: 1 }}>
        <Typography variant="h4" gutterBottom>
          Super Admin Panel
        </Typography>
        <Typography color="text.secondary">
          Control global policies and manage users across the platform.
        </Typography>
      </Box>
      <UserRoleManagement />
    </Container>
  );
}
