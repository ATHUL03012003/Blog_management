import { useEffect, useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  fetchNotifications,
  fetchNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/roleRequests';

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const [list, countRes] = await Promise.all([
        fetchNotifications(),
        fetchNotificationUnreadCount(),
      ]);
      setItems(list.slice(0, 10));
      setUnread(countRes.count);
    } catch {
      setItems([]);
      setUnread(0);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const open = Boolean(anchorEl);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    load();
  };

  const handleClose = () => setAnchorEl(null);

  const handleItemClick = async (item) => {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        await load();
      } catch {
        /* ignore */
      }
    }
    handleClose();
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      await load();
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen} aria-label="Notifications">
        <Badge badgeContent={unread} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              minWidth: 320,
              maxWidth: 400,
              bgcolor: 'rgba(0, 21, 41, 0.98)',
              border: '1px solid rgba(56,189,248,0.2)',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700} sx={{ color: '#f0f9ff' }}>
            Notifications
          </Typography>
          {unread > 0 && (
            <Button size="small" onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: 'rgba(56,189,248,0.12)' }} />
        {items.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          items.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleItemClick(item)}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                whiteSpace: 'normal',
                bgcolor: item.is_read ? 'transparent' : 'rgba(56,189,248,0.08)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={item.is_read ? 500 : 700} sx={{ color: '#e0f2fe' }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {new Date(item.created_at).toLocaleString()}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
