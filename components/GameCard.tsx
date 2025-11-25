import React from 'react';
import { Paper, ButtonBase, Typography, Box } from '@mui/material';

interface GameCardProps {
  emoji: string;
  isBig: boolean;
  color: string;
  onClick: () => void;
  disabled: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ emoji, isBig, color, onClick, disabled }) => {
  // Size constants
  const containerSize = isBig ? { width: 280, height: 280 } : { width: 160, height: 160 };
  const fontSize = isBig ? '9rem' : '5rem';

  return (
    <Paper
      elevation={disabled ? 2 : 12}
      sx={{
        borderRadius: 8,
        bgcolor: color,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        border: '4px solid white',
        opacity: disabled ? 0.8 : 1,
        transform: disabled ? 'none' : 'scale(1)',
        '&:hover': {
          transform: disabled ? 'none' : 'scale(1.05) rotate(2deg)',
          boxShadow: 20
        },
        ...containerSize
      }}
    >
      <ButtonBase
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className={!disabled ? 'animate-pop' : ''}
      >
        <Typography
          variant="h1"
          component="span"
          sx={{
            fontSize: fontSize,
            filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.15))',
            userSelect: 'none',
            lineHeight: 1
          }}
        >
          {emoji}
        </Typography>

        {/* Glossy effect overlays */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 24,
            height: 24,
            bgcolor: 'white',
            opacity: 0.4,
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 32,
            right: 32,
            width: 12,
            height: 12,
            bgcolor: 'white',
            opacity: 0.4,
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
      </ButtonBase>
    </Paper>
  );
};

export default GameCard;