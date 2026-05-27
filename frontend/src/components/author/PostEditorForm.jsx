import { TextField, Box } from '@mui/material';

export default function PostEditorForm({ values, onChange, disabled = false }) {
  const handle = (field) => (e) => onChange({ ...values, [field]: e.target.value });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <TextField
        fullWidth
        label="Title"
        value={values.title}
        onChange={handle('title')}
        required
        disabled={disabled}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Excerpt"
        value={values.excerpt}
        onChange={handle('excerpt')}
        disabled={disabled}
        margin="normal"
        multiline
        minRows={2}
        placeholder="Short summary shown in listings (optional)"
      />
      <TextField
        fullWidth
        label="Content"
        value={values.content}
        onChange={handle('content')}
        required
        disabled={disabled}
        margin="normal"
        multiline
        minRows={12}
        placeholder="Write your article here…"
      />
    </Box>
  );
}
