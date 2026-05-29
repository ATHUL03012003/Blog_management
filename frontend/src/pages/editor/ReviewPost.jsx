import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPost, approvePost, rejectPost } from '../../services/editorPosts';
import { mediaUrl } from '../../services/posts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import BlogArticleRenderer from '../../components/author/BlogArticleRenderer';
import PostStatusChip from '../../components/author/PostStatusChip';
import parseApiError from '../../utils/parseApiError';
import { editorPaths } from '../../constants/editorPaths';
import { POST_STATUS } from '../../constants/postStatus';
import RejectPostDialog from '../../components/editor/RejectPostDialog';

export default function ReviewPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPost(slug);
        if (!cancelled) setPost(data);
      } catch {
        if (!cancelled) setMsg({ type: 'error', text: 'Post not found.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleApprove = async () => {
    setActing('approve');
    setMsg({ type: '', text: '' });
    try {
      await approvePost(slug);
      setMsg({ type: 'success', text: 'Post approved. The author can now publish it.' });
      setTimeout(() => navigate(editorPaths.review), 900);
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setActing('');
    }
  };

  const handleRejectSubmit = async ({ rejection_reason, improvement_areas }) => {
    setActing('reject');
    setRejectError('');
    try {
      await rejectPost(slug, { rejection_reason, improvement_areas });
      setRejectOpen(false);
      setMsg({ type: 'success', text: 'Post rejected with feedback sent to the author.' });
      setTimeout(() => navigate(editorPaths.review), 900);
    } catch (err) {
      setRejectError(parseApiError(err));
    } finally {
      setActing('');
    }
  };

  if (loading) {
    return <Skeleton variant="rounded" height={400} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />;
  }

  if (!post) {
    return <Alert severity="error">{msg.text || 'Post not found.'}</Alert>;
  }

  const inReview = post.status === POST_STATUS.REVIEW;

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(editorPaths.review)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <PostStatusChip status={post.status} size="medium" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(editorPaths.editPost(slug))}
            sx={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#7dd3fc' }}
          >
            Edit post
          </Button>
          {inReview && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled={!!acting}
                onClick={handleApprove}
              >
                {acting === 'approve' ? '…' : 'Approve for publication'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                disabled={!!acting}
                onClick={() => {
                  setRejectError('');
                  setRejectOpen(true);
                }}
                sx={{ borderColor: 'rgba(239, 68, 68, 0.5)' }}
              >
                Reject with feedback
              </Button>
            </>
          )}
        </Box>
      </Box>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      {!inReview && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This post is no longer in the review queue.
        </Alert>
      )}

      <Box sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}>
        {post.image && (
          <Box
            component="img"
            src={mediaUrl(post.image)}
            alt={post.title}
            sx={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 2, mb: 3 }}
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

      <RejectPostDialog
        open={rejectOpen}
        onClose={() => !acting && setRejectOpen(false)}
        onSubmit={handleRejectSubmit}
        submitting={acting === 'reject'}
        error={rejectError}
        postTitle={post.title}
      />
    </Box>
  );
}
