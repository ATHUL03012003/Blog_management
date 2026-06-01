import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardPaths } from '../../hooks/useDashboardPaths';
import { SUPERADMIN_ROLE } from '../../constants/roles';
import StatCard from '../../components/reader/StatCard';
import ActionCard from '../../components/reader/ActionCard';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { fetchManageableUsers } from '../../services/user';
import { fetchReviewQueue } from '../../services/editorPosts';
import { fetchAllPostsAdmin } from '../../services/adminPosts';
import { fetchCategories, fetchTags } from '../../services/editorCategories';
import PostStatusChip from '../../components/author/PostStatusChip';
import { POST_STATUS } from '../../constants/postStatus';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function HomeOverview() {
  const { user } = useAuth();
  const paths = useDashboardPaths();
  const isSuper = user?.role === SUPERADMIN_ROLE;
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    inReview: 0,
    published: 0,
    categories: 0,
    tags: 0,
  });
  const [recentReview, setRecentReview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [users, posts, queue, categories, tags] = await Promise.all([
          fetchManageableUsers(),
          fetchAllPostsAdmin(),
          fetchReviewQueue(),
          fetchCategories(),
          fetchTags(),
        ]);
        if (!cancelled) {
          setStats({
            users: users.length,
            posts: posts.length,
            inReview: queue.length,
            published: posts.filter((p) => p.status === POST_STATUS.PUBLISHED).length,
            categories: categories.length,
            tags: tags.length,
          });
          setRecentReview(queue.slice(0, 4));
        }
      } catch {
        if (!cancelled) {
          setStats({ users: 0, posts: 0, inReview: 0, published: 0, categories: 0, tags: 0 });
          setRecentReview([]);
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
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff' }}>
          {isSuper ? 'Super Admin' : 'Admin'} overview
        </Typography>
        <Typography color="text.secondary">
          Manage users, moderate all posts, review submissions, and maintain categories and tags.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard icon={PeopleIcon} label="Readers & authors" value={loading ? '—' : stats.users} index={0} accent="#38bdf8" />
        <StatCard icon={ArticleIcon} label="All posts" value={loading ? '—' : stats.posts} index={1} accent="#a78bfa" />
        <StatCard icon={RateReviewIcon} label="In review" value={loading ? '—' : stats.inReview} index={2} accent="#fbbf24" />
        <StatCard icon={ArticleIcon} label="Published" value={loading ? '—' : stats.published} index={3} accent="#22c55e" />
        <StatCard icon={CategoryIcon} label="Categories" value={loading ? '—' : stats.categories} index={4} accent="#7dd3fc" />
        <StatCard icon={LabelIcon} label="Tags" value={loading ? '—' : stats.tags} index={5} accent="#94a3b8" />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <ActionCard
          title="User roles"
          description="Promote readers to authors or demote authors to readers."
          icon={PeopleIcon}
          to={paths.users}
          index={0}
        />
        <ActionCard
          title="All posts"
          description="View every post on the platform and remove content if needed."
          icon={ArticleIcon}
          to={paths.allPosts}
          index={1}
        />
        <ActionCard
          title="Review queue"
          description="Approve or reject posts waiting for editorial review."
          icon={RateReviewIcon}
          to={paths.review}
          index={2}
        />
        <ActionCard
          title="Categories & tags"
          description="Create, edit, or delete taxonomy (delete is admin-only)."
          icon={CategoryIcon}
          to={paths.categories}
          index={3}
        />
      </Box>

      <Box sx={{ ...readerGlassSx, p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
          Pending review
        </Typography>
        {loading ? (
          <Skeleton variant="rounded" height={80} sx={{ bgcolor: 'rgba(56,189,248,0.08)' }} />
        ) : recentReview.length === 0 ? (
          <Typography color="text.secondary">No posts awaiting review.</Typography>
        ) : (
          recentReview.map((post) => (
            <Box
              key={post.id}
              component={RouterLink}
              to={paths.reviewPost(post.slug)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                py: 1.5,
                textDecoration: 'none',
                color: 'inherit',
                borderBottom: '1px solid rgba(56,189,248,0.08)',
                '&:last-child': { borderBottom: 0 },
              }}
            >
              <Typography fontWeight={600} sx={{ color: '#e0f2fe' }}>
                {post.title}
              </Typography>
              <PostStatusChip status={post.status} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
