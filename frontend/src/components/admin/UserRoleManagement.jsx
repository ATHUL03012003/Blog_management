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
} from '@mui/material';
import { fetchManageableUsers, adminSetUserRole } from '../../services/user';
import { READER_ROLE, AUTHOR_ROLE } from '../../constants/roles';
import { readerGlassSx } from '../reader/ReaderLayout';
import parseApiError from '../../utils/parseApiError';

export default function UserRoleManagement() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [actingId, setActingId] = useState(null);

  const roleFilter = tab === 0 ? READER_ROLE : AUTHOR_ROLE;

  const loadUsers = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await fetchManageableUsers(roleFilter);
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

  const handlePromote = async (userId) => {
    setActingId(userId);
    setMsg({ type: '', text: '' });
    try {
      await adminSetUserRole(userId, AUTHOR_ROLE);
      setMsg({ type: 'success', text: 'User promoted to Author.' });
      await loadUsers();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setActingId(null);
    }
  };

  const handleDemote = async (userId) => {
    setActingId(userId);
    setMsg({ type: '', text: '' });
    try {
      await adminSetUserRole(userId, READER_ROLE);
      setMsg({ type: 'success', text: 'User set back to Reader.' });
      await loadUsers();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setActingId(null);
    }
  };

  return (
    <Box sx={{ ...readerGlassSx, p: 3, mt: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
        Reader &amp; author roles
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Readers cannot become authors on their own. Promote a reader here, or demote an author back to reader.
      </Typography>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
        <Tab label="Readers" sx={{ color: 'text.secondary' }} />
        <Tab label="Authors" sx={{ color: 'text.secondary' }} />
      </Tabs>

      {loading ? (
        <Skeleton variant="rounded" height={120} sx={{ bgcolor: 'rgba(56,189,248,0.08)' }} />
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>User</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>Email</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>Role</TableCell>
                <TableCell align="right" sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: 'text.secondary', border: 0 }}>
                    No {tab === 0 ? 'readers' : 'authors'} found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell sx={{ color: '#e0f2fe', borderColor: 'rgba(56,189,248,0.08)' }}>{u.username}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(56,189,248,0.08)' }}>{u.email}</TableCell>
                    <TableCell sx={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                      <Chip size="small" label={u.role_label} sx={{ bgcolor: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                      {u.role === READER_ROLE ? (
                        <Button
                          size="small"
                          variant="contained"
                          disabled={actingId === u.id}
                          onClick={() => handlePromote(u.id)}
                        >
                          {actingId === u.id ? '…' : 'Promote to Author'}
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={actingId === u.id}
                          onClick={() => handleDemote(u.id)}
                          sx={{ borderColor: 'rgba(56,189,248,0.4)', color: '#7dd3fc' }}
                        >
                          {actingId === u.id ? '…' : 'Set as Reader'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
