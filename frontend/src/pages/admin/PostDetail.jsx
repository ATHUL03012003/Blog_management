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
import { useAdminPaths } from '../../hooks/useAdminPaths';
import { POST_STATUS } from '../../constants/postStatus';
import parseApiError from '../../utils/parseApiError';

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const paths = useAdminPaths();
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
      navigate(paths.posts);
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return <Skeleton variant="rounded" height={320} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />;
  }

  if (error || !post) {
    return <Alert severity="error">{error}</Alert>;
  }

  const inReview = post.status === POST_STATUS.REVIEW;

  return (
    <Box component={motion.article} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(paths.posts)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <PostStatusChip status={post.status} size="medium" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            component={RouterLink}
            to={paths.editPost(slug)}
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#7dd3fc' }}
          >
            Edit
          </Button>
          {inReview && (
            <Button
              component={RouterLink}
              to={paths.reviewPost(slug)}
              variant="contained"
              startIcon={<RateReviewIcon />}
            >
              Review
            </Button>
          )}
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteOpen(true)}
            sx={{ borderColor: 'rgba(239,68,68,0.5)' }}
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

      <Box sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}>
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
            <Chip size="small" label={post.category_detail.name} sx={{ bgcolor: 'rgba(56, 189, 248, 0.12)', color: '#7dd3fc' }} />
          )}
          <Chip size="small" label={`Author: ${post.author_username || post.author}`} sx={{ bgcolor: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff' }}>
          {post.title}
        </Typography>
        {post.excerpt && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
            {post.excerpt}
          </Typography>
        )}
        <BlogArticleRenderer html={post.content} />
      </Box>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)}>
        <DialogTitle>Delete post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently removes &quot;{post.title}&quot;. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
