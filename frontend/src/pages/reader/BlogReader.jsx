import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TranslateIcon from '@mui/icons-material/Translate';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPostBySlug, mediaUrl } from '../../services/posts';
import { readerGlassSx } from '../../components/reader/ReaderLayout';
import { LANGUAGES, getLanguageLabel } from '../../constants/languages';
import {
  getPreferredLanguage,
  setPreferredLanguage,
  addToReadingHistory,
} from '../../utils/readerStorage';
import { translateText } from '../../utils/translateContent';

export default function BlogReader() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState(getPreferredLanguage);
  const [displayTitle, setDisplayTitle] = useState('');
  const [displayContent, setDisplayContent] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPostBySlug(slug);
        if (!cancelled) {
          setPost(data);
          addToReadingHistory(data);
        }
      } catch {
        if (!cancelled) setError('Post not found or unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const applyTranslation = useCallback(async (sourcePost, lang) => {
    if (!sourcePost) return;
    setTranslating(true);
    setTranslateError(null);
    const originalTitle = sourcePost.title;
    const originalContent = sourcePost.content;

    if (lang === 'en') {
      setDisplayTitle(originalTitle);
      setDisplayContent(originalContent);
      setTranslating(false);
      return;
    }

    try {
      const [title, content] = await Promise.all([
        translateText(originalTitle, lang, 'en'),
        translateText(originalContent, lang, 'en'),
      ]);
      setDisplayTitle(title);
      setDisplayContent(content);
    } catch {
      setTranslateError('Translation unavailable — showing original English.');
      setDisplayTitle(originalTitle);
      setDisplayContent(originalContent);
    } finally {
      setTranslating(false);
    }
  }, []);

  useEffect(() => {
    if (post) applyTranslation(post, language);
  }, [post, language, applyTranslation]);

  const handleLanguageChange = (e) => {
    const code = e.target.value;
    setLanguage(code);
    setPreferredLanguage(code);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/reader/read')} sx={{ color: '#7dd3fc' }} aria-label="Back to list">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800}>
            Reading
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 200, ...readerGlassSx }}>
          <InputLabel id="lang-select-label">Language</InputLabel>
          <Select
            labelId="lang-select-label"
            value={language}
            label="Language"
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {translating && (
        <LinearProgress
          sx={{
            mb: 2,
            borderRadius: 1,
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1e6fd9, #38bdf8)' },
          }}
        />
      )}

      {translateError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {translateError}
        </Alert>
      )}

      {loading ? (
        <Box>
          <Skeleton variant="text" height={48} sx={{ bgcolor: 'rgba(56,189,248,0.08)' }} />
          <Skeleton variant="rounded" height={320} sx={{ bgcolor: 'rgba(56,189,248,0.08)', mt: 2 }} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <AnimatePresence mode="wait">
          <Box
            key={`${slug}-${language}-${translating ? 'loading' : 'done'}`}
            component={motion.article}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            sx={{ ...readerGlassSx, p: { xs: 2.5, md: 4 } }}
          >
            {post.image && (
              <Box
                component={motion.img}
                src={mediaUrl(post.image)}
                alt={displayTitle || post.title}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                sx={{
                  width: '100%',
                  maxHeight: 360,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 3,
                }}
              />
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {post.category_detail && (
                <Chip size="small" label={post.category_detail.name} sx={{ bgcolor: 'rgba(56, 189, 248, 0.12)', color: '#7dd3fc' }} />
              )}
              {language !== 'en' && (
                <Chip
                  size="small"
                  icon={<TranslateIcon />}
                  label={`Translated to ${getLanguageLabel(language)}`}
                  sx={{ bgcolor: 'rgba(34, 197, 94, 0.12)', color: '#86efac' }}
                />
              )}
            </Box>

            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#f0f9ff' }}>
              {displayTitle || post.title}
            </Typography>

            <Typography
              component={motion.div}
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.85,
                whiteSpace: 'pre-wrap',
                '& p': { mb: 2 },
              }}
            >
              {displayContent || post.content}
            </Typography>
          </Box>
        </AnimatePresence>
      )}
    </Box>
  );
}
