import { Box, Container, Grid, Typography, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const highlights = [
  'Multi-role blogging ecosystem',
  'End-to-end content lifecycle',
  'Editorial quality control',
  'Scalable REST API architecture',
];

export default function AboutSection() {
  return (
    <Box
      id="about"
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        borderTop: '1px solid rgba(51, 65, 85, 0.6)',
        background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(30,41,59,0.35) 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionHeading
              align="left"
              eyebrow="ABOUT US"
              title="Crafted for creators who care about quality"
              subtitle="NEXUSBLog was built to bridge the gap between a simple blog and a professional publishing system. We believe great ideas deserve structured workflows, not scattered drafts."
            />

            <Stack spacing={2.5} component={motion.div} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>
                Our platform empowers authors to write freely while giving editors the tools to review, refine, and publish with confidence. Readers get a clean, fast experience — and administrators stay in control of users, categories, and content policies.
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.85, fontSize: '1.05rem' }}>
                From Google sign-up to role-based dashboards, every layer is designed to feel cohesive: a dark, polished interface on the outside and a robust Django + React architecture underneath.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 1 }}>
                {highlights.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{
                      bgcolor: 'rgba(124,58,237,0.12)',
                      color: '#c4b5fd',
                      border: '1px solid rgba(124,58,237,0.25)',
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              sx={{
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                border: '1px solid rgba(51, 65, 85, 0.9)',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: 'primary.light' }}>
                Our mission
              </Typography>
              {[
                { label: 'Vision', text: 'Make professional-grade publishing accessible to teams of any size.' },
                { label: 'Approach', text: 'Combine beautiful UX with strict role permissions and editorial discipline.' },
                { label: 'Promise', text: 'Ship features that respect both the writer\'s flow and the editor\'s standards.' },
              ].map((block, idx) => (
                <Box
                  key={block.label}
                  component={motion.div}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 * idx }}
                  sx={{
                    mb: idx < 2 ? 3 : 0,
                    pb: idx < 2 ? 3 : 0,
                    borderBottom: idx < 2 ? '1px solid rgba(51,65,85,0.7)' : 'none',
                  }}
                >
                  <Typography variant="overline" sx={{ color: 'secondary.light', fontWeight: 700, letterSpacing: '0.15em' }}>
                    {block.label}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.75 }}>
                    {block.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
