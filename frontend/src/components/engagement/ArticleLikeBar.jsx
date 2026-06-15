import { Box, Typography, Chip } from '@mui/material';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import { useAuth } from '../../hooks/useAuth';
import LikeButton from './LikeButton';
import { statPillSx } from './engagementStyles';

export default function ArticleLikeBar({ slug, post, onPostUpdate }) {
  const { user } = useAuth();

  if (!post) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        py: 2,
        mt: 1,
        mb: 1,
        borderTop: '1px solid rgba(56, 189, 248, 0.12)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <LikeButton
          slug={slug}
          liked={Boolean(post.is_liked)}
          likeCount={post.like_count ?? 0}
          onUpdate={onPostUpdate}
          disabled={!user}
          compact
        />
        <Box sx={statPillSx}>
          <ModeCommentOutlinedIcon sx={{ fontSize: 17, color: '#7dd3fc' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: '#e2e8f0' }}>
            {post.comment_count ?? 0}
          </Typography>
        </Box>
      </Box>
      <Chip
        size="small"
        label="Tap heart to like"
        sx={{
          height: 24,
          fontSize: '0.7rem',
          bgcolor: 'rgba(56, 189, 248, 0.08)',
          color: '#7dd3fc',
          border: '1px solid rgba(56, 189, 248, 0.15)',
        }}
      />
    </Box>
  );
}
