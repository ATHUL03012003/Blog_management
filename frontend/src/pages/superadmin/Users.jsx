import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import PlatformUserManagement from '../../components/superadmin/PlatformUserManagement';
import RoleChangeRequests from '../../components/admin/RoleChangeRequests';
import { superadminPaths } from '../../constants/superadminPaths';

export default function Users() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(superadminPaths.home)} sx={{ color: '#c4b5fd' }} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#f0f9ff' }}>
          User management
        </Typography>
      </Box>
      <RoleChangeRequests />
      <PlatformUserManagement />
    </Box>
  );
}
