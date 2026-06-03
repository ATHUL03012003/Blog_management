import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { superadminPaths } from '../../constants/superadminPaths';
import { SUPERADMIN_ROLE } from '../../constants/roles';
import StatCard from '../../components/reader/StatCard';
import ActionCard from '../../components/reader/ActionCard';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { fetchPlatformOverview } from '../../services/superadminUser';
import { fetchReviewQueue } from '../../services/adminPosts';
import PostStatusChip from '../../components/author/PostStatusChip';
import { POST_STATUS } from '../../constants/postStatus';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const accent = '#a78bfa';

export default function HomeOverview() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recentReview, setRecentReview] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ov, review] = await Promise.all([fetchPlatformOverview(), fetchReviewQueue()]);
        if (!cancelled) {
          setOverview(ov);
          setRecentReview(review.slice(0, 4));
        }
      } catch {
        if (!cancelled) {
          setOverview(null);
          setRecentReview([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (user?.role !== SUPERADMIN_ROLE) return null;

  const inReview = overview?.posts_by_status?.['2']?.count ?? 0;
  const published = overview?.posts_by_status?.['3']?.count ?? 0;

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
          sx={{ color: '#f0f9ff' }}
        >
          Super Admin — {user?.username}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Full platform control: all users, roles, posts, review queue, and taxonomy.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          icon={GroupIcon}
          label="Total users"
          value={loading ? '—' : overview?.total_users ?? 0}
          index={0}
          accent={accent}
        />
        <StatCard icon={ArticleIcon} label="Total posts" value={loading ? '—' : overview?.total_posts ?? 0} index={1} accent="#38bdf8" />
        <StatCard icon={RateReviewIcon} label="In review" value={loading ? '—' : inReview} index={2} accent="#fbbf24" />
        <StatCard icon={ArticleIcon} label="Published" value={loading ? '—' : published} index={3} accent="#22c55e" />
        <StatCard
          icon={AdminPanelSettingsIcon}
          label="Admins"
          value={loading ? '—' : overview?.users_by_role?.['0']?.count ?? 0}
          index={4}
          accent="#7dd3fc"
        />
      </Box>

      {!loading && overview && (
        <Grid container spacing={2} sx={{ mb: 4, alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <Box sx={{ ...readerGlassSx, p: 2.5, flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#e0f2fe', mb: 1.5 }}>
                Users by role
              </Typography>
              <Box sx={{ flex: 1 }}>
                {Object.entries(overview.users_by_role || {}).map(([key, val]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                    <Typography variant="body2" color="text.secondary">
                      {val.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: accent }}>
                      {val.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
            <Box sx={{ ...readerGlassSx, p: 2.5, flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#e0f2fe', mb: 1.5 }}>
                Posts by status
              </Typography>
              <Box sx={{ flex: 1 }}>
                {Object.entries(overview.posts_by_status || {}).map(([key, val]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                    <Typography variant="body2" color="text.secondary">
                      {val.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#7dd3fc' }}>
                      {val.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}

      <Typography variant="h6" fontWeight={700} sx={{ color: '#e0f2fe', mb: 2 }}>
        Quick actions
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <ActionCard
          title="All users"
          description="Manage every account and assign Reader, Author, Editor, or Admin roles."
          icon={PeopleIcon}
          to={superadminPaths.users}
          index={0}
          gradient="linear-gradient(135deg, rgba(167, 139, 250, 0.35) 0%, rgba(124, 58, 237, 0.12) 100%)"
        />
        <ActionCard
          title="New post"
          description="Create content with Cloudinary-hosted images."
          icon={PostAddIcon}
          to={superadminPaths.newPost}
          index={1}
        />
        <ActionCard
          title="All posts"
          description="Browse and moderate every post on the platform."
          icon={ArticleIcon}
          to={superadminPaths.posts}
          index={2}
        />
        <ActionCard
          title="Review queue"
          description="Approve or reject submissions with editor feedback."
          icon={RateReviewIcon}
          to={superadminPaths.review}
          index={3}
        />
        <ActionCard
          title="Categories"
          description="Manage categories, tags, and delete taxonomy items."
          icon={CategoryIcon}
          to={superadminPaths.categories}
          index={4}
        />
        <ActionCard
          title="Profile"
          description="Your account and password settings."
          icon={PersonIcon}
          to={superadminPaths.profile}
          index={5}
        />
      </Box>

      {recentReview.length > 0 && (
        <Box sx={{ ...readerGlassSx, p: { xs: 2, md: 3 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
            Pending review
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recentReview.map((post) => (
              <Box
                key={post.id}
                component={RouterLink}
                to={superadminPaths.reviewPost(post.slug)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid rgba(167,139,250,0.15)',
                  '&:hover': { bgcolor: 'rgba(167,139,250,0.08)' },
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap sx={{ color: '#f0f9ff' }}>
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

      {loading && <Skeleton variant="rounded" height={80} sx={{ mt: 2, bgcolor: 'rgba(167,139,250,0.08)' }} />}
    </Box>
  );
}
