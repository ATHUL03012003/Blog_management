import { useState } from 'react';
import { Box, Switch, Typography, CircularProgress, Chip } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import { toggleCommentsEnabled } from '../../services/comments';
import parseApiError from '../../utils/parseApiError';

export default function CommentsToggle({ slug, enabled, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (event) => {
    const next = event.target.checked;
    setLoading(true);
    setError('');
    try {
      await toggleCommentsEnabled(slug, next);
      onUpdate?.({ comments_enabled: next });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        px: 2,
        py: 1.25,
        borderRadius: 999,
        bgcolor: 'rgba(15, 23, 42, 0.55)',
        border: '1px solid rgba(56, 189, 248, 0.16)',
      }}
    >
      <ForumIcon sx={{ color: '#7dd3fc', fontSize: 18 }} />
      <Box sx={{ flex: 1, minWidth: 140 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
          Discussion
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ color: '#e2e8f0' }}>
          {enabled ? 'Open for comments' : 'Comments closed'}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={enabled ? 'Live' : 'Off'}
        sx={{
          height: 22,
          fontWeight: 700,
          bgcolor: enabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.12)',
          color: enabled ? '#86efac' : '#94a3b8',
        }}
      />
      <Switch
        checked={enabled}
        onChange={handleChange}
        disabled={loading}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': { color: '#38bdf8' },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            bgcolor: 'rgba(56, 189, 248, 0.45)',
          },
        }}
      />
      {loading && <CircularProgress size={16} />}
      {error && (
        <Typography variant="caption" color="error" sx={{ width: '100%' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
