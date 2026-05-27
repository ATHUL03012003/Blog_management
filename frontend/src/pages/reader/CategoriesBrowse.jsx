import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { fetchCategories, fetchCategoryPosts } from '../../services/categories';
import { readerGlassSx } from '../../components/reader/ReaderLayout';

export default function CategoriesBrowse() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [postsByCategory, setPostsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (!cancelled) setCategories(cats);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleExpand = async (slug) => {
    setExpanded(slug);
    if (postsByCategory[slug]) return;
    try {
      const posts = await fetchCategoryPosts(slug);
      setPostsByCategory((prev) => ({ ...prev, [slug]: posts }));
    } catch {
      setPostsByCategory((prev) => ({ ...prev, [slug]: [] }));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/reader')} sx={{ color: '#7dd3fc' }} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800}>
          Categories
        </Typography>
      </Box>

      {loading ? (
        [1, 2, 3].map((n) => (
          <Skeleton key={n} variant="rounded" height={56} sx={{ mb: 1, bgcolor: 'rgba(56,189,248,0.08)' }} />
        ))
      ) : (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {categories.map((cat, i) => (
            <Accordion
              key={cat.id}
              expanded={expanded === cat.slug}
              onChange={() => handleExpand(cat.slug)}
              component={motion.div}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              sx={{
                ...readerGlassSx,
                mb: 1.5,
                '&:before': { display: 'none' },
                bgcolor: 'transparent',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#7dd3fc' }} />}>
                <Typography fontWeight={700}>{cat.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {cat.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {cat.description}
                  </Typography>
                )}
                <List dense disablePadding>
                  {(postsByCategory[cat.slug] ?? []).length === 0 && expanded === cat.slug && !postsByCategory[cat.slug] ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading posts…
                    </Typography>
                  ) : (postsByCategory[cat.slug] ?? []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No published posts in this category yet.
                    </Typography>
                  ) : (
                    postsByCategory[cat.slug].map((post) => (
                      <ListItemButton
                        key={post.id}
                        component={RouterLink}
                        to={`/reader/read/${post.slug}`}
                        sx={{ borderRadius: 2, mb: 0.5 }}
                      >
                        <ListItemText primary={post.title} secondary={post.excerpt} />
                      </ListItemButton>
                    ))
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
