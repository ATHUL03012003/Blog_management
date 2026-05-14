import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, ROLE_MAP } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleDashboard = () => {
    handleClose();
    if (user?.role !== undefined && ROLE_MAP[user.role]) {
      navigate(`/${ROLE_MAP[user.role]}`);
    } else {
      navigate('/');
    }
  };

  return (
    <AppBar position="fixed" elevation={0} component={motion.div} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontFamily: 'Inter',
              fontWeight: 800,
              letterSpacing: '-0.05rem',
              color: 'inherit',
              textDecoration: 'none',
              background: 'linear-gradient(90deg, #A78BFA 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NEXUSBLog
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {user ? (
              <>
                <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{ sx: { background: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid #334155' } }}
                >
                  <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/sign-in" sx={{ fontWeight: 600 }}>Log In</Button>
                <Button variant="contained" color="primary" component={RouterLink} to="/sign-up" sx={{ fontWeight: 600 }}>Register</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
