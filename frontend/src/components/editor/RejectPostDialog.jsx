import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';

export default function RejectPostDialog({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
  postTitle,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const rejection_reason = form.rejection_reason.value.trim();
    const improvement_areas = form.improvement_areas.value.trim();
    onSubmit({ rejection_reason, improvement_areas });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: '#f0f9ff', fontWeight: 700 }}>
          Reject post
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            The author will see your feedback and can revise and submit again.
            {postTitle && (
              <>
                {' '}
                Post: <strong>{postTitle}</strong>
              </>
            )}
          </Alert>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            name="rejection_reason"
            fullWidth
            label="Why is this being rejected?"
            placeholder="Explain the main issues (clarity, accuracy, policy, etc.)"
            required
            multiline
            minRows={3}
            margin="normal"
            helperText="At least 10 characters — be specific so the author understands."
          />
          <TextField
            name="improvement_areas"
            fullWidth
            label="Areas to improve"
            placeholder="What should the author change or add before resubmitting?"
            required
            multiline
            minRows={3}
            margin="normal"
            helperText="Actionable suggestions help authors fix the post faster."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" color="error" variant="contained" disabled={submitting}>
            {submitting ? 'Rejecting…' : 'Reject with feedback'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
