import { Typography, Container, Box } from '@mui/material';

export default function EditorDashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ p: 4, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom>Editor Dashboard</Typography>
        <Typography color="text.secondary">Review author submissions, manage content quality, and moderate category tags.</Typography>
      </Box>
    </Container>
  );
}
