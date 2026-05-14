import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Home() {
  return (
    <Box sx={{ width: '100%', pt: 8, pb: 12 }}>
      <Container maxWidth="xl">
        {/* Hero Section */}
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{
            textAlign: 'center',
            mb: 12,
            position: 'relative',
          }}
        >
          {/* Subtle glow effect behind hero */}
          <Box 
            sx={{
                position: 'absolute',
                top: '-20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
                zIndex: -1,
                pointerEvents: 'none'
            }}
          />
          <motion.div variants={itemVariants}>
            <Typography variant="h1" gutterBottom sx={{ 
                background: 'linear-gradient(to right, #ffffff, #a8b2d1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3
             }}>
              Publish Your Ideas with Unmatched Clarity.
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 5, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
              A robust role-based blogging platform designed for creators, editors, and admins. Manage your content efficiently with an incredibly fast and aesthetic UI.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Button variant="contained" color="primary" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}>
                Start Writing
              </Button>
              <Button variant="outlined" color="inherit" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.2)' }}>
                Explore Articles
              </Button>
            </Box>
          </motion.div>
        </Box>

        {/* Feature Cards Section */}
        <Grid container spacing={4} component={motion.div} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          {[
            { title: 'Role-Based Access', desc: 'Secure environments for Readers, Authors, Editors and Admins.' },
            { title: 'Blazing Fast', desc: 'Powered by React + Vite for sub-millisecond route transitions.' },
            { title: 'Premium Aesthetics', desc: 'Sleek dark mode built on top of Material UI and Framer Motion.' }
          ].map((feature, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <motion.div variants={itemVariants} whileHover={{ translateY: -8 }} transition={{ duration: 0.2 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)' }}>
                  <CardContent>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                       <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: '#7C3AED' }} /> 
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}
