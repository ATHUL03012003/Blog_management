import { useEffect, useState } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { fetchCategories } from '../../services/categories';

export default function PostMetaFields({ values, onChange, disabled = false }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!cancelled) setCategories(data);
      } catch {
        /* optional */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TextField
        fullWidth
        label="Title"
        value={values.title}
        onChange={(e) => onChange({ ...values, title: e.target.value })}
        required
        disabled={disabled}
        sx={{
          '& .MuiInputBase-input': { fontSize: '1.35rem', fontWeight: 700 },
        }}
      />
      <TextField
        fullWidth
        label="Excerpt"
        value={values.excerpt}
        onChange={(e) => onChange({ ...values, excerpt: e.target.value })}
        disabled={disabled}
        multiline
        minRows={2}
        placeholder="Short summary for listings and social previews"
      />
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="post-category-label">Category</InputLabel>
        <Select
          labelId="post-category-label"
          value={values.category ?? ''}
          label="Category"
          onChange={(e) =>
            onChange({
              ...values,
              category: e.target.value === '' ? null : Number(e.target.value),
            })
          }
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
