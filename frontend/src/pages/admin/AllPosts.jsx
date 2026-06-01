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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchAllPostsAdmin, deletePostAdmin } from '../../services/adminPosts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostStatusChip from '../../components/author/PostStatusChip';
import { POST_STATUS, POST_STATUS_LABELS } from '../../constants/postStatus';
import { useDashboardPaths } from '../../hooks/useDashboardPaths';
import parseApiError from '../../utils/parseApiError';

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
  const paths = useDashboardPaths();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await fetchAllPostsAdmin());
    } catch {
      setError('Could not load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((p) => p.status === filter);
  }, [posts, filter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setMsg({ type: '', text: '' });
    try {
      await deletePostAdmin(deleteTarget.slug);
      setMsg({ type: 'success', text: 'Post deleted.' });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(paths.home)} sx={{ color: '#7dd3fc' }} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#f0f9ff' }}>
          All posts
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}

      <Tabs
        value={filter}
        onChange={(_, v) => setFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: '1px solid rgba(56,189,248,0.15)' }}
      >
        {FILTERS.map((f) => (
          <Tab key={String(f.key)} value={f.key} label={f.label} sx={{ color: 'text.secondary' }} />
        ))}
      </Tabs>

      {loading ? (
        <Skeleton variant="rounded" height={200} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />
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
              sx={{ ...readerGlassSx, p: 2.5 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#f0f9ff', mb: 0.5 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By {post.author_username || post.author} · {new Date(post.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <PostStatusChip status={post.status} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {post.status === POST_STATUS.REVIEW && (
                  <Button
                    component={RouterLink}
                    to={paths.reviewPost(post.slug)}
                    size="small"
                    variant="contained"
                  >
                    Review
                  </Button>
                )}
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteTarget(post)}
                  sx={{ borderColor: 'rgba(239,68,68,0.5)' }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>Delete post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Permanently delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
