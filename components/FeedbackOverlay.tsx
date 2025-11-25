import React from 'react';
import { Backdrop, Typography, Box } from '@mui/material';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  show: boolean;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isCorrect, show }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)'
      }}
      open={show}
    >
      <Box
        className="animate-pop"
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'bounce 1s infinite'
        }}
      >
        {isCorrect ? (
          <Typography sx={{ fontSize: '10rem', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}>
            🌟
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '10rem', filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))', opacity: 0.9 }}>
            ❌
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};

export default FeedbackOverlay;