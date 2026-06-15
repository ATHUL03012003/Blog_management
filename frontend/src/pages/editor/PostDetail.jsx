import { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton, Skeleton, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { fetchAuthorPost } from '../../services/authorPosts';
import { mediaUrl } from '../../services/posts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import BlogArticleRenderer from '../../components/author/BlogArticleRenderer';
import { editorPaths } from '../../constants/editorPaths';
import PostEngagement from '../../components/engagement/PostEngagement';
import ArticleLikeBar from '../../components/engagement/ArticleLikeBar';
import { POST_STATUS } from '../../constants/postStatus';

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
          <IconButton onClick={() => navigate(editorPaths.posts)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <PostStatusChip status={post.status} size="medium" />
        </Box>
        <Button component={RouterLink} to={editorPaths.editPost(slug)} variant="contained" startIcon={<EditIcon />}>
          Edit
        </Button>
      </Box>

      <Box sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}>
        {post.image && (
          <Box component="img" src={mediaUrl(post.image)} alt={post.title} sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2, mb: 3 }} />
        )}
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff' }}>{post.title}</Typography>
        {post.status === POST_STATUS.PUBLISHED && (
          <ArticleLikeBar
            slug={slug}
            post={post}
            onPostUpdate={(updates) => setPost((prev) => ({ ...prev, ...updates }))}
          />
        )}
        {post.excerpt && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>{post.excerpt}</Typography>
        )}
        <BlogArticleRenderer html={post.content} />
      </Box>

      <PostEngagement
        slug={slug}
        post={post}
        onPostUpdate={(updates) => setPost((prev) => ({ ...prev, ...updates }))}
      />
    </Box>
  );
}
