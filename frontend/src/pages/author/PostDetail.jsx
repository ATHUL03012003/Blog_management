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
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { fetchAuthorPost } from '../../services/authorPosts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import { canEditPost, POST_STATUS } from '../../constants/postStatus';

export default function PostDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Box component={motion.article} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/author/posts')} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <PostStatusChip status={post.status} size="medium" />
        </Box>
        <Button
          component={RouterLink}
          to={`/author/posts/${slug}/edit`}
          variant="contained"
          startIcon={<EditIcon />}
          disabled={!canEditPost(post.status) && post.status !== POST_STATUS.PUBLISHED}
        >
          {canEditPost(post.status) || post.status === POST_STATUS.PUBLISHED ? 'Edit' : 'In review'}
        </Button>
      </Box>

      <Box sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff' }}>
          {post.title}
        </Typography>
        {post.excerpt && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
            {post.excerpt}
          </Typography>
        )}
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}
        >
          {post.content}
        </Typography>
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
