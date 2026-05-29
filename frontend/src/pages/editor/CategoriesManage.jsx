import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
} from '../../services/editorCategories';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { editorPaths } from '../../constants/editorPaths';
import parseApiError from '../../utils/parseApiError';

export default function CategoriesManage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [tagForm, setTagForm] = useState({ name: '' });
  const [editingCat, setEditingCat] = useState(null);
  const [editingTag, setEditingTag] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [cats, tgs] = await Promise.all([fetchCategories(), fetchTags()]);
      setCategories(cats);
      setTags(tgs);
    } catch {
      setMsg({ type: 'error', text: 'Could not load data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      if (editingCat) {
        await updateCategory(editingCat.slug, catForm);
        setMsg({ type: 'success', text: 'Category updated.' });
      } else {
        await createCategory(catForm);
        setMsg({ type: 'success', text: 'Category created.' });
      }
      setCatForm({ name: '', description: '' });
      setEditingCat(null);
      await load();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    }
  };

  const handleSaveTag = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      if (editingTag) {
        await updateTag(editingTag.slug, tagForm);
        setMsg({ type: 'success', text: 'Tag updated.' });
      } else {
        await createTag(tagForm);
        setMsg({ type: 'success', text: 'Tag created.' });
      }
      setTagForm({ name: '' });
      setEditingTag(null);
      await load();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    }
  };

  const handleDeleteTag = async (slug) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await deleteTag(slug);
      setMsg({ type: 'success', text: 'Tag deleted.' });
      await load();
    } catch (err) {
      setMsg({ type: 'error', text: parseApiError(err) });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(editorPaths.home)} sx={{ color: '#7dd3fc' }} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={800}>
          Categories & tags
        </Typography>
      </Box>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 2 }}>
          {msg.text}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
        <Tab label="Categories" sx={{ color: 'text.secondary' }} />
        <Tab label="Tags" sx={{ color: 'text.secondary' }} />
      </Tabs>

      {loading ? (
        <Skeleton variant="rounded" height={200} sx={{ bgcolor: 'rgba(56,189,248,0.08)' }} />
      ) : tab === 0 ? (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box component="form" onSubmit={handleSaveCategory} sx={{ ...readerGlassSx, p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
              {editingCat ? 'Edit category' : 'New category'}
            </Typography>
            <TextField
              fullWidth
              label="Name"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              margin="normal"
              multiline
              minRows={2}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button type="submit" variant="contained" startIcon={<AddIcon />}>
                {editingCat ? 'Update' : 'Create'}
              </Button>
              {editingCat && (
                <Button
                  onClick={() => {
                    setEditingCat(null);
                    setCatForm({ name: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{ ...readerGlassSx, p: 2 }}>
            <List>
              {categories.map((cat) => (
                <ListItem key={cat.id} divider sx={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                  <ListItemText
                    primary={cat.name}
                    secondary={cat.description || cat.slug}
                    slotProps={{ primary: { sx: { color: '#e0f2fe', fontWeight: 600 } } }}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingCat(cat);
                        setCatForm({ name: cat.name, description: cat.description || '' });
                      }}
                    >
                      Edit
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      ) : (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box component="form" onSubmit={handleSaveTag} sx={{ ...readerGlassSx, p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: '#e0f2fe' }}>
              {editingTag ? 'Edit tag' : 'New tag'}
            </Typography>
            <TextField
              fullWidth
              label="Name"
              value={tagForm.name}
              onChange={(e) => setTagForm({ name: e.target.value })}
              required
              margin="normal"
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button type="submit" variant="contained" startIcon={<AddIcon />}>
                {editingTag ? 'Update' : 'Create'}
              </Button>
              {editingTag && (
                <Button
                  onClick={() => {
                    setEditingTag(null);
                    setTagForm({ name: '' });
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{ ...readerGlassSx, p: 2 }}>
            <List>
              {tags.map((tag) => (
                <ListItem key={tag.id} divider sx={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                  <ListItemText
                    primary={tag.name}
                    secondary={tag.slug}
                    slotProps={{ primary: { sx: { color: '#e0f2fe' } } }}
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" sx={{ mr: 1 }} onClick={() => { setEditingTag(tag); setTagForm({ name: tag.name }); }}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDeleteTag(tag.slug)}>
                      Delete
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      )}
    </Box>
  );
}
