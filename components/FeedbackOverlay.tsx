import React, { useEffect, useState } from 'react';
import { Backdrop, Typography, Box } from '@mui/material';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  show: boolean;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isCorrect, show }) => {
  const [internalShow, setInternalShow] = useState(show);
  const [internalCorrect, setInternalCorrect] = useState(isCorrect);

  useEffect(() => {
    if (show) {
      // 当需要显示时，立即更新状态
      setInternalShow(true);
      setInternalCorrect(isCorrect);
    } else {
      // 当需要隐藏时，延迟更新以完成动画
      const timer = setTimeout(() => {
        setInternalShow(false);
      }, 300); // 与动画时间匹配
      return () => clearTimeout(timer);
    }
  }, [show, isCorrect]);

  if (!internalShow) return null;

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.3s ease-in-out',
        opacity: show ? 1 : 0
      }}
      open={show}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: internalCorrect ? 'bounce 1s infinite' : 'shake 0.5s ease-in-out'
        }}
      >
        {internalCorrect ? (
          <Typography sx={{ 
            fontSize: '10rem', 
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))'
          }}>
            ✅
          </Typography>
        ) : (
          <Typography sx={{ 
            fontSize: '10rem', 
            filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
          }}>
            ❌
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};

export default FeedbackOverlay;