import { Box, Container, Grid, Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import SectionHeading from './SectionHeading';

const services = [
  {
    icon: GroupsOutlinedIcon,
    title: 'Role-Based Workspaces',
    desc: 'Dedicated dashboards for Readers, Authors, Editors, Admins, and Super Admins with permissions tuned to each role.',
    accent: '#1E6FD9',
  },
  {
    icon: FactCheckOutlinedIcon,
    title: 'Editorial Review Flow',
    desc: 'Authors submit drafts for review; editors approve or reject before content goes live — a real publishing pipeline.',
    accent: '#3B82F6',
  },
  {
    icon: ArticleOutlinedIcon,
    title: 'Rich Post Management',
    desc: 'Create posts with excerpts, cover images, slugs, and lifecycle states from draft through published.',
    accent: '#10B981',
  },
  {
    icon: CategoryOutlinedIcon,
    title: 'Categories & Tags',
    desc: 'Organize articles with structured categories and flexible tags so readers can browse content your way.',
    accent: '#F59E0B',
  },
  {
    icon: SecurityOutlinedIcon,
    title: 'Secure Authentication',
    desc: 'JWT-backed sessions with email/password login and Google sign-in, including separate login vs sign-up flows.',
    accent: '#EC4899',
  },
  {
    icon: SpeedOutlinedIcon,
    title: 'Fast Modern Stack',
    desc: 'React + Vite frontend and Django REST API backend for a responsive, production-ready blogging experience.',
    accent: '#06B6D4',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function ServicesSection() {
  return (
    <Box
      id="services"
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        scrollMarginTop: { xs: 120, md: 88 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(30,111,217,0.1) 0%, transparent 55%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <SectionHeading
          eyebrow="WHAT WE OFFER"
          title="Services built for modern publishing"
          subtitle="Blog Gen is more than a blog — it is a complete content platform with workflows, access control, and tools for every stakeholder in your editorial team."
        />

        <Grid container spacing={3}>
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <Grid key={service.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  component={motion.div}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  whileHover={{ y: -6 }}
                  sx={{
                    height: '100%',
                    background: 'rgba(30, 41, 59, 0.55)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(51, 65, 85, 0.8)',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        background: `${service.accent}22`,
                        border: `1px solid ${service.accent}44`,
                      }}
                    >
                      <Icon sx={{ color: service.accent, fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                      {service.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
