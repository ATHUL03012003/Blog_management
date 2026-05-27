import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import PublishIcon from '@mui/icons-material/Publish';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchAuthorPost,
  updatePost,
  deletePost,
  submitPostForReview,
  publishPost,
} from '../../services/authorPosts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostEditorForm from '../../components/author/PostEditorForm';
import PostStatusChip from '../../components/author/PostStatusChip';
import parseApiError from '../../utils/parseApiError';
import {
  POST_STATUS,
  canEditPost,
  canSubmitForReview,
  canPublish,
  canDelete,
} from '../../constants/postStatus';

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [values, setValues] = useState({ title: '', excerpt: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthorPost(slug);
      setPost(data);
      setValues({ title: data.title, excerpt: data.excerpt || '', content: data.content });
    } catch {
      setMsg({ type: 'error', text: 'Post not found.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [slug]);

  const editable = post && canEditPost(post.status);
  const inReview = post?.status === POST_STATUS.REVIEW;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editable) return;
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const updated = await updatePost(slug, {
        title: values.title.trim(),
        excerpt: values.excerpt.trim(),
        content: values.content.trim(),
      });
      setPost(updated);
      setMsg({ type: 'success', text: 'Changes saved.' });
      if (updated.slug !== slug) navigate(`/author/posts/${updated.slug}/edit`, { replace: true });
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action, fn, successText, redirect) => {
    setActing(action);
    setMsg({ type: '', text: '' });
    try {
      const updated = await fn();
      setPost(updated);
      setMsg({ type: 'success', text: successText });
      if (redirect) setTimeout(() => navigate(redirect), 700);
      else await load();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    } finally {
      setActing('');
    }
  };

  const handleDelete = async () => {
    setActing('delete');
    try {
      await deletePost(slug);
      navigate('/author/posts');
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
      setActing('');
    }
    setDeleteOpen(false);
  };

  if (loading) {
    return <Skeleton variant="rounded" height={400} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />;
  }

  if (!post) {
    return <Alert severity="error">{msg.text || 'Post not found.'}</Alert>;
  }

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(`/author/posts/${slug}`)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800}>
            Edit post
          </Typography>
          <PostStatusChip status={post.status} />
        </Box>
      </Box>

      {inReview && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This post is with an editor for review. You cannot edit it until it is approved or rejected.
        </Alert>
      )}

      {post.status === POST_STATUS.REJECTED && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This post was rejected. Update it and submit again for review, or publish directly.
        </Alert>
      )}

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSave} sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}>
        <PostEditorForm values={values} onChange={setValues} disabled={!editable && post.status !== POST_STATUS.PUBLISHED} />

        <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
          {(editable || post.status === POST_STATUS.PUBLISHED) && (
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving || inReview}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          )}

          {canSubmitForReview(post.status) && (
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              disabled={!!acting}
              onClick={() =>
                runAction('submit', () => submitPostForReview(slug), 'Submitted for editor review.', null)
              }
              sx={{ borderColor: 'rgba(245,158,11,0.5)', color: '#fbbf24' }}
            >
              {acting === 'submit' ? '…' : 'Submit for review'}
            </Button>
          )}

          {canPublish(post.status) && (
            <Button
              variant="outlined"
              startIcon={<PublishIcon />}
              disabled={!!acting}
              onClick={() =>
                runAction('publish', () => publishPost(slug), 'Post published!', `/author/posts/${slug}`)
              }
              sx={{ borderColor: 'rgba(34,197,94,0.5)', color: '#86efac' }}
            >
              {acting === 'publish' ? '…' : 'Publish now'}
            </Button>
          )}

          {canDelete(post.status) && (
            <Button
              color="error"
              variant="text"
              startIcon={<DeleteIcon />}
              disabled={!!acting}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete post?</DialogTitle>
        <DialogContent>
          <DialogContentText>This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={acting === 'delete'}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
