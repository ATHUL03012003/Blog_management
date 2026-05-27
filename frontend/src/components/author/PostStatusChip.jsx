import { Chip } from '@mui/material';
import { POST_STATUS_LABELS, POST_STATUS_COLORS } from '../../constants/postStatus';

export default function PostStatusChip({ status, size = 'small' }) {
  const colors = POST_STATUS_COLORS[status] || POST_STATUS_COLORS[1];
  return (
    <Chip
      size={size}
      label={POST_STATUS_LABELS[status] || 'Unknown'}
      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 600 }}
    />
  );
}
