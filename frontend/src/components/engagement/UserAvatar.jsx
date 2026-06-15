import { Avatar } from '@mui/material';
import { getAvatarGradient, getInitials } from './engagementStyles';

export default function UserAvatar({ username, size = 40 }) {
  const [from, to] = getAvatarGradient(username);
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        fontWeight: 800,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        border: '2px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        flexShrink: 0,
      }}
    >
      {getInitials(username)}
    </Avatar>
  );
}
