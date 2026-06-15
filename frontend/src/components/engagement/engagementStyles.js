export const engagementShellSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 4,
  background: 'linear-gradient(145deg, rgba(0, 21, 41, 0.92) 0%, rgba(15, 23, 42, 0.88) 100%)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(56, 189, 248, 0.22)',
  boxShadow: '0 32px 64px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #1e6fd9, #38bdf8, #a78bfa)',
    opacity: 0.9,
  },
};

export const statPillSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  px: 2,
  py: 1,
  borderRadius: 999,
  bgcolor: 'rgba(15, 23, 42, 0.65)',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
};

export const commentCardSx = {
  p: 2,
  borderRadius: 3,
  bgcolor: 'rgba(15, 23, 42, 0.55)',
  border: '1px solid rgba(56, 189, 248, 0.12)',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    borderColor: 'rgba(56, 189, 248, 0.28)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
};

export const composerSx = {
  p: 2,
  borderRadius: 3,
  bgcolor: 'rgba(15, 23, 42, 0.45)',
  border: '1px solid rgba(56, 189, 248, 0.18)',
};

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: 'rgba(0, 21, 41, 0.55)',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
    '& fieldset': { borderColor: 'rgba(56, 189, 248, 0.18)' },
    '&:hover fieldset': { borderColor: 'rgba(56, 189, 248, 0.35)' },
    '&.Mui-focused fieldset': {
      borderColor: '#38bdf8',
      boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.15)',
    },
  },
};

export const ghostActionSx = {
  minWidth: 'auto',
  px: 1.25,
  py: 0.5,
  borderRadius: 2,
  color: 'text.secondary',
  fontSize: '0.8125rem',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    bgcolor: 'rgba(56, 189, 248, 0.08)',
    color: '#7dd3fc',
  },
};

export const primaryActionSx = {
  borderRadius: 999,
  px: 2.5,
  py: 1,
  fontWeight: 700,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #1e6fd9 0%, #2563eb 100%)',
  boxShadow: '0 8px 20px rgba(30, 111, 217, 0.35)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    boxShadow: '0 10px 24px rgba(30, 111, 217, 0.45)',
  },
  '&.Mui-disabled': {
    background: 'rgba(51, 65, 85, 0.8)',
    color: 'rgba(148, 163, 184, 0.6)',
    boxShadow: 'none',
  },
};

const AVATAR_GRADIENTS = [
  ['#1e6fd9', '#38bdf8'],
  ['#7c3aed', '#a78bfa'],
  ['#db2777', '#f472b6'],
  ['#059669', '#34d399'],
  ['#d97706', '#fbbf24'],
];

export function getAvatarGradient(username = '') {
  let hash = 0;
  for (let i = 0; i < username.length; i += 1) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(username = '') {
  const parts = username.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatRelativeTime(iso) {
  try {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return '';
  }
}
