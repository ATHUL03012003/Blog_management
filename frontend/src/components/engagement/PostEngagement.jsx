import { useCallback, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import { useAuth } from '../../hooks/useAuth';
import useEngagementPolling from '../../hooks/useEngagementPolling';
import {
  AUTHOR_ROLE,
  EDITOR_ROLE,
  ADMIN_ROLE,
  SUPERADMIN_ROLE,
  isAdminUser,
} from '../../constants/roles';
import { POST_STATUS } from '../../constants/postStatus';
import { fetchLikeStatus } from '../../services/comments';
import LikeButton from './LikeButton';
import CommentsToggle from './CommentsToggle';
import CommentSection from './CommentSection';
import { engagementShellSx, statPillSx } from './engagementStyles';

const POLL_INTERVAL_MS = 12000;

export default function PostEngagement({ slug, post, onPostUpdate }) {
  const { user } = useAuth();
  const [refreshToken, setRefreshToken] = useState(0);

  const handleEngagementUpdate = useCallback(
    (updates) => {
      onPostUpdate?.(updates);
    },
    [onPostUpdate],
  );

  const handleCommentCountChange = useCallback(
    (count) => {
      handleEngagementUpdate({ comment_count: count });
    },
    [handleEngagementUpdate],
  );

  const pollEngagement = useCallback(async () => {
    try {
      const likeStatus = await fetchLikeStatus(slug);
      handleEngagementUpdate({
        is_liked: likeStatus.liked,
        like_count: likeStatus.like_count,
      });
      setRefreshToken((token) => token + 1);
    } catch {
      // Ignore transient poll errors; next tick will retry.
    }
  }, [slug, handleEngagementUpdate]);

  const isPublished = post?.status === POST_STATUS.PUBLISHED;

  useEngagementPolling(pollEngagement, {
    enabled: Boolean(slug) && isPublished,
    intervalMs: POLL_INTERVAL_MS,
  });

  if (!post || !isPublished) {
    return null;
  }

  const isOwner = user?.id === post.author;
  const canToggleComments =
    (user?.role === AUTHOR_ROLE && isOwner) ||
    [EDITOR_ROLE, ADMIN_ROLE, SUPERADMIN_ROLE].includes(user?.role);

  const canModerate = isAdminUser(user?.role);
  const canComment = Boolean(user);
  const commentsEnabled = post.comments_enabled !== false;
  const commentCount = post.comment_count ?? 0;

  return (
    <Box sx={{ ...engagementShellSx, p: { xs: 2.5, md: 3.5 }, mt: 4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          pt: 0.5,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(148, 163, 184, 0.9)',
              letterSpacing: 2,
              fontWeight: 700,
              fontSize: '0.68rem',
            }}
          >
            Community
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#f8fafc', mt: 0.25, mb: 1.5 }}>
            Reactions &amp; discussion
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            <LikeButton
              slug={slug}
              liked={Boolean(post.is_liked)}
              likeCount={post.like_count ?? 0}
              onUpdate={handleEngagementUpdate}
              disabled={!user}
            />
            <Box sx={statPillSx}>
              <ModeCommentOutlinedIcon sx={{ fontSize: 18, color: '#7dd3fc' }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: '#e2e8f0' }}>
                {commentCount}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                {commentCount === 1 ? 'Comment' : 'Comments'}
              </Typography>
            </Box>
          </Stack>

          {!user && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.25 }}>
              Sign in to like and join the discussion.
            </Typography>
          )}
        </Box>

        {canToggleComments && (
          <Box sx={{ alignSelf: { xs: 'stretch', md: 'flex-end' } }}>
            <CommentsToggle
              slug={slug}
              enabled={commentsEnabled}
              onUpdate={handleEngagementUpdate}
            />
          </Box>
        )}
      </Stack>

      <Box
        sx={{
          height: 1,
          mb: 3,
          background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent)',
        }}
      />

      <CommentSection
        slug={slug}
        user={user}
        commentsEnabled={commentsEnabled}
        canComment={canComment}
        canModerate={canModerate}
        onCountChange={handleCommentCountChange}
        refreshToken={refreshToken}
      />
    </Box>
  );
}
