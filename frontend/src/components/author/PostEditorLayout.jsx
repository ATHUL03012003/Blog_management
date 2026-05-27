import { useMemo } from 'react';
import { Box, Typography, Button, Alert, Grid } from '@mui/material';
import { mediaUrl } from '../../services/posts';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { readerGlassSx } from '../reader/ReaderLayout';
import PostMetaFields from './PostMetaFields';
import CoverImageUpload from './CoverImageUpload';
import RichTextEditor from './RichTextEditor';
import BlogArticleRenderer from './BlogArticleRenderer';
import PostStatusChip from './PostStatusChip';

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  category: null,
  tags: [],
  coverFile: null,
  coverUrl: null,
};

export { EMPTY_FORM };

export default function PostEditorLayout({
  pageTitle,
  backButton,
  values,
  onChange,
  onSubmit,
  saving,
  error,
  success,
  disabled = false,
  status,
  extraActions,
  submitLabel = 'Save draft',
}) {
  const plainContent = values.content?.replace(/<[^>]+>/g, '').trim();
  const coverPreview = useMemo(() => {
    if (values.coverFile) return URL.createObjectURL(values.coverFile);
    if (values.coverUrl) return mediaUrl(values.coverUrl);
    return null;
  }, [values.coverFile, values.coverUrl]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {backButton}
          <Typography variant="h5" fontWeight={800}>
            {pageTitle}
          </Typography>
          {status != null && <PostStatusChip status={status} />}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box component="form" onSubmit={onSubmit} sx={{ ...readerGlassSx, p: { xs: 2.5, md: 3 }, mb: 3 }}>
            <PostMetaFields values={values} onChange={onChange} disabled={disabled} />
            <Box sx={{ my: 3 }}>
              <CoverImageUpload
                file={values.coverFile}
                existingUrl={values.coverUrl}
                onFileChange={(f) => onChange({ ...values, coverFile: f })}
                onClear={() => onChange({ ...values, coverFile: null, coverUrl: null })}
                disabled={disabled}
              />
            </Box>
            <RichTextEditor
              value={values.content}
              onChange={(html) => onChange({ ...values, content: html })}
              disabled={disabled}
            />
            <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving || disabled}
              >
                {saving ? 'Saving…' : submitLabel}
              </Button>
              {extraActions}
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ ...readerGlassSx, p: 3, position: { lg: 'sticky' }, top: 88 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VisibilityIcon sx={{ color: '#7dd3fc', fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#e0f2fe' }}>
                Live preview
              </Typography>
            </Box>
            {coverPreview && (
              <Box
                component="img"
                src={coverPreview}
                alt=""
                sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2, mb: 2 }}
              />
            )}
            <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff' }}>
              {values.title || 'Untitled post'}
            </Typography>
            {values.excerpt && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                {values.excerpt}
              </Typography>
            )}
            {plainContent ? (
              <BlogArticleRenderer html={values.content} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Start writing to see preview…
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
