import { useEffect, useRef } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Divider, IconButton, Tooltip } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import { uploadContentImage } from '../../services/authorPosts';
import { mediaUrl } from '../../services/posts';
import parseApiError from '../../utils/parseApiError';

const editorSx = {
  '& .ProseMirror': {
    minHeight: 320,
    outline: 'none',
    color: '#e0f2fe',
    fontSize: '1.05rem',
    lineHeight: 1.75,
    '& h2': { fontSize: '1.5rem', fontWeight: 700, mt: 2, mb: 1, color: '#f0f9ff' },
    '& h3': { fontSize: '1.2rem', fontWeight: 600, mt: 1.5, mb: 0.75, color: '#e0f2fe' },
    '& p': { mb: 1.25 },
    '& ul, & ol': { pl: 2.5, mb: 1.25 },
    '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
    '& a': { color: '#7dd3fc' },
    '& p.is-editor-empty:first-of-type::before': {
      color: '#64748b',
      content: 'attr(data-placeholder)',
      float: 'left',
      height: 0,
      pointerEvents: 'none',
    },
  },
};

export default function RichTextEditor({ value, onChange, disabled = false, label = 'Article body' }) {
  const fileRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: 'Write your story — use headings for sections, bold for emphasis, and images throughout…' }),
    ],
    immediatelyRender: false,
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || value === undefined) return;
    const current = editor.getHTML();
    if (value !== current && value !== editor.getText()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertImage = async (file) => {
    if (!editor || !file) return;
    try {
      const { url } = await uploadContentImage(file);
      // API returns full Cloudinary HTTPS URL; stored in post HTML, not on disk
      editor.chain().focus().setImage({ src: mediaUrl(url), alt: file.name }).run();
    } catch (err) {
      window.alert(parseApiError(err));
    }
  };

  if (!editor) return null;

  return (
    <Box>
      <Box sx={{ mb: 1, typography: 'subtitle2', fontWeight: 600, color: '#e0f2fe' }}>
        {label}
      </Box>
      {!disabled && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            alignItems: 'center',
            p: 1,
            mb: 1,
            borderRadius: 2,
            bgcolor: 'rgba(0, 21, 41, 0.5)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
          }}
        >
          <ToggleButtonGroup size="small" exclusive>
            <ToggleButton
              value="h2"
              selected={editor.isActive('heading', { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              sx={{ color: '#94a3b8' }}
            >
              H2
            </ToggleButton>
            <ToggleButton
              value="h3"
              selected={editor.isActive('heading', { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              sx={{ color: '#94a3b8' }}
            >
              H3
            </ToggleButton>
          </ToggleButtonGroup>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: 'rgba(56,189,248,0.2)' }} />
          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBold().run()}
              color={editor.isActive('bold') ? 'primary' : 'default'}
              sx={{ color: editor.isActive('bold') ? '#7dd3fc' : '#94a3b8' }}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              sx={{ color: editor.isActive('italic') ? '#7dd3fc' : '#94a3b8' }}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              sx={{ color: editor.isActive('underline') ? '#7dd3fc' : '#94a3b8' }}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bullet list">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              sx={{ color: editor.isActive('bulletList') ? '#7dd3fc' : '#94a3b8' }}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Link">
            <IconButton size="small" onClick={setLink} sx={{ color: editor.isActive('link') ? '#7dd3fc' : '#94a3b8' }}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert image">
            <IconButton size="small" onClick={() => fileRef.current?.click()} sx={{ color: '#94a3b8' }}>
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) insertImage(f);
              e.target.value = '';
            }}
          />
        </Box>
      )}
      <Box
        sx={{
          ...editorSx,
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(56, 189, 248, 0.2)',
          bgcolor: 'rgba(0, 21, 41, 0.35)',
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
