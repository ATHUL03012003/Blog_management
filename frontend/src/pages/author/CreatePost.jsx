import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../services/authorPosts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import PostEditorForm from '../../components/author/PostEditorForm';
import parseApiError from '../../utils/parseApiError';

export default function CreatePost() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ title: '', excerpt: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.title.trim() || !values.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const post = await createPost({
        title: values.title.trim(),
        excerpt: values.excerpt.trim(),
        content: values.content.trim(),
      });
      setSuccess('Draft created.');
      setTimeout(() => navigate(`/author/posts/${post.slug}/edit`), 600);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/author/posts')} sx={{ color: '#7dd3fc' }} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800}>
          New post
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <PostEditorForm values={values} onChange={setValues} />

        <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving}>
            {saving ? 'Saving…' : 'Save draft'}
          </Button>
          <Button variant="text" onClick={() => navigate('/author/posts')} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
