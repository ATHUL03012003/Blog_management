import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, ROLE_MAP } from '../context/AuthContext';
import { useState } from 'react';
import { BRAND_NAME, LOGO_SRC, authButtonSx } from '../constants/brand';

const NAV_ITEMS = [
  { label: 'Home', id: 'home' },
  { label: 'Services', id: 'services' },
  { label: 'About', id: 'about' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    setMobileOpen(false);
    logout();
  };

  const handleDashboard = () => {
    handleClose();
    setMobileOpen(false);
    if (user?.role !== undefined && ROLE_MAP[user.role]) {
      navigate(`/${ROLE_MAP[user.role]}`);
    } else {
      navigate('/');
    }
  };

  const scrollToSection = (sectionId) => {
    setMobileOpen(false);
    if (sectionId === 'home') {
      if (location.pathname !== '/') {
        navigate('/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const mobileNavContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #001529 0%, #021a33 100%)',
        borderLeft: '1px solid rgba(56, 189, 248, 0.15)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box component="img" src={LOGO_SRC} alt={BRAND_NAME} sx={{ height: 36, width: 'auto' }} />
        <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#94a3b8' }} aria-label="Close menu">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(56, 189, 248, 0.12)' }} />
      <List sx={{ flex: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton onClick={() => scrollToSection(item.id)} sx={{ py: 1.5 }}>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600, color: '#e0f2fe' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {!user && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button component={RouterLink} to="/sign-in" onClick={() => setMobileOpen(false)} sx={authButtonSx}>
            Log In
          </Button>
          <Button component={RouterLink} to="/sign-up" onClick={() => setMobileOpen(false)} sx={authButtonSx}>
            Register
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
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
            <Box
              component={RouterLink}
              to="/"
              onClick={() => scrollToSection('home')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                textDecoration: 'none',
                mr: 1,
              }}
            >
              <Box
                component="img"
                src={LOGO_SRC}
                alt={BRAND_NAME}
                sx={{ height: { xs: 40, sm: 48 }, width: 'auto', objectFit: 'contain' }}
              />
            </Box>

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
                    '&:hover': { color: 'primary.light', bgcolor: 'rgba(30, 111, 217, 0.12)' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              {user ? (
                <>
                  <IconButton onClick={handleMenu} sx={{ p: 0 }} aria-label="Account menu">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      {user?.username?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      sx: {
                        background: 'rgba(0, 21, 41, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                      },
                    }}
                  >
                    <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center' }}>
                    <Button component={RouterLink} to="/sign-in" sx={authButtonSx}>
                      Log In
                    </Button>
                    <Button component={RouterLink} to="/sign-up" sx={authButtonSx}>
                      Register
                    </Button>
                  </Box>
                  <IconButton
                    sx={{ display: { xs: 'flex', md: 'none' }, color: '#7dd3fc' }}
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                  >
                    <MenuIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', width: 280 } }}
        SlideProps={{ timeout: 300 }}
      >
        {mobileNavContent}
      </Drawer>
    </>
  );
}
