// ============================================
// Groundwork - AI Assist Button Component
// ============================================

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface Props {
  label?: string;
  loading: boolean;
  error: string | null;
  isAvailable: boolean;
  onGenerate: () => void;
  onClearError: () => void;
}

export function AIAssistButton({
  label = 'AI Suggest',
  loading,
  error,
  isAvailable,
  onGenerate,
  onClearError,
}: Props) {
  if (!isAvailable) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        variant="outlined"
        color="secondary"
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SmartToyIcon />}
        disabled={loading}
        onClick={onGenerate}
        sx={{ textTransform: 'none' }}
      >
        {loading ? 'Generating...' : label}
      </Button>
      <Collapse in={!!error}>
        <Alert severity="error" onClose={onClearError} sx={{ mt: 1, borderRadius: 2 }}>
          <Typography variant="caption">{error}</Typography>
        </Alert>
      </Collapse>
    </Box>
  );
}
