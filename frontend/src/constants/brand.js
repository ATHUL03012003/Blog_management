export const BRAND_NAME = 'Blog Gen';
export const BRAND_TAGLINE = 'Professional blog writing platform';
export const LOGO_SRC = '/blog-gen-logo.png';
export const FAVICON_SRC = '/favicon.png';

export const authButtonSx = {
  fontWeight: 600,
  minWidth: { xs: '100%', sm: 100 },
  px: 2.5,
  py: 1,
  borderRadius: 2,
  textTransform: 'none',
  fontSize: '0.9rem',
  color: '#e0f2fe',
  border: '1px solid rgba(56, 189, 248, 0.45)',
  background: 'rgba(0, 21, 41, 0.35)',
  boxShadow: 'none',
  '&:hover': {
    borderColor: 'rgba(125, 211, 252, 0.7)',
    background: 'rgba(30, 111, 217, 0.2)',
    boxShadow: 'none',
  },
};

export const authLinkSx = {
  color: '#e0f2fe',
  textDecoration: 'none',
  fontWeight: 600,
  '&:hover': {
    color: '#f0f9ff',
    textDecoration: 'underline',
  },
};
