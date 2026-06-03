import { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPost, getPlainTextFromHtml } from '../../services/authorPosts';
import PostEditorLayout, { EMPTY_FORM } from '../../components/author/PostEditorLayout';
import parseApiError from '../../utils/parseApiError';
import { editorPaths as defaultEditorPaths } from '../../constants/editorPaths';

export default function CreatePost({ paths = defaultEditorPaths }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const post = await createPost({
        title: values.title.trim(),
        excerpt: values.excerpt.trim(),
        content: values.content,
        category: values.category,
        tags: values.tags,
        coverFile: values.coverFile,
      });
      setSuccess('Draft created.');
      setTimeout(() => navigate(paths.editPost(post.slug)), 600);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PostEditorLayout
        pageTitle="New post"
        backButton={
          <IconButton onClick={() => navigate(paths.posts)} sx={{ color: '#7dd3fc' }} aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
        }
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
        success={success}
      />
    </Box>
  );
}
