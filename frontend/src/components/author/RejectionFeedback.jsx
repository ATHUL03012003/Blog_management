import { Alert, Box, Typography } from '@mui/material';

export default function RejectionFeedback({ post }) {
  if (!post?.rejection_reason && !post?.improvement_areas) return null;

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Editor feedback
      </Typography>
      {post.rejection_reason && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ color: '#fbbf24' }}>
            Why it was rejected
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {post.rejection_reason}
          </Typography>
        </Box>
      )}
      {post.improvement_areas && (
        <Box>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ color: '#fbbf24' }}>
            Areas to improve
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {post.improvement_areas}
          </Typography>
        </Box>
      )}
      <Typography variant="caption" display="block" sx={{ mt: 1.5, opacity: 0.85 }}>
        Revise your post, then submit for review again.
      </Typography>
    </Alert>
  );
}
