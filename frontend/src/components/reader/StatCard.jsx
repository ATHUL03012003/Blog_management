import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { readerGlassSx } from './ReaderLayout';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function StatCard({ icon: Icon, label, value, suffix, index = 0, accent = '#38bdf8' }) {
  return (
    <Box
      component={motion.div}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      sx={{
        ...readerGlassSx,
        p: 2.5,
        flex: 1,
        minWidth: { xs: '100%', sm: 160 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: 'rgba(56, 189, 248, 0.12)',
            color: accent,
            display: 'flex',
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ color: '#e0f2fe' }}>
        {value}
        {suffix && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {suffix}
          </Typography>
        )}
      </Typography>
    </Box>
  );
}
