import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { readerGlassSx } from './ReaderLayout';

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ActionCard({
  title,
  description,
  icon: Icon,
  to,
  index = 0,
  gradient = 'linear-gradient(135deg, rgba(30, 111, 217, 0.35) 0%, rgba(14, 165, 233, 0.15) 100%)',
}) {
  return (
    <Box
      component={motion.div}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        ...readerGlassSx,
        p: 3,
        flex: 1,
        minWidth: { xs: '100%', md: 280 },
        background: `${gradient}, rgba(0, 21, 41, 0.55)`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box
        component={RouterLink}
        to={to}
        sx={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Box
          component={motion.div}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(56, 189, 248, 0.15)',
            color: '#7dd3fc',
          }}
        >
          <Icon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} color="#f0f9ff">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {description}
        </Typography>
      </Box>
      <Button
        component={RouterLink}
        to={to}
        endIcon={<ArrowForwardIcon />}
        sx={{
          alignSelf: 'flex-start',
          color: '#7dd3fc',
          '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.12)' },
        }}
      >
        Open
      </Button>
    </Box>
  );
}
