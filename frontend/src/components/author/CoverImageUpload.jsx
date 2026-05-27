import { useRef } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { mediaUrl } from '../../services/posts';

export default function CoverImageUpload({
  file,
  existingUrl,
  onFileChange,
  onClear,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : existingUrl ? mediaUrl(existingUrl) : null;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: '#e0f2fe' }}>
        Cover image
      </Typography>
      {preview ? (
        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', mb: 1 }}>
          <Box
            component="img"
            src={preview}
            alt="Cover preview"
            sx={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}
          />
          {!disabled && (
            <IconButton
              size="small"
              onClick={onClear}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              }}
              aria-label="Remove cover"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed rgba(56, 189, 248, 0.3)',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            mb: 1,
            bgcolor: 'rgba(56, 189, 248, 0.04)',
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Featured image at top of article (optional)
          </Typography>
        </Box>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
          e.target.value = '';
        }}
      />
      {!disabled && (
        <Button
          variant="outlined"
          startIcon={<ImageIcon />}
          onClick={() => inputRef.current?.click()}
          sx={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#7dd3fc' }}
        >
          {preview ? 'Change cover' : 'Upload cover'}
        </Button>
      )}
    </Box>
  );
}
