import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import UserRoleManagement from '../../components/admin/UserRoleManagement';
import RoleChangeRequests from '../../components/admin/RoleChangeRequests';
import { useAdminPaths } from '../../hooks/useAdminPaths';

export default function Users() {
  const navigate = useNavigate();
  const paths = useAdminPaths();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(paths.home)} sx={{ color: '#7dd3fc' }} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800}>
          User management
        </Typography>
      </Box>
      <RoleChangeRequests />
      <UserRoleManagement />
    </Box>
  );
}
