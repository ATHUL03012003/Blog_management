import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Skeleton,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { fetchPost, deletePost } from '../../services/adminPosts';
import { mediaUrl } from '../../services/posts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import BlogArticleRenderer from '../../components/author/BlogArticleRenderer';
import RejectionFeedback from '../../components/author/RejectionFeedback';
import { superadminPaths } from '../../constants/superadminPaths';
import { POST_STATUS } from '../../constants/postStatus';
import parseApiError from '../../utils/parseApiError';

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPost(slug);
        if (!cancelled) setPost(data);
      } catch {
        if (!cancelled) setError('Post not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(slug);
      navigate(superadminPaths.posts);
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return <Skeleton variant="rounded" height={320} sx={{ bgcolor: 'rgba(167,139,250,0.08)', borderRadius: 3 }} />;
  }

  if (error || !post) {
    return <Alert severity="error">{error}</Alert>;
  }

  const inReview = post.status === POST_STATUS.REVIEW;

  return (
    <Box component={motion.article} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(superadminPaths.posts)} sx={{ color: '#c4b5fd' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <PostStatusChip status={post.status} size="medium" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            component={RouterLink}
            to={superadminPaths.editPost(slug)}
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ borderColor: 'rgba(167, 139, 250, 0.4)', color: '#c4b5fd', flex: { xs: 1, sm: 'none' } }}
          >
            Edit
          </Button>
          {inReview && (
            <Button
              component={RouterLink}
              to={superadminPaths.reviewPost(slug)}
              variant="contained"
              startIcon={<RateReviewIcon />}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              Review
            </Button>
          )}
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteOpen(true)}
            sx={{ borderColor: 'rgba(239,68,68,0.5)', flex: { xs: 1, sm: 'none' } }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      <RejectionFeedback post={post} />

      <Box sx={{ ...readerGlassSx, p: { xs: 2, md: 4 } }}>
        {post.image && (
          <Box
            component="img"
            src={mediaUrl(post.image)}
            alt={post.title}
            sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2, mb: 3 }}
          />
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {post.category_detail && (
            <Chip size="small" label={post.category_detail.name} sx={{ bgcolor: 'rgba(167, 139, 250, 0.12)', color: '#c4b5fd' }} />
          )}
          <Chip size="small" label={`Author: ${post.author_username || post.author}`} sx={{ bgcolor: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
          {post.title}
        </Typography>
        {post.excerpt && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
            {post.excerpt}
          </Typography>
        )}
        <BlogArticleRenderer html={post.content} />
      </Box>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes &quot;{post.title}&quot;. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 2, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting} fullWidth sx={{ sm: { flex: 'none', width: 'auto' } }}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete} disabled={deleting} variant="contained" fullWidth sx={{ sm: { flex: 'none', width: 'auto' } }}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
