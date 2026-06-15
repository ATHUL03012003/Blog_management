import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ModeCommentIcon from '@mui/icons-material/ModeComment';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchPublishedPosts, mediaUrl } from '../../services/posts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function ReadBlogs() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublishedPosts();
        if (!cancelled) setPosts(data);
      } catch {
        if (!cancelled) setError('Could not load blogs. Is the API running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(query.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(query.toLowerCase()) ||
      p.category_detail?.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/reader')} sx={{ color: '#7dd3fc' }} aria-label="Back to overview">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800}>
          Read blogs
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search by title, excerpt, or category…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 3, ...readerGlassSx }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} variant="rounded" height={140} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />
          ))}
        </Box>
      ) : (
        <Box component={motion.div} variants={listVariants} initial="hidden" animate="visible">
          {filtered.length === 0 ? (
            <Typography color="text.secondary">No posts match your search.</Typography>
          ) : (
            filtered.map((post) => (
              <Box
                key={post.id}
                component={motion.div}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                sx={{ mb: 2 }}
              >
                <Card
                  component={RouterLink}
                  to={`/reader/read/${post.slug}`}
                  sx={{
                    ...readerGlassSx,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    textDecoration: 'none',
                    color: 'inherit',
                    overflow: 'hidden',
                  }}
                >
                  {post.image && (
                    <CardMedia
                      component="img"
                      image={mediaUrl(post.image)}
                      alt={post.title}
                      sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 160, sm: 'auto' }, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {post.title}
                    </Typography>
                    {post.category_detail && (
                      <Chip
                        size="small"
                        label={post.category_detail.name}
                        sx={{ mb: 1, bgcolor: 'rgba(56, 189, 248, 0.12)', color: '#7dd3fc' }}
                      />
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.excerpt || 'Open to read this story in your preferred language.'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FavoriteBorderIcon sx={{ fontSize: 16, color: '#f472b6' }} />
                        <Typography variant="caption" color="text.secondary">
                          {post.like_count ?? 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ModeCommentIcon sx={{ fontSize: 16, color: '#7dd3fc' }} />
                        <Typography variant="caption" color="text.secondary">
                          {post.comment_count ?? 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
