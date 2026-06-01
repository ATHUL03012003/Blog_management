import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import ArticleIcon from '@mui/icons-material/Article';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PublishIcon from '@mui/icons-material/Publish';
import RateReviewIcon from '@mui/icons-material/RateReview';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/reader/StatCard';
import ActionCard from '../../components/reader/ActionCard';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { fetchMyPosts } from '../../services/authorPosts';
import { POST_STATUS } from '../../constants/postStatus';
import PostStatusChip from '../../components/author/PostStatusChip';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function HomeOverview() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMyPosts();
        if (!cancelled) setPosts(data);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = {
    total: posts.length,
    draft: posts.filter((p) => p.status === POST_STATUS.DRAFT).length,
    review: posts.filter((p) => p.status === POST_STATUS.REVIEW).length,
    published: posts.filter((p) => p.status === POST_STATUS.PUBLISHED).length,
  };

  const recent = posts.slice(0, 4);

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
          Author studio — {user?.username}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Create drafts, submit for editor review, and publish only after approval.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <StatCard icon={ArticleIcon} label="Total posts" value={loading ? '—' : counts.total} index={0} />
        <StatCard icon={EditNoteIcon} label="Drafts" value={loading ? '—' : counts.draft} index={1} accent="#94a3b8" />
        <StatCard icon={RateReviewIcon} label="In review" value={loading ? '—' : counts.review} index={2} accent="#fbbf24" />
        <StatCard icon={PublishIcon} label="Published" value={loading ? '—' : counts.published} index={3} accent="#22c55e" />
      </Box>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#e0f2fe' }}>
        Quick actions
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <ActionCard
          title="New post"
          description="Start a fresh draft with title, excerpt, and full content."
          icon={PostAddIcon}
          to="/author/posts/new"
          index={0}
        />
        <ActionCard
          title="My posts"
          description="View all drafts, submissions, and published articles in one place."
          icon={ListAltIcon}
          to="/author/posts"
          index={1}
          gradient="linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(56, 189, 248, 0.12) 100%)"
        />
        <ActionCard
          title="Profile"
          description="Update account details and password."
          icon={PersonIcon}
          to="/author/profile"
          index={2}
          gradient="linear-gradient(135deg, rgba(167, 139, 250, 0.25) 0%, rgba(56, 189, 248, 0.1) 100%)"
        />
      </Box>

      {!loading && recent.length > 0 && (
        <Box sx={{ ...readerGlassSx, p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
            Recent work
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {recent.map((post) => (
              <Box
                key={post.id}
                component={RouterLink}
                to={`/author/posts/${post.slug}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  border: '1px solid rgba(56, 189, 248, 0.12)',
                  '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.08)' },
                }}
              >
                <Typography fontWeight={600} noWrap sx={{ flex: 1 }}>
                  {post.title}
                </Typography>
                <PostStatusChip status={post.status} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
