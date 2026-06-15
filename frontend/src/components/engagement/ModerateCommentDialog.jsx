import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import { moderateDeleteComment } from '../../services/comments';
import parseApiError from '../../utils/parseApiError';
import UserAvatar from './UserAvatar';
import { fieldSx, primaryActionSx } from './engagementStyles';

export default function ModerateCommentDialog({ open, comment, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading) return;
    setReason('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await moderateDeleteComment(comment.id, reason.trim());
      onSuccess?.(result);
      setReason('');
      onClose();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(0,21,41,0.98))',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <GavelOutlinedIcon sx={{ color: '#fca5a5' }} />
        Moderate comment
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This removes the comment and issues a warning to the author. After 3 warnings, their account is suspended for 30 days.
        </Typography>

        {comment?.content && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 2,
              mb: 2,
              borderRadius: 2.5,
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <UserAvatar username={comment?.author_username} size={36} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fecaca' }}>
                {comment?.author_username}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', color: '#fca5a5' }}>
                {comment.content}
              </Typography>
            </Box>
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Reason for removal"
          placeholder="Describe the policy violation (minimum 10 characters)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          sx={fieldSx}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ borderRadius: 999 }}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ ...primaryActionSx, background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}
        >
          {loading ? 'Removing…' : 'Remove & warn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
