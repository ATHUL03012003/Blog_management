import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Skeleton,
  Alert,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchReviewQueue } from '../../services/editorPosts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import { editorPaths } from '../../constants/editorPaths';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ReviewQueue() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setPosts(await fetchReviewQueue());
    } catch {
      setError('Could not load the review queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(editorPaths.home)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800}>
            Review queue
          </Typography>
        </Box>
        <Button onClick={load} disabled={loading} sx={{ color: '#7dd3fc' }}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        [1, 2, 3].map((n) => (
          <Skeleton key={n} variant="rounded" height={88} sx={{ mb: 2, bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />
        ))
      ) : posts.length === 0 ? (
        <Typography color="text.secondary">No posts waiting for review. Check back later.</Typography>
      ) : (
        <Box component={motion.div} initial="hidden" animate="visible">
          {posts.map((post, i) => (
            <Box
              key={post.id}
              component={motion.div}
              variants={itemVariants}
              whileHover={{ scale: 1.01, y: -2 }}
              sx={{
                ...readerGlassSx,
                p: 2.5,
                mb: 2,
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                component={RouterLink}
                to={editorPaths.reviewPost(post.slug)}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {post.title}
                  </Typography>
                  <PostStatusChip status={post.status} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Author: {post.author_username || `#${post.author}`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {post.excerpt || 'No excerpt'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submitted {new Date(post.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
