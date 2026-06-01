import { useEffect, useState } from 'react';
import { Box, Typography, Chip, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ExploreIcon from '@mui/icons-material/Explore';
import PersonIcon from '@mui/icons-material/Person';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/reader/StatCard';
import ActionCard from '../../components/reader/ActionCard';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { getReaderStats } from '../../utils/readerStorage';
import { fetchPublishedPosts } from '../../services/posts';
import { fetchCategories } from '../../services/categories';

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function HomeOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(getReaderStats());
  const [postCount, setPostCount] = useState(null);
  const [categoryCount, setCategoryCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats(getReaderStats());
    let cancelled = false;
    (async () => {
      try {
        const [posts, categories] = await Promise.all([
          fetchPublishedPosts(),
          fetchCategories(),
        ]);
        if (!cancelled) {
          setPostCount(posts.length);
          setCategoryCount(categories.length);
        }
      } catch {
        if (!cancelled) {
          setPostCount(0);
          setCategoryCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box component={motion.div} variants={stagger} initial="hidden" animate="visible">
      <Box sx={{ mb: 4 }}>
        <Typography
          component={motion.h1}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          variant="h4"
          fontWeight={800}
          gutterBottom
        >
          Welcome back, {user?.username || 'Reader'}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Your reading hub — track progress, explore posts, and read in any language.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <StatCard
          icon={MenuBookIcon}
          label="Available blogs"
          value={loading ? '—' : postCount ?? 0}
          index={0}
        />
        <StatCard
          icon={CategoryIcon}
          label="Categories"
          value={loading ? '—' : categoryCount ?? 0}
          index={1}
          accent="#0ea5e9"
        />
        <StatCard
          icon={TrendingUpIcon}
          label="Reads this week"
          value={stats.readsThisWeek}
          index={2}
          accent="#22c55e"
        />
        <StatCard
          icon={HistoryIcon}
          label="Unique posts read"
          value={stats.uniquePosts}
          index={3}
          accent="#a78bfa"
        />
      </Box>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#e0f2fe' }}>
        Quick actions
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <ActionCard
          title="Read blogs"
          description="Browse published stories, pick a language, and enjoy smooth animated reading."
          icon={AutoStoriesIcon}
          to="/reader/read"
          index={0}
        />
        <ActionCard
          title="Browse categories"
          description="Explore topics that match your interests and jump straight into related posts."
          icon={ExploreIcon}
          to="/reader/categories"
          index={1}
          gradient="linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(56, 189, 248, 0.12) 100%)"
        />
        <ActionCard
          title="My profile"
          description="Update your details and password. Role changes require an admin."
          icon={PersonIcon}
          to="/reader/profile"
          index={2}
          gradient="linear-gradient(135deg, rgba(167, 139, 250, 0.25) 0%, rgba(56, 189, 248, 0.1) 100%)"
        />
      </Box>

      {stats.recentReads.length > 0 && (
        <Box sx={{ ...readerGlassSx, p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
            Recently read
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {stats.recentReads.map((item, i) => (
              <Chip
                key={item.slug}
                label={item.title}
                clickable
                component={RouterLink}
                to={`/reader/read/${item.slug}`}
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.1)',
                  color: '#7dd3fc',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.2)' },
                  animation: `fadeIn 0.4s ease ${i * 0.05}s both`,
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'scale(0.85)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {loading && (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rounded" height={48} sx={{ bgcolor: 'rgba(56,189,248,0.08)' }} />
        </Box>
      )}
    </Box>
  );
}
