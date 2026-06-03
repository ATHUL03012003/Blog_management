import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  Tabs,
  Tab,
  Skeleton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { fetchAllUsers, superadminSetUserRole } from '../../services/superadminUser';
import { ROLE_LABELS } from '../../constants/roles';
import { readerGlassSx } from '../reader/ReaderLayout';
import parseApiError from '../../utils/parseApiError';

const ROLE_TABS = [
  { key: 'all', label: 'All', filter: null },
  { key: 1, label: 'Readers', filter: 1 },
  { key: 2, label: 'Authors', filter: 2 },
  { key: 3, label: 'Editors', filter: 3 },
  { key: 0, label: 'Admins', filter: 0 },
  { key: 4, label: 'Moderators', filter: 4 },
];

const ASSIGNABLE = [
  { value: 1, label: 'Reader' },
  { value: 2, label: 'Author' },
  { value: 3, label: 'Editor' },
  { value: 0, label: 'Admin' },
];

function parseApiErrorLocal(err) {
  return err.response?.data?.error || parseApiError(err) || 'Action failed.';
}

function UserCard({ user, actingId, onRoleChange }) {
  const isSuper = user.role === 5;
  return (
    <Card sx={{ ...readerGlassSx, mb: 1.5 }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Typography fontWeight={700} sx={{ color: '#f0f9ff' }}>
          {user.username}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {user.email}
        </Typography>
        <Chip
          size="small"
          label={user.role_label || ROLE_LABELS[user.role]}
          sx={{ mb: 1.5, bgcolor: 'rgba(167,139,250,0.15)', color: '#c4b5fd' }}
        />
        {isSuper ? (
          <Typography variant="caption" color="text.secondary">
            Super Admin (protected)
          </Typography>
        ) : (
          <FormControl fullWidth size="small">
            <InputLabel>Change role</InputLabel>
            <Select
              label="Change role"
              value={user.role}
              disabled={actingId === user.id}
              onChange={(e) => onRoleChange(user.id, Number(e.target.value))}
            >
              {ASSIGNABLE.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </CardContent>
    </Card>
  );
}

export default function PlatformUserManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [actingId, setActingId] = useState(null);

  const roleFilter = ROLE_TABS[tab]?.filter ?? null;

  const loadUsers = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await fetchAllUsers(roleFilter ?? undefined);
      setUsers(data);
    } catch {
      setMsg({ type: 'error', text: 'Could not load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [tab]);

  const handleRoleChange = async (userId, newRole) => {
    setActingId(userId);
    try {
      await superadminSetUserRole(userId, newRole);
      setMsg({ type: 'success', text: 'Role updated.' });
      await loadUsers();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiErrorLocal(err) });
    } finally {
      setActingId(null);
    }
  };

  return (
    <Box sx={{ ...readerGlassSx, p: { xs: 2, md: 3 } }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
        Platform users
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Super Admin can assign Reader, Author, Editor, or Admin roles. Super Admin accounts are protected.
      </Typography>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: '1px solid rgba(167,139,250,0.2)' }}
      >
        {ROLE_TABS.map((t, i) => (
          <Tab key={t.key} label={t.label} sx={{ color: 'text.secondary', minWidth: { xs: 72, sm: 96 } }} />
        ))}
      </Tabs>

      {loading ? (
        <Skeleton variant="rounded" height={160} sx={{ bgcolor: 'rgba(167,139,250,0.08)' }} />
      ) : users.length === 0 ? (
        <Typography color="text.secondary">No users in this filter.</Typography>
      ) : isMobile ? (
        <Box>
          {users.map((u) => (
            <UserCard key={u.id} user={u} actingId={actingId} onRoleChange={handleRoleChange} />
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>User</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>Email</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>Role</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>Joined</TableCell>
                <TableCell align="right" sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>
                  Set role
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell sx={{ color: '#e0f2fe', borderColor: 'rgba(167,139,250,0.08)' }}>{u.username}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(167,139,250,0.08)' }}>{u.email}</TableCell>
                  <TableCell sx={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                    <Chip
                      size="small"
                      label={u.role_label}
                      sx={{ bgcolor: 'rgba(167,139,250,0.12)', color: '#c4b5fd' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(167,139,250,0.08)' }}>
                    {new Date(u.date_joined).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                    {u.role === 5 ? (
                      <Typography variant="caption" color="text.secondary">
                        Protected
                      </Typography>
                    ) : (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={u.role}
                          disabled={actingId === u.id}
                          onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                        >
                          {ASSIGNABLE.map((r) => (
                            <MenuItem key={r.value} value={r.value}>
                              {r.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
