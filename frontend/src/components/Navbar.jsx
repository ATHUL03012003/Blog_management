import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, ROLE_MAP } from '../context/AuthContext';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'Services', id: 'services' },
  { label: 'About Us', id: 'about' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const scrollToSection = (sectionId) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      component={motion.div}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 64, sm: 72 } }}>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            onClick={() => scrollToSection('home')}
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

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.id}
                color="inherit"
                onClick={() => scrollToSection(item.id)}
                sx={{
                  fontWeight: 600,
                  px: 2,
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.light', bgcolor: 'rgba(124,58,237,0.08)' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
            {user ? (
              <>
                <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                    {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      background: 'rgba(30, 41, 59, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid #334155',
                    },
                  }}
                >
                  <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/sign-in"
                  sx={{ fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Log In
                </Button>
                <Button variant="contained" color="primary" component={RouterLink} to="/sign-up" sx={{ fontWeight: 600 }}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>

        {/* Mobile nav */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, pb: 1.5, justifyContent: 'center' }}>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              size="small"
              color="inherit"
              onClick={() => scrollToSection(item.id)}
              sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem' }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Container>
    </AppBar>
  );
}
