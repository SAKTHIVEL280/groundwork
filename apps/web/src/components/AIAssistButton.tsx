// ============================================
// Groundwork - AI Assist Button Component
// ============================================

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface Props {
  label?: string;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  onClearError: () => void;
}

export function AIAssistButton({
  label = 'AI Suggest',
  loading,
  error,
  onGenerate,
  onClearError,
}: Props) {
  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon />}
        disabled={loading}
        onClick={onGenerate}
      >
        {loading ? 'Generating...' : label}
      </Button>
      <Collapse in={!!error}>
        <Alert severity="error" onClose={onClearError} sx={{ mt: 1, borderRadius: 2 }}>
          {error}
        </Alert>
      </Collapse>
    </Box>
  );
}
