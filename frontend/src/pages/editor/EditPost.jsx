import { useEffect, useState } from 'react';
import {
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  getPlainTextFromHtml,
} from '../../services/authorPosts';
import PostEditorLayout, { EMPTY_FORM } from '../../components/author/PostEditorLayout';
import parseApiError from '../../utils/parseApiError';
import {
  POST_STATUS,
  canSubmitForReview,
  canEditorPublish,
  canDelete,
} from '../../constants/postStatus';
import { editorPaths } from '../../constants/editorPaths';

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [values, setValues] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAuthorPost(slug);
        if (!cancelled) {
          setPost(data);
          setValues({
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            category: data.category ?? null,
            tags: data.tags || [],
            coverFile: null,
            coverUrl: data.image || null,
          });
        }
      } catch {
        if (!cancelled) setError('Post not found.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!post) return;
    if (!values.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!getPlainTextFromHtml(values.content)) {
      setError('Article body is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updatePost(slug, {
        title: values.title.trim(),
        excerpt: values.excerpt.trim(),
        content: values.content,
        category: values.category,
        tags: values.tags,
        coverFile: values.coverFile,
      });
      setPost(updated);
      setValues((v) => ({ ...v, coverFile: null, coverUrl: updated.image || null }));
      setSuccess('Changes saved.');
      if (updated.slug !== slug) {
        navigate(editorPaths.editPost(updated.slug), { replace: true });
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action, fn, successText, redirect) => {
    setActing(action);
    setError('');
    try {
      const updated = await fn();
      setPost(updated);
      setSuccess(successText);
      if (redirect) setTimeout(() => navigate(redirect), 700);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setActing('');
    }
  };

  const handleDelete = async () => {
    setActing('delete');
    try {
      await deletePost(slug);
      navigate(editorPaths.posts);
    } catch (err) {
      setError(parseApiError(err));
      setActing('');
    }
    setDeleteOpen(false);
  };

  if (loading) {
    return <Skeleton variant="rounded" height={400} sx={{ bgcolor: 'rgba(56,189,248,0.08)', borderRadius: 3 }} />;
  }

  if (!post) {
    return <Alert severity="error">{error || 'Post not found.'}</Alert>;
  }

  const extraActions = (
    <>
      {canSubmitForReview(post.status) && (
        <Button
          variant="outlined"
          startIcon={<SendIcon />}
          disabled={!!acting || saving}
          onClick={() => runAction('submit', () => submitPostForReview(slug), 'Submitted for review.', null)}
          sx={{ borderColor: 'rgba(245,158,11,0.5)', color: '#fbbf24' }}
        >
          {acting === 'submit' ? '…' : 'Submit for review'}
        </Button>
      )}
      {canEditorPublish(post.status) && (
        <Button
          variant="outlined"
          startIcon={<PublishIcon />}
          disabled={!!acting || saving}
          onClick={() =>
            runAction('publish', () => publishPost(slug), 'Post published!', editorPaths.post(slug))
          }
          sx={{ borderColor: 'rgba(34,197,94,0.5)', color: '#86efac' }}
        >
          {acting === 'publish' ? '…' : 'Publish now'}
        </Button>
      )}
      {canDelete(post.status) && (
        <Button color="error" variant="text" startIcon={<DeleteIcon />} disabled={!!acting || saving} onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      )}
    </>
  );

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PostEditorLayout
        pageTitle="Edit post"
        status={post.status}
        backButton={
          <IconButton onClick={() => navigate(editorPaths.post(slug))} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        }
        values={values}
        onChange={setValues}
        onSubmit={handleSave}
        saving={saving}
        error={error}
        success={success}
        submitLabel="Save changes"
        extraActions={extraActions}
      />

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
