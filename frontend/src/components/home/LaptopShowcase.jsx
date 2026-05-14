import { Box, Typography, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';

const screenContentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 1.1, duration: 0.5, staggerChildren: 0.08 },
  },
};

const lineVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export default function LaptopShowcase() {
  return (
    <Box
      sx={{
        perspective: '1400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        minHeight: { xs: 320, md: 420 },
        py: { xs: 2, md: 0 },
      }}
    >
      <Box sx={{ position: 'relative', width: { xs: '100%', sm: 480, md: 560 }, maxWidth: '100%' }}>
        {/* Glow */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          sx={{
            position: 'absolute',
            inset: '10% 5% 25%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
            filter: 'blur(28px)',
            zIndex: 0,
          }}
        />

        {/* Lid / Screen */}
        <Box
          component={motion.div}
          initial={{ rotateX: -82, opacity: 0.6 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          sx={{
            transformOrigin: 'bottom center',
            transformStyle: 'preserve-3d',
            position: 'relative',
            zIndex: 2,
            mb: '-2px',
          }}
        >
          <Box
            sx={{
              borderRadius: '14px 14px 4px 4px',
              border: '2px solid #475569',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              p: '10px 10px 8px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            }}
          >
            {/* Camera dot */}
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#334155', mx: 'auto', mb: 1 }} />

            {/* Screen bezel */}
            <Box
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #334155',
                background: 'linear-gradient(135deg, #0b1220 0%, #111827 100%)',
                minHeight: { xs: 200, md: 260 },
                p: 2,
              }}
            >
              <Box
                component={motion.div}
                variants={screenContentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Mock app header */}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#a78bfa' }}>NEXUSBLog</Typography>
                  <Stack direction="row" spacing={0.5}>
                    {['Reader', 'Author', 'Editor'].map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 9,
                          bgcolor: 'rgba(124,58,237,0.15)',
                          color: '#c4b5fd',
                          border: '1px solid rgba(124,58,237,0.25)',
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>

                {/* Mock dashboard cards */}
                <GridMock />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Base / Keyboard */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          sx={{
            position: 'relative',
            zIndex: 1,
            height: { xs: 18, md: 22 },
            borderRadius: '0 0 18px 18px',
            background: 'linear-gradient(180deg, #334155 0%, #1e293b 55%, #0f172a 100%)',
            border: '2px solid #475569',
            borderTop: 'none',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '18%',
              height: 3,
              borderRadius: 2,
              bgcolor: '#64748b',
            },
          }}
        />

        {/* Trackpad hint */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.3 }}
          sx={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '22%',
            height: 4,
            borderRadius: 1,
            bgcolor: '#475569',
            zIndex: 3,
          }}
        />
      </Box>
    </Box>
  );
}

function GridMock() {
  const posts = [
    { title: 'Draft: Product Roadmap', status: 'Draft', color: '#f59e0b' },
    { title: 'Review: API Design', status: 'Review', color: '#3b82f6' },
    { title: 'Live: Launch Notes', status: 'Published', color: '#10b981' },
  ];

  return (
    <Stack spacing={1}>
      {posts.map((post, i) => (
        <Box
          key={post.title}
          component={motion.div}
          variants={lineVariants}
          whileHover={{ scale: 1.02, x: 4 }}
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            border: '1px solid rgba(51,65,85,0.8)',
            background: 'rgba(30,41,59,0.65)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 10, color: '#e2e8f0', fontWeight: 600 }}>{post.title}</Typography>
          <Typography sx={{ fontSize: 9, color: post.color, fontWeight: 700 }}>{post.status}</Typography>
        </Box>
      ))}
      <Box
        component={motion.div}
        variants={lineVariants}
        sx={{
          mt: 0.5,
          p: 1,
          borderRadius: 1.5,
          border: '1px dashed rgba(124,58,237,0.4)',
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: 9, color: '#94a3b8' }}>Editorial queue · Categories · Tags</Typography>
      </Box>
    </Stack>
  );
}
