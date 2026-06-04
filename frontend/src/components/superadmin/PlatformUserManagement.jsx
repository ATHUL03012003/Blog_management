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
import { fetchAllUsers, superadminSetUserRole, superadminSetUserActive } from '../../services/superadminUser';
import { ROLE_LABELS } from '../../constants/roles';
import { readerGlassSx } from '../reader/ReaderLayout';
import parseApiError from '../../utils/parseApiError';
import { useAuth } from '../../hooks/useAuth';

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

function StatusChip({ isActive }) {
  return (
    <Chip
      size="small"
      label={isActive ? 'Active' : 'Inactive'}
      sx={{
        bgcolor: isActive ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
        color: isActive ? '#6ee7b7' : '#fca5a5',
      }}
    />
  );
}

function UserCard({ user, actingId, currentUserId, onRoleChange, onToggleActive }) {
  const isSuper = user.role === 5;
  const isSelf = user.id === currentUserId;
  const canToggleActive = !isSuper && !isSelf;

  return (
    <Card sx={{ ...readerGlassSx, mb: 1.5, opacity: user.is_active === false ? 0.75 : 1 }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <Typography fontWeight={700} sx={{ color: '#f0f9ff' }}>
            {user.username}
          </Typography>
          <StatusChip isActive={user.is_active !== false} />
        </Box>
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
          <>
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel>Change role</InputLabel>
              <Select
                label="Change role"
                value={user.role}
                disabled={actingId === user.id || user.is_active === false}
                onChange={(e) => onRoleChange(user.id, Number(e.target.value))}
              >
                {ASSIGNABLE.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {canToggleActive && (
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color={user.is_active === false ? 'success' : 'error'}
                disabled={actingId === user.id}
                onClick={() => onToggleActive(user.id, user.is_active === false)}
              >
                {user.is_active === false ? 'Activate' : 'Deactivate'}
              </Button>
            )}
            {isSelf && (
              <Typography variant="caption" color="text.secondary">
                Your account cannot be deactivated here.
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function PlatformUserManagement() {
  const { user: currentUser } = useAuth();
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

  const handleToggleActive = async (userId, activate) => {
    setActingId(userId);
    try {
      await superadminSetUserActive(userId, activate);
      setMsg({ type: 'success', text: activate ? 'User activated.' : 'User deactivated.' });
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
            <UserCard
              key={u.id}
              user={u}
              actingId={actingId}
              currentUserId={currentUser?.id}
              onRoleChange={handleRoleChange}
              onToggleActive={handleToggleActive}
            />
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
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>Joined</TableCell>
                <TableCell align="right" sx={{ color: '#94a3b8', borderColor: 'rgba(167,139,250,0.12)' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const isSuper = u.role === 5;
                const isSelf = u.id === currentUser?.id;
                const canToggleActive = !isSuper && !isSelf;

                return (
                  <TableRow
                    key={u.id}
                    sx={{ opacity: u.is_active === false ? 0.7 : 1 }}
                  >
                    <TableCell sx={{ color: '#e0f2fe', borderColor: 'rgba(167,139,250,0.08)' }}>{u.username}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(167,139,250,0.08)' }}>{u.email}</TableCell>
                    <TableCell sx={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                      <Chip
                        size="small"
                        label={u.role_label}
                        sx={{ bgcolor: 'rgba(167,139,250,0.12)', color: '#c4b5fd' }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                      <StatusChip isActive={u.is_active !== false} />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(167,139,250,0.08)' }}>
                      {new Date(u.date_joined).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right" sx={{ borderColor: 'rgba(167,139,250,0.08)' }}>
                      {isSuper ? (
                        <Typography variant="caption" color="text.secondary">
                          Protected
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={u.role}
                              disabled={actingId === u.id || u.is_active === false}
                              onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                            >
                              {ASSIGNABLE.map((r) => (
                                <MenuItem key={r.value} value={r.value}>
                                  {r.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {canToggleActive && (
                            <Button
                              size="small"
                              variant="outlined"
                              color={u.is_active === false ? 'success' : 'error'}
                              disabled={actingId === u.id}
                              onClick={() => handleToggleActive(u.id, u.is_active === false)}
                            >
                              {u.is_active === false ? 'Activate' : 'Deactivate'}
                            </Button>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
