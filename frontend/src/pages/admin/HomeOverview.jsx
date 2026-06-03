import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAdminPaths } from '../../hooks/useAdminPaths';
import { ADMIN_ROLE } from '../../constants/roles';
import StatCard from '../../components/reader/StatCard';
import ActionCard from '../../components/reader/ActionCard';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { fetchManageableUsers } from '../../services/user';
import { fetchAllPostsAdmin, fetchReviewQueue } from '../../services/adminPosts';
import { fetchCategories } from '../../services/editorCategories';
import PostStatusChip from '../../components/author/PostStatusChip';
import { POST_STATUS } from '../../constants/postStatus';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function HomeOverview() {
  const { user } = useAuth();
  const paths = useAdminPaths();
  const [stats, setStats] = useState({
    readers: 0,
    authors: 0,
    posts: 0,
    inReview: 0,
    categories: 0,
  });
  const [recentReview, setRecentReview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [readers, authors, allPosts, review, categories] = await Promise.all([
          fetchManageableUsers(1),
          fetchManageableUsers(2),
          fetchAllPostsAdmin(),
          fetchReviewQueue(),
          fetchCategories(),
        ]);
        if (!cancelled) {
          setStats({
            readers: readers.length,
            authors: authors.length,
            posts: allPosts.length,
            inReview: review.length,
            categories: categories.length,
          });
          setRecentReview(review.slice(0, 4));
        }
      } catch {
        if (!cancelled) {
          setStats({ readers: 0, authors: 0, posts: 0, inReview: 0, categories: 0 });
          setRecentReview([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (user?.role !== ADMIN_ROLE) return null;

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
          Admin — {user?.username}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Manage users, moderate all posts, run the review queue, and maintain categories and tags.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <StatCard icon={PeopleIcon} label="Readers" value={loading ? '—' : stats.readers} index={0} accent="#94a3b8" />
        <StatCard icon={PeopleIcon} label="Authors" value={loading ? '—' : stats.authors} index={1} accent="#7dd3fc" />
        <StatCard icon={ArticleIcon} label="All posts" value={loading ? '—' : stats.posts} index={2} accent="#38bdf8" />
        <StatCard icon={RateReviewIcon} label="In review" value={loading ? '—' : stats.inReview} index={3} accent="#fbbf24" />
        <StatCard icon={CategoryIcon} label="Categories" value={loading ? '—' : stats.categories} index={4} accent="#22c55e" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
        <ActionCard
          title="User roles"
          description="Promote readers to authors or demote authors back to readers."
          icon={PeopleIcon}
          to={paths.users}
          index={0}
        />
        <ActionCard
          title="New post"
          description="Create a draft with cover image and rich content (stored on Cloudinary)."
          icon={PostAddIcon}
          to={paths.newPost}
          index={1}
        />
        <ActionCard
          title="All posts"
          description="View every post on the platform across all statuses."
          icon={ArticleIcon}
          to={paths.posts}
          index={2}
        />
        <ActionCard
          title="Review queue"
          description="Approve or reject posts awaiting editorial review."
          icon={RateReviewIcon}
          to={paths.review}
          index={3}
        />
        <ActionCard
          title="Categories & tags"
          description="Create and edit taxonomy. Admins can delete categories and tags."
          icon={CategoryIcon}
          to={paths.categories}
          index={4}
        />
        <ActionCard
          title="Your profile"
          description="Account settings and password."
          icon={PersonIcon}
          to={paths.profile}
          index={5}
        />
      </Box>

      {recentReview.length > 0 && (
        <Box sx={{ ...readerGlassSx, p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
            Pending review
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recentReview.map((post) => (
              <Box
                key={post.id}
                component={RouterLink}
                to={paths.reviewPost(post.slug)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid rgba(56,189,248,0.12)',
                  '&:hover': { bgcolor: 'rgba(56,189,248,0.06)' },
                }}
              >
                <Box>
                  <Typography fontWeight={600} sx={{ color: '#f0f9ff' }}>
                    {post.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.author_username || 'Author'}
                  </Typography>
                </Box>
                <PostStatusChip status={post.status ?? POST_STATUS.REVIEW} />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {loading && (
        <Skeleton variant="rounded" height={80} sx={{ mt: 2, bgcolor: 'rgba(56,189,248,0.08)' }} />
      )}
    </Box>
  );
}
