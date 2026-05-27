import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

const blobVariants = {
  animate: (i) => ({
    x: [0, i % 2 === 0 ? 20 : -16, 0],
    y: [0, i % 2 === 0 ? -14 : 18, 0],
    scale: [1, 1.06, 1],
    transition: { duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut' },
  }),
};

export const readerGlassSx = {
  borderRadius: 3,
  background: 'rgba(0, 21, 41, 0.5)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(56, 189, 248, 0.18)',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
};

const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export default function ReaderLayout() {
  const location = useLocation();

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 72px)',
        overflow: 'hidden',
        py: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 70% 45% at 15% 10%, rgba(30, 111, 217, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 55% 40% at 90% 80%, rgba(14, 165, 233, 0.12) 0%, transparent 50%),
            linear-gradient(180deg, #001529 0%, #021a33 45%, #001529 100%)
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
            width: { xs: 160, md: 240 },
            height: { xs: 160, md: 240 },
            borderRadius: '50%',
            filter: 'blur(56px)',
            opacity: 0.3,
            background:
              i === 0
                ? 'radial-gradient(circle, #1e6fd9 0%, transparent 70%)'
                : i === 1
                  ? 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)'
                  : 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
            top: i === 0 ? '5%' : i === 1 ? '60%' : '35%',
            left: i === 0 ? '8%' : i === 1 ? '75%' : '45%',
            pointerEvents: 'none',
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          key={location.pathname}
          component={motion.div}
          {...pageMotion}
        >
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
}
