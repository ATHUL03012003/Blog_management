import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';

const blobVariants = {
  animate: (i) => ({
    x: [0, i % 2 === 0 ? 24 : -20, 0],
    y: [0, i % 2 === 0 ? -18 : 22, 0],
    scale: [1, 1.08, 1],
    transition: { duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' },
  }),
};

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export const glassCardSx = {
  p: { xs: 2, sm: 3 },
  borderRadius: 3,
  background: 'rgba(0, 21, 41, 0.45)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(56, 189, 248, 0.18)',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
};

export default function AuthPageLayout({ children }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 72px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(30, 111, 217, 0.2) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 85% 75%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
            linear-gradient(180deg, #001529 0%, #021a33 50%, #001529 100%)
          `,
          pointerEvents: 'none',
        }}
      />

      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          component={motion.div}
          custom={i}
          variants={blobVariants}
          animate="animate"
          sx={{
            position: 'absolute',
            width: { xs: 180, md: 280 },
            height: { xs: 180, md: 280 },
            borderRadius: '50%',
            filter: 'blur(60px)',
            opacity: 0.35,
            background:
              i === 0
                ? 'radial-gradient(circle, #1e6fd9 0%, transparent 70%)'
                : i === 1
                  ? 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)'
                  : 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
            top: i === 0 ? '8%' : i === 1 ? '55%' : '30%',
            left: i === 0 ? '5%' : i === 1 ? '70%' : '40%',
            pointerEvents: 'none',
          }}
        />
      ))}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box component={motion.div} variants={pageVariants} initial="hidden" animate="visible" sx={{ width: '100%' }}>
          <Box component={motion.div} variants={itemVariants}>
            {children}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
