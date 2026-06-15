import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Stack,
  Alert,
  Tooltip,
  Chip,
} from '@mui/material';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../../services/comments';
import parseApiError from '../../utils/parseApiError';
import ModerateCommentDialog from './ModerateCommentDialog';
import UserAvatar from './UserAvatar';
import {
  commentCardSx,
  fieldSx,
  ghostActionSx,
  primaryActionSx,
  formatRelativeTime,
} from './engagementStyles';

export default function CommentItem({
  comment,
  slug,
  user,
  canComment,
  canModerate,
  depth = 0,
  onChanged,
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [moderateOpen, setModerateOpen] = useState(false);

  const username = comment.author_username || 'User';
  const isOwner = user?.id === comment.author;
  const isNested = depth > 0;
  const edited = comment.updated_at !== comment.created_at;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createComment(slug, { content: replyText.trim(), parent: comment.id });
      setReplyText('');
      setReplyOpen(false);
      onChanged?.();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    setLoading(true);
    setError('');
    try {
      await updateComment(comment.id, { content: editText.trim() });
      setEditing(false);
      onChanged?.();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setLoading(true);
    setError('');
    try {
      await deleteComment(comment.id);
      onChanged?.();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        pl: isNested ? { xs: 2.5, sm: 3 } : 0,
        ml: isNested ? { xs: 2, sm: 2.5 } : 0,
        mt: isNested ? 1.5 : 0,
        '&::before': isNested
          ? {
              content: '""',
              position: 'absolute',
              left: 10,
              top: 0,
              bottom: 12,
              width: 2,
              borderRadius: 1,
              background: 'linear-gradient(180deg, rgba(56,189,248,0.35), rgba(56,189,248,0.05))',
            }
          : {},
      }}
    >
      <Box sx={commentCardSx}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <UserAvatar username={username} size={isNested ? 34 : 40} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
                mb: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#f0f9ff' }}>
                  {username}
                </Typography>
                {isOwner && (
                  <Chip
                    label="You"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(56, 189, 248, 0.12)',
                      color: '#7dd3fc',
                    }}
                  />
                )}
              </Box>
              <Tooltip title={new Date(comment.created_at).toLocaleString()}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.9)' }}>
                  {formatRelativeTime(comment.created_at)}
                  {edited ? ' · edited' : ''}
                </Typography>
              </Tooltip>
            </Box>

            {editing ? (
              <Box sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  disabled={loading}
                  sx={fieldSx}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                  <Button size="small" variant="contained" sx={primaryActionSx} onClick={handleUpdate} disabled={loading}>
                    Save changes
                  </Button>
                  <Button
                    size="small"
                    sx={ghostActionSx}
                    onClick={() => { setEditing(false); setEditText(comment.content); }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  whiteSpace: 'pre-wrap',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                  wordBreak: 'break-word',
                }}
              >
                {comment.content}
              </Typography>
            )}

            {!editing && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
                {canComment && (
                  <Button
                    size="small"
                    startIcon={<ReplyOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={ghostActionSx}
                    onClick={() => setReplyOpen((v) => !v)}
                    disabled={loading}
                  >
                    Reply
                  </Button>
                )}
                {isOwner && (
                  <>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => setEditing(true)} disabled={loading} sx={{ color: '#94a3b8' }}>
                        <EditOutlinedIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={handleDelete} disabled={loading} sx={{ color: '#f87171' }}>
                        <DeleteOutlinedIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {canModerate && !isOwner && (
                  <Button
                    size="small"
                    startIcon={<GavelOutlinedIcon sx={{ fontSize: 16 }} />}
                    sx={{ ...ghostActionSx, color: '#fca5a5', '&:hover': { color: '#fecaca', bgcolor: 'rgba(239,68,68,0.08)' } }}
                    onClick={() => setModerateOpen(true)}
                    disabled={loading}
                  >
                    Moderate
                  </Button>
                )}
              </Stack>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 1.25, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {replyOpen && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid rgba(56, 189, 248, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                  <UserAvatar username={user?.username || 'You'} size={30} />
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder={`Reply to ${username}…`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={loading}
                      sx={fieldSx}
                      autoFocus
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        sx={primaryActionSx}
                        onClick={handleReply}
                        disabled={loading || !replyText.trim()}
                      >
                        Post reply
                      </Button>
                      <Button
                        size="small"
                        sx={ghostActionSx}
                        onClick={() => { setReplyOpen(false); setReplyText(''); }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          slug={slug}
          user={user}
          canComment={canComment}
          canModerate={canModerate}
          depth={depth + 1}
          onChanged={onChanged}
        />
      ))}

      <ModerateCommentDialog
        open={moderateOpen}
        comment={comment}
        onClose={() => setModerateOpen(false)}
        onSuccess={() => onChanged?.()}
      />
    </Box>
  );
}
