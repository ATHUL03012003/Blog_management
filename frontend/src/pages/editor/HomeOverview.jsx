import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CategoryIcon from '@mui/icons-material/Category';
import PublishIcon from '@mui/icons-material/Publish';
import LabelIcon from '@mui/icons-material/Label';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/reader/StatCard';
import ActionCard from '../../components/reader/ActionCard';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { fetchReviewQueue } from '../../services/editorPosts';
import { fetchCategories, fetchTags } from '../../services/editorCategories';
import { fetchPublishedPosts } from '../../services/posts';
import { editorPaths } from '../../constants/editorPaths';
import PostStatusChip from '../../components/author/PostStatusChip';
import { Link as RouterLink } from 'react-router-dom';
import { POST_STATUS } from '../../constants/postStatus';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function HomeOverview() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [tagCount, setTagCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [review, published, categories, tags] = await Promise.all([
          fetchReviewQueue(),
          fetchPublishedPosts(),
          fetchCategories(),
          fetchTags(),
        ]);
        if (!cancelled) {
          setQueue(review);
          setPublishedCount(published.length);
          setCategoryCount(categories.length);
          setTagCount(tags.length);
        }
      } catch {
        if (!cancelled) {
          setQueue([]);
          setPublishedCount(0);
          setCategoryCount(0);
          setTagCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pending = queue.filter((p) => p.status === POST_STATUS.REVIEW);

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
          Editor desk — {user?.username}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Review author submissions, manage categories and tags, and publish quality content.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <StatCard
          icon={RateReviewIcon}
          label="Awaiting review"
          value={loading ? '—' : pending.length}
          index={0}
          accent="#fbbf24"
        />
        <StatCard
          icon={PublishIcon}
          label="Published posts"
          value={loading ? '—' : publishedCount}
          index={1}
          accent="#22c55e"
        />
        <StatCard icon={CategoryIcon} label="Categories" value={loading ? '—' : categoryCount} index={2} />
        <StatCard icon={LabelIcon} label="Tags" value={loading ? '—' : tagCount} index={3} accent="#a78bfa" />
      </Box>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#e0f2fe' }}>
        Quick actions
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <ActionCard
          title="Review queue"
          description="Approve or reject posts authors submitted for editorial review."
          icon={RateReviewIcon}
          to={editorPaths.review}
          index={0}
        />
        <ActionCard
          title="Categories & tags"
          description="Organize the blog with categories and tags for better discovery."
          icon={CategoryIcon}
          to={editorPaths.categories}
          index={1}
          gradient="linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(56, 189, 248, 0.12) 100%)"
        />
        <ActionCard
          title="Write a post"
          description="Editors can also draft and publish articles directly."
          icon={PostAddIcon}
          to={editorPaths.newPost}
          index={2}
        />
        <ActionCard
          title="Profile"
          description="Update your account details and password."
          icon={PersonIcon}
          to={editorPaths.profile}
          index={3}
          gradient="linear-gradient(135deg, rgba(167, 139, 250, 0.25) 0%, rgba(56, 189, 248, 0.1) 100%)"
        />
      </Box>

      {!loading && pending.length > 0 && (
        <Box sx={{ ...readerGlassSx, p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
            Pending reviews
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {pending.slice(0, 5).map((post) => (
              <Box
                key={post.id}
                component={RouterLink}
                to={editorPaths.reviewPost(post.slug)}
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
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap>
                    {post.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    by {post.author_username || `Author #${post.author}`}
                  </Typography>
                </Box>
                <PostStatusChip status={post.status} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
