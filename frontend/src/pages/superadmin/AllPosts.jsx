import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Skeleton,
  Alert,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchAllPostsAdmin } from '../../services/adminPosts';
import { superadminPaths } from '../../constants/superadminPaths';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import { POST_STATUS, POST_STATUS_LABELS } from '../../constants/postStatus';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: POST_STATUS.DRAFT, label: POST_STATUS_LABELS[POST_STATUS.DRAFT] },
  { key: POST_STATUS.REVIEW, label: POST_STATUS_LABELS[POST_STATUS.REVIEW] },
  { key: POST_STATUS.APPROVED, label: POST_STATUS_LABELS[POST_STATUS.APPROVED] },
  { key: POST_STATUS.PUBLISHED, label: POST_STATUS_LABELS[POST_STATUS.PUBLISHED] },
  { key: POST_STATUS.REJECTED, label: POST_STATUS_LABELS[POST_STATUS.REJECTED] },
];

export default function AllPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllPostsAdmin();
        if (!cancelled) setPosts(data);
      } catch {
        if (!cancelled) setError('Could not load posts.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((p) => p.status === filter);
  }, [posts, filter]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(superadminPaths.home)} sx={{ color: '#c4b5fd' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800} sx={{ color: '#f0f9ff' }}>
            All posts
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to={superadminPaths.newPost}
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
        >
          New post
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={filter}
        onChange={(_, v) => setFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: '1px solid rgba(167,139,250,0.2)' }}
      >
        {FILTERS.map((f) => (
          <Tab key={String(f.key)} label={f.label} value={f.key} sx={{ color: 'text.secondary', minWidth: { xs: 72, sm: 88 } }} />
        ))}
      </Tabs>

      {loading ? (
        <Skeleton variant="rounded" height={200} sx={{ bgcolor: 'rgba(167,139,250,0.08)' }} />
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary">No posts in this filter.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((post, i) => (
            <Box
              key={post.id}
              component={motion.div}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              sx={{ ...readerGlassSx, p: { xs: 2, md: 2.5 } }}
            >
              <Box
                component={RouterLink}
                to={superadminPaths.post(post.slug)}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'flex-start' },
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#f0f9ff' }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      By {post.author_username || post.author} · {new Date(post.updated_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <PostStatusChip status={post.status} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
