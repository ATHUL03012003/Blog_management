import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Button,
  Skeleton,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchMyPosts } from '../../services/authorPosts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import { POST_STATUS, POST_STATUS_LABELS } from '../../constants/postStatus';
import { editorPaths } from '../../constants/editorPaths';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: POST_STATUS.DRAFT, label: POST_STATUS_LABELS[POST_STATUS.DRAFT] },
  { key: POST_STATUS.REVIEW, label: POST_STATUS_LABELS[POST_STATUS.REVIEW] },
  { key: POST_STATUS.APPROVED, label: POST_STATUS_LABELS[POST_STATUS.APPROVED] },
  { key: POST_STATUS.PUBLISHED, label: POST_STATUS_LABELS[POST_STATUS.PUBLISHED] },
  { key: POST_STATUS.REJECTED, label: POST_STATUS_LABELS[POST_STATUS.REJECTED] },
];

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyPosts();
        if (!cancelled) setPosts(data);
      } catch {
        if (!cancelled) setError('Could not load your posts.');
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(editorPaths.home)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800}>
            My posts
          </Typography>
        </Box>
        <Button component={RouterLink} to={editorPaths.newPost} variant="contained" startIcon={<AddIcon />}>
          New post
        </Button>
      </Box>

      <Tabs
        value={filter}
        onChange={(_, v) => setFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: '1px solid rgba(56,189,248,0.15)' }}
      >
        {FILTERS.map((f) => (
          <Tab key={String(f.key)} label={f.label} value={f.key} sx={{ color: 'text.secondary', minHeight: 48 }} />
        ))}
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        [1, 2, 3].map((n) => (
          <Skeleton key={n} variant="rounded" height={88} sx={{ mb: 2, bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />
        ))
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary">No posts in this category yet.</Typography>
      ) : (
        <Box component={motion.div} initial="hidden" animate="visible">
          {filtered.map((post) => (
            <Box
              key={post.id}
              component={motion.div}
              whileHover={{ scale: 1.01, y: -2 }}
              sx={{ ...readerGlassSx, p: 2.5, mb: 2 }}
            >
              <Box component={RouterLink} to={editorPaths.post(post.slug)} sx={{ textDecoration: 'none', color: 'inherit' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>{post.title}</Typography>
                  <PostStatusChip status={post.status} />
                </Box>
                <Typography variant="body2" color="text.secondary">{post.excerpt || 'No excerpt'}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
