import { Box } from '@mui/material';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { mediaUrl } from '../../services/posts';

const articleSx = {
  color: 'text.secondary',
  lineHeight: 1.85,
  fontSize: '1.05rem',
  '& h2': {
    color: '#f0f9ff',
    fontSize: '1.75rem',
    fontWeight: 700,
    mt: 4,
    mb: 2,
    lineHeight: 1.3,
  },
  '& h3': {
    color: '#e0f2fe',
    fontSize: '1.35rem',
    fontWeight: 600,
    mt: 3,
    mb: 1.5,
    lineHeight: 1.35,
  },
  '& p': {
    mb: 2,
  },
  '& strong': {
    color: '#e0f2fe',
    fontWeight: 700,
  },
  '& ul, & ol': {
    pl: 3,
    mb: 2,
  },
  '& li': {
    mb: 0.75,
  },
  '& blockquote': {
    borderLeft: '4px solid rgba(56, 189, 248, 0.5)',
    pl: 2,
    ml: 0,
    my: 2,
    fontStyle: 'italic',
    color: '#94a3b8',
  },
  '& a': {
    color: '#7dd3fc',
    textDecoration: 'underline',
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 2,
    my: 2,
    display: 'block',
  },
};

function rewriteImageSrc(html) {
  return html.replace(/src="(\/media\/[^"]+)"/g, (_, path) => `src="${mediaUrl(path)}"`);
}

export default function BlogArticleRenderer({ html, className }) {
  const safe = sanitizeHtml(rewriteImageSrc(html || ''));
  if (!safe) return null;

  return (
    <Box
      className={className}
      sx={articleSx}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
