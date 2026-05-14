import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import LaptopShowcase from '../components/home/LaptopShowcase';
import ServicesSection from '../components/home/ServicesSection';
import AboutSection from '../components/home/AboutSection';
import Footer from '../components/Footer';

const heroTextVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.65, ease: 'easeOut' },
  }),
};

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    const scrollTarget = location.state?.scrollTo || location.hash?.replace('#', '');
    if (!scrollTarget) return;

    const timer = setTimeout(() => {
      document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Hero */}
      <Box
        id="home"
        component="section"
        sx={{
          position: 'relative',
          pt: { xs: 4, md: 6 },
          pb: { xs: 8, md: 10 },
          minHeight: { md: '90vh' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                component={motion.p}
                custom={0}
                variants={heroTextVariants}
                initial="hidden"
                animate="visible"
                variant="overline"
                sx={{ color: 'secondary.light', fontWeight: 700, letterSpacing: '0.22em', mb: 2 }}
              >
                NEXT-GEN BLOGGING PLATFORM
              </Typography>

              <Typography
                component={motion.h1}
                custom={1}
                variants={heroTextVariants}
                initial="hidden"
                animate="visible"
                variant="h1"
                sx={{
                  fontSize: { xs: '2.35rem', sm: '3rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  mb: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #a8b2d1 55%, #34d399 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Open your ideas on a smarter publishing desk.
              </Typography>

              <Typography
                component={motion.p}
                custom={2}
                variants={heroTextVariants}
                initial="hidden"
                animate="visible"
                variant="h6"
                color="text.secondary"
                sx={{ lineHeight: 1.75, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 520 }}
              >
                Watch the platform come alive — a laptop-first experience for authors, editors, and readers working together in one cohesive system.
              </Typography>

              <Box
                component={motion.div}
                custom={3}
                variants={heroTextVariants}
                initial="hidden"
                animate="visible"
                sx={{ display: 'flex', gap: 3, mt: 4, flexWrap: 'wrap' }}
              >
                {[
                  { value: '6', label: 'User roles' },
                  { value: '4', label: 'Post states' },
                  { value: 'API', label: 'JWT secured' },
                ].map((stat) => (
                  <Box key={stat.label}>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: 'primary.light', lineHeight: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.06em' }}>
                      {stat.label.toUpperCase()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LaptopShowcase />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <ServicesSection />
      <AboutSection />
      <Footer />
    </Box>
  );
}
