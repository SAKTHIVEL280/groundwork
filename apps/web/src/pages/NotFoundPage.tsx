// ============================================
// Groundwork - 404 Not Found Page
// ============================================

import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
      <Typography variant="h3" fontWeight={700}>
        404
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        This page doesn't exist. Maybe it was moved or deleted.
      </Typography>
      <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
        Back to Home
      </Button>
    </Box>
  );
}
