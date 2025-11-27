import React from 'react';
import { Paper, ButtonBase, Typography, Box } from '@mui/material';

interface GameCardProps {
  object: {
    name: string;
    emoji: string;
    colorHex: string;
    isBig: boolean; // 这个物品是大还是小
  };
  onClick: () => void;
  disabled: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ object, onClick, disabled }) => {
  // 卡片尺寸相同
  const containerSize = { width: 200, height: 200 };
  
  // 根据物品大小设置不同的字体大小
  const fontSize = object.isBig ? '7rem' : '4rem';
  const nameFontSize = object.isBig ? '1.5rem' : '1rem';

  return (
    <Paper
      elevation={disabled ? 2 : 12}
      sx={{
        borderRadius: 8,
        bgcolor: object.colorHex,
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        border: '4px solid white',
        opacity: disabled ? 0.8 : 1,
        '&:hover': {
          transform: disabled ? 'none' : 'scale(1.05)',
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
          flexDirection: 'column',
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
            lineHeight: 1,
            transition: 'all 0.3s ease-in-out',
            // 添加缩放效果，使大小差异更明显
            transform: object.isBig ? 'scale(1.3)' : 'scale(0.8)'
          }}
        >
          {object.emoji}
        </Typography>
        
        <Typography
          variant="h6"
          component="div"
          sx={{
            mt: 1,
            fontSize: nameFontSize,
            color: 'rgba(0,0,0,0.7)',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {object.name}
        </Typography>

        {/* 光泽效果覆盖层 */}
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