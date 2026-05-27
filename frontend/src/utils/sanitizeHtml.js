import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'h2', 'h3', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li',
  'a', 'img', 'blockquote', 'br',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'];

export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

export function isHtmlContent(text) {
  if (!text) return false;
  return /<[a-z][\s\S]*>/i.test(text);
}
