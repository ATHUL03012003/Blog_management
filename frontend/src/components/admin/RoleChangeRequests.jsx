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
  Skeleton,
  TextField,
} from '@mui/material';
import { fetchPendingRoleChangeRequests, reviewRoleChangeRequest } from '../../services/roleRequests';
import { readerGlassSx } from '../reader/ReaderLayout';

function parseApiError(err) {
  return err.response?.data?.error || 'Action failed. Please try again.';
}

export default function RoleChangeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [actingId, setActingId] = useState(null);
  const [notes, setNotes] = useState({});

  const load = async () => {
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const data = await fetchPendingRoleChangeRequests();
      setRequests(data);
    } catch {
      setMsg({ type: 'error', text: 'Could not load role change requests.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReview = async (requestId, action) => {
    setActingId(requestId);
    setMsg({ type: '', text: '' });
    try {
      await reviewRoleChangeRequest(requestId, {
        action,
        review_note: notes[requestId] || '',
      });
      setMsg({
        type: 'success',
        text: action === 'approve' ? 'Request approved and role updated.' : 'Request rejected.',
      });
      await load();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setActingId(null);
    }
  };

  return (
    <Box sx={{ ...readerGlassSx, p: 3, mt: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
        Role change requests
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Users request role changes from their profile. Approve or reject here. Requests involving
        Editor or Admin roles require Super Admin.
      </Typography>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      {loading ? (
        <Skeleton variant="rounded" height={120} sx={{ bgcolor: 'rgba(56,189,248,0.08)' }} />
      ) : requests.length === 0 ? (
        <Typography color="text.secondary">No pending role change requests.</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>User</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>Change</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>Message</TableCell>
                <TableCell sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>Note</TableCell>
                <TableCell align="right" sx={{ color: '#94a3b8', borderColor: 'rgba(56,189,248,0.12)' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell sx={{ color: '#e0f2fe', borderColor: 'rgba(56,189,248,0.08)' }}>
                    <Typography fontWeight={600}>{req.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {req.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                    <Chip
                      size="small"
                      label={`${req.current_role_label} → ${req.requested_role_label}`}
                      sx={{ bgcolor: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }}
                    />
                    {req.requires_superadmin && (
                      <Chip
                        size="small"
                        label="Super Admin only"
                        sx={{ ml: 1, bgcolor: 'rgba(167,139,250,0.15)', color: '#c4b5fd' }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(56,189,248,0.08)', maxWidth: 160 }}>
                    {req.message || '—'}
                  </TableCell>
                  <TableCell sx={{ borderColor: 'rgba(56,189,248,0.08)', minWidth: 140 }}>
                    <TextField
                      size="small"
                      placeholder="Optional note"
                      fullWidth
                      value={notes[req.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [req.id]: e.target.value })}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: 'rgba(56,189,248,0.08)', whiteSpace: 'nowrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={actingId === req.id}
                      onClick={() => handleReview(req.id, 'approve')}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={actingId === req.id}
                      onClick={() => handleReview(req.id, 'reject')}
                      sx={{ borderColor: 'rgba(248,113,113,0.5)', color: '#fca5a5' }}
                    >
                      Reject
                    </Button>
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
