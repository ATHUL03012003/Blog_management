import { useEffect, useState } from 'react';
import { Box, Typography, Tooltip, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { motion } from 'framer-motion';
import { togglePostLike } from '../../services/comments';
import parseApiError from '../../utils/parseApiError';

export default function LikeButton({
  slug,
  liked,
  likeCount,
  onUpdate,
  disabled = false,
  compact = false,
}) {
  const [localLiked, setLocalLiked] = useState(Boolean(liked));
  const [localCount, setLocalCount] = useState(likeCount ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocalLiked(Boolean(liked));
    setLocalCount(likeCount ?? 0);
  }, [liked, likeCount]);

  const handleToggle = async () => {
    if (disabled || loading) return;

    const previousLiked = localLiked;
    const previousCount = localCount;
    const optimisticLiked = !localLiked;
    const optimisticCount = optimisticLiked
      ? localCount + 1
      : Math.max(0, localCount - 1);

    setLocalLiked(optimisticLiked);
    setLocalCount(optimisticCount);
    setLoading(true);
    setError('');

    try {
      const result = await togglePostLike(slug);
      setLocalLiked(result.liked);
      setLocalCount(result.like_count);
      onUpdate?.({ is_liked: result.liked, like_count: result.like_count });
    } catch (err) {
      setLocalLiked(previousLiked);
      setLocalCount(previousCount);
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Tooltip title={disabled ? 'Sign in to like' : localLiked ? 'Unlike' : 'Like this post'}>
        <Box
          component={motion.button}
          type="button"
          onClick={handleToggle}
          disabled={disabled || loading}
          whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
          aria-pressed={localLiked}
          aria-label={localLiked ? 'Unlike post' : 'Like post'}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: compact ? 1.75 : 2.25,
            py: compact ? 0.75 : 1,
            borderRadius: 999,
            border: localLiked
              ? '1px solid rgba(244, 114, 182, 0.45)'
              : '1px solid rgba(148, 163, 184, 0.2)',
            bgcolor: localLiked ? 'rgba(244, 114, 182, 0.14)' : 'rgba(15, 23, 42, 0.55)',
            color: localLiked ? '#fda4af' : '#94a3b8',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.55 : 1,
            font: 'inherit',
            transition: 'all 0.2s ease',
            '&:hover': disabled
              ? {}
              : {
                  borderColor: localLiked ? 'rgba(244, 114, 182, 0.65)' : 'rgba(56, 189, 248, 0.4)',
                  bgcolor: localLiked ? 'rgba(244, 114, 182, 0.2)' : 'rgba(56, 189, 248, 0.08)',
                  color: localLiked ? '#fecdd3' : '#7dd3fc',
                },
            '&:disabled': {
              cursor: disabled ? 'not-allowed' : 'wait',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: '#f472b6' }} />
          ) : (
            <motion.span
              key={localLiked ? 'liked' : 'unliked'}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              style={{ display: 'flex', lineHeight: 0 }}
            >
              {localLiked ? (
                <FavoriteIcon sx={{ fontSize: 20 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 20 }} />
              )}
            </motion.span>
          )}
          <Typography component="span" variant="body2" fontWeight={700}>
            {localCount}
          </Typography>
          {!compact && (
            <Typography component="span" variant="body2" sx={{ opacity: 0.85 }}>
              {localCount === 1 ? 'Like' : 'Likes'}
            </Typography>
          )}
        </Box>
      </Tooltip>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 0.5 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
