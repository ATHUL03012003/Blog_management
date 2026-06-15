import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import { motion } from 'framer-motion';
import { keyframes } from '@mui/system';
import { createComment, fetchPostComments } from '../../services/comments';
import parseApiError from '../../utils/parseApiError';
import CommentItem from './CommentItem';
import UserAvatar from './UserAvatar';
import { composerSx, fieldSx, primaryActionSx } from './engagementStyles';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

function countAllComments(items) {
  let total = 0;
  const walk = (list) => {
    list.forEach((c) => {
      total += 1;
      if (c.replies?.length) walk(c.replies);
    });
  };
  walk(items);
  return total;
}

function commentsFingerprint(items) {
  const parts = [];
  const walk = (list) => {
    list.forEach((c) => {
      parts.push(`${c.id}:${c.updated_at}`);
      if (c.replies?.length) walk(c.replies);
    });
  };
  walk(items);
  return parts.join('|');
}

export default function CommentSection({
  slug,
  user,
  commentsEnabled,
  canComment,
  canModerate,
  onCountChange,
  refreshToken = 0,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const onCountChangeRef = useRef(onCountChange);
  const lastFingerprintRef = useRef('');
  const isComposingRef = useRef(false);

  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  useEffect(() => {
    isComposingRef.current = Boolean(newComment.trim()) || submitting;
  }, [newComment, submitting]);

  const reportCount = useCallback((items) => {
    const count = countAllComments(items);
    onCountChangeRef.current?.(count);
  }, []);

  const loadComments = useCallback(async ({ silent = false } = {}) => {
    if (!commentsEnabled) {
      setComments([]);
      if (!silent) setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    else setSyncing(true);
    if (!silent) setError('');
    try {
      const data = await fetchPostComments(slug);
      const fingerprint = commentsFingerprint(data);
      if (fingerprint !== lastFingerprintRef.current) {
        lastFingerprintRef.current = fingerprint;
        setComments(data);
        reportCount(data);
      }
    } catch (err) {
      if (!silent) {
        setComments([]);
        setError(parseApiError(err));
      }
    } finally {
      if (!silent) setLoading(false);
      else setSyncing(false);
    }
  }, [slug, commentsEnabled, reportCount]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    if (refreshToken === 0) return;
    if (isComposingRef.current) return;
    loadComments({ silent: true });
  }, [refreshToken, loadComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createComment(slug, { content: newComment.trim() });
      setNewComment('');
      await loadComments({ silent: true });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChanged = async () => {
    await loadComments({ silent: true });
  };

  const totalComments = countAllComments(comments);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, rgba(30,111,217,0.25), rgba(56,189,248,0.15))',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <ForumOutlinedIcon sx={{ color: '#7dd3fc', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#f8fafc', lineHeight: 1.2 }}>
              Discussion
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {loading ? 'Loading thread…' : `${totalComments} contribution${totalComments === 1 ? '' : 's'}`}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {syncing && (
            <Chip
              size="small"
              icon={
                <SyncIcon
                  sx={{
                    fontSize: 14,
                    animation: `${spin} 1s linear infinite`,
                  }}
                />
              }
              label="Syncing"
              sx={{
                height: 24,
                bgcolor: 'rgba(56, 189, 248, 0.1)',
                color: '#7dd3fc',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            />
          )}
          <Chip
            size="small"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: '#22c55e',
                    boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
                    animation: 'livePulse 2s ease-in-out infinite',
                    '@keyframes livePulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.35 },
                    },
                  }}
                />
                Live
              </Box>
            }
            sx={{
              height: 24,
              fontWeight: 700,
              bgcolor: 'rgba(34, 197, 94, 0.12)',
              color: '#86efac',
              border: '1px solid rgba(34, 197, 94, 0.25)',
            }}
          />
        </Stack>
      </Box>

      {!commentsEnabled && (
        <Alert
          severity="info"
          sx={{
            mb: 2.5,
            borderRadius: 3,
            bgcolor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          Comments are closed on this post.
        </Alert>
      )}

      {commentsEnabled && canComment && (
        <Box sx={{ ...composerSx, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <UserAvatar username={user?.username || 'You'} size={42} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
                Join the conversation
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Share your perspective, ask a question, or add feedback…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                sx={fieldSx}
              />
              <Stack
                direction="row"
                sx={{
                  mt: 1.5,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Updates every 12s · Be respectful
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || !newComment.trim()}
                  sx={primaryActionSx}
                >
                  {submitting ? 'Publishing…' : 'Publish comment'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}

      {commentsEnabled && !canComment && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
          Sign in to participate in the discussion.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack spacing={1.5}>
          {[1, 2].map((n) => (
            <Skeleton
              key={n}
              variant="rounded"
              height={96}
              sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }}
            />
          ))}
        </Stack>
      ) : commentsEnabled && comments.length === 0 ? (
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            py: 5,
            px: 3,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed rgba(56, 189, 248, 0.2)',
            bgcolor: 'rgba(15, 23, 42, 0.35)',
          }}
        >
          <ForumOutlinedIcon sx={{ fontSize: 40, color: 'rgba(56, 189, 248, 0.35)', mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#e2e8f0' }}>
            Start the conversation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360, mx: 'auto' }}>
            No comments yet. Be the first to share your thoughts on this article.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.75}>
          {comments.map((comment) => (
            <Box key={comment.id}>
              <CommentItem
                comment={comment}
                slug={slug}
                user={user}
                canComment={canComment && commentsEnabled}
                canModerate={canModerate}
                onChanged={handleChanged}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
