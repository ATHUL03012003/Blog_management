import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Skeleton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { fetchAuthorPost, submitPostForReview, publishPost } from '../../services/authorPosts';
import { mediaUrl } from '../../services/posts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import BlogArticleRenderer from '../../components/author/BlogArticleRenderer';
import { canEditPost, canSubmitForReview, canAuthorPublish, POST_STATUS } from '../../constants/postStatus';
import PublishIcon from '@mui/icons-material/Publish';
import RejectionFeedback from '../../components/author/RejectionFeedback';
import parseApiError from '../../utils/parseApiError';

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAuthorPost(slug);
        if (!cancelled) setPost(data);
      } catch {
        if (!cancelled) setError('Post not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return <Skeleton variant="rounded" height={320} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />;
  }

  if (error || !post) {
    return <Alert severity="error">{error}</Alert>;
  }

  const canEdit = canEditPost(post.status) || post.status === POST_STATUS.PUBLISHED;
  const inReview = post.status === POST_STATUS.REVIEW;
  const showSubmit = canSubmitForReview(post.status);
  const showPublish = canAuthorPublish(post.status);

  const handlePublish = async () => {
    setPublishing(true);
    setMsg({ type: '', text: '' });
    try {
      const updated = await publishPost(slug);
      setPost(updated);
      setMsg({ type: 'success', text: 'Your post is now live for readers.' });
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setPublishing(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      const updated = await submitPostForReview(slug);
      setPost(updated);
      setMsg({ type: 'success', text: 'Submitted for editor review. You will be notified when it is approved or rejected.' });
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component={motion.article} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/author/posts')} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <PostStatusChip status={post.status} size="medium" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {showSubmit && (
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              disabled={submitting || publishing}
              onClick={handleSubmitForReview}
              sx={{ borderColor: 'rgba(245,158,11,0.5)', color: '#fbbf24' }}
            >
              {submitting ? 'Submitting…' : 'Submit for review'}
            </Button>
          )}
          {showPublish && (
            <Button
              variant="contained"
              color="success"
              startIcon={<PublishIcon />}
              disabled={publishing || submitting}
              onClick={handlePublish}
            >
              {publishing ? 'Publishing…' : 'Publish'}
            </Button>
          )}
          <Button
            component={RouterLink}
            to={`/author/posts/${slug}/edit`}
            variant="contained"
            startIcon={<EditIcon />}
            disabled={!canEdit}
          >
            {canEdit ? 'Edit' : 'In review'}
          </Button>
        </Box>
      </Box>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      {post.status === POST_STATUS.DRAFT && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Draft posts are only visible to you. When ready, use <strong>Submit for review</strong>. After an editor approves, you can publish it yourself.
        </Alert>
      )}

      {post.status === POST_STATUS.APPROVED && (
        <Alert severity="success" sx={{ mb: 2 }}>
          An editor approved this post. Use <strong>Publish</strong> when you are ready for readers to see it.
        </Alert>
      )}

      {inReview && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This post is in the editor review queue. You cannot edit it until an editor approves or rejects it.
        </Alert>
      )}

      <RejectionFeedback post={post} />

      <Box sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}>
        {post.image && (
          <Box
            component={motion.img}
            src={mediaUrl(post.image)}
            alt={post.title}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 3,
            }}
          />
        )}

        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff' }}>
          {post.title}
        </Typography>

        {post.excerpt && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
            {post.excerpt}
          </Typography>
        )}

        <BlogArticleRenderer html={post.content} />

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(56,189,248,0.12)' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Created {new Date(post.created_at).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Last updated {new Date(post.updated_at).toLocaleString()}
          </Typography>
          {post.published_at && (
            <Typography variant="caption" color="success.light" display="block">
              Published {new Date(post.published_at).toLocaleString()}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
