import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { readerGlassSx } from '../components/reader/ReaderLayout';
import { glassCardSx } from '../components/AuthPageLayout';
import { fetchProfile, updateProfile, changePassword } from '../services/user';
import { ROLE_LABELS, READER_ROLE, ROLE_MAP } from '../constants/roles';

const sectionMotion = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function parseApiError(err) {
  const data = err.response?.data;
  if (data?.error) return data.error;
  if (typeof data === 'object') {
    const key = Object.keys(data)[0];
    const val = data[key];
    return Array.isArray(val) ? `${key}: ${val[0]}` : `${key}: ${val}`;
  }
  return 'Something went wrong. Please try again.';
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateSessionUser } = useAuth();
  const dashboardPath = user?.role !== undefined && ROLE_MAP[user.role] ? `/${ROLE_MAP[user.role]}` : '/';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password2: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProfile();
        if (!cancelled) {
          setProfile(data);
          setUsername(data.username);
          setEmail(data.email);
        }
      } catch {
        if (!cancelled) setProfileMsg({ type: 'error', text: 'Could not load profile.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const data = await updateProfile({ username: username.trim(), email: email.trim() });
      setProfile(data);
      updateSessionUser({ id: data.id, username: data.username, email: data.email, role: data.role });
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      await changePassword(passwordForm);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setPasswordForm({ current_password: '', new_password: '', new_password2: '' });
      setTimeout(() => setPasswordOpen(false), 1200);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setPasswordSaving(false);
    }
  };

  const cardSx = { ...readerGlassSx, ...glassCardSx, p: { xs: 2.5, md: 3 }, mb: 3 };
  const isReader = profile?.role === READER_ROLE;

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 72px)',
        py: { xs: 3, md: 4 },
        px: 2,
        background: `
          radial-gradient(ellipse 70% 45% at 15% 10%, rgba(30, 111, 217, 0.15) 0%, transparent 55%),
          linear-gradient(180deg, #001529 0%, #021a33 50%, #001529 100%)
        `,
      }}
    >
      <Box sx={{ maxWidth: 560, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton onClick={() => navigate(dashboardPath)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800}>
            My profile
          </Typography>
        </Box>

        {loading ? (
          <Skeleton variant="rounded" height={200} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />
        ) : (
          <>
            <Box component={motion.section} custom={0} variants={sectionMotion} initial="hidden" animate="visible" sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <PersonIcon sx={{ color: '#7dd3fc' }} />
                <Typography variant="h6" fontWeight={700}>
                  Account details
                </Typography>
              </Box>
              <Chip
                label={profile?.role_label || ROLE_LABELS[profile?.role] || 'Reader'}
                size="small"
                sx={{ mb: 2, bgcolor: 'rgba(56, 189, 248, 0.12)', color: '#7dd3fc' }}
              />
              {profileMsg.text && (
                <Alert severity={profileMsg.type} sx={{ mb: 2 }}>
                  {profileMsg.text}
                </Alert>
              )}
              <form onSubmit={handleProfileSave}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                />
                <Button type="submit" variant="contained" disabled={profileSaving} sx={{ mt: 2 }}>
                  {profileSaving ? 'Saving…' : 'Save profile'}
                </Button>
              </form>
            </Box>

            <Box component={motion.section} custom={1} variants={sectionMotion} initial="hidden" animate="visible" sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <LockIcon sx={{ color: '#7dd3fc' }} />
                <Typography variant="h6" fontWeight={700}>
                  Password
                </Typography>
              </Box>
              {profile?.has_usable_password === false ? (
                <Typography variant="body2" color="text.secondary">
                  You signed in with Google. Password is managed by your Google account.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Update your password to keep your account secure.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => {
                      setPasswordOpen(true);
                      setPasswordMsg({ type: '', text: '' });
                    }}
                    sx={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#7dd3fc' }}
                  >
                    Change password
                  </Button>
                </>
              )}
            </Box>

            <Box component={motion.section} custom={2} variants={sectionMotion} initial="hidden" animate="visible" sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <InfoOutlinedIcon sx={{ color: '#7dd3fc' }} />
                <Typography variant="h6" fontWeight={700}>
                  Role
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                You are a <strong>{profile?.role_label || ROLE_LABELS[profile?.role]}</strong>.
                {isReader && (
                  <>
                    {' '}
                    To write and publish posts, an admin or super admin must promote you to Author. You cannot change
                    your role yourself.
                  </>
                )}
                {!isReader && profile?.role === 2 && (
                  <> Your author access was granted by an administrator.</>
                )}
                {profile?.role !== undefined && profile.role !== READER_ROLE && profile.role !== 2 && (
                  <> Your role is assigned and managed by an administrator.</>
                )}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      <Dialog
        open={passwordOpen}
        onClose={() => !passwordSaving && setPasswordOpen(false)}
        slotProps={{
          paper: {
            sx: {
              ...glassCardSx,
              background: 'rgba(0, 21, 41, 0.95)',
              minWidth: { xs: '90vw', sm: 400 },
            },
          },
        }}
      >
        <form onSubmit={handlePasswordSubmit}>
          <DialogTitle sx={{ color: '#f0f9ff', fontWeight: 700 }}>Change password</DialogTitle>
          <DialogContent>
            {passwordMsg.text && (
              <Alert severity={passwordMsg.type} sx={{ mb: 2 }}>
                {passwordMsg.text}
              </Alert>
            )}
            <TextField
              fullWidth
              type="password"
              label="Current password"
              margin="dense"
              required
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            />
            <TextField
              fullWidth
              type="password"
              label="New password"
              margin="dense"
              required
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm new password"
              margin="dense"
              required
              value={passwordForm.new_password2}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password2: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPasswordOpen(false)} disabled={passwordSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={passwordSaving}>
              {passwordSaving ? 'Updating…' : 'Update password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
