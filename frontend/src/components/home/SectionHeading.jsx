import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      sx={{ textAlign: align, mb: { xs: 5, md: 7 } }}
    >
      {eyebrow && (
        <Typography
          variant="overline"
          sx={{
            letterSpacing: '0.2em',
            color: 'secondary.light',
            fontWeight: 700,
            display: 'block',
            mb: 1,
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography
        variant="h2"
        sx={{
          fontSize: { xs: '2rem', md: '2.75rem' },
          fontWeight: 800,
          background: 'linear-gradient(90deg, #f0f9ff, #38bdf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 720, mx: align === 'center' ? 'auto' : 0, lineHeight: 1.7, fontSize: { xs: '1rem', md: '1.125rem' } }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
