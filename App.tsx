import React, { useState, useCallback } from 'react';
import { GameState, GameQuestion } from './types';
import * as GeminiService from './services/geminiService';
import GameCard from './components/GameCard';
import FeedbackOverlay from './components/FeedbackOverlay';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Typography, 
  Button, 
  Container, 
  AppBar, 
  Toolbar,
  Chip,
  Stack,
  CircularProgress,
  Paper
} from '@mui/material';
import { VolumeUp, Refresh, PlayArrow, Star, EmojiEvents, SportsEsports } from '@mui/icons-material';

const TOTAL_ROUNDS = 5;

// Create a playful custom theme
const theme = createTheme({
  typography: {
    fontFamily: '"Fredoka", "Roboto", "Helvetica", "Arial", sans-serif',
    allVariants: {
      color: '#4B5563', // Gray-700
    }
  },
  palette: {
    primary: {
      main: '#FF9800', // Orange
      contrastText: '#fff',
    },
    secondary: {
      main: '#4FC3F7', // Light Blue
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#FEF9C3',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: '0 8px 0 rgba(0,0,0,0.1)',
          '&:active': {
            boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
            transform: 'translateY(4px)',
          }
        }
      }
    }
  }
});

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.WELCOME);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean }>({ show: false, correct: false });
  
  // Randomize placement: true = Big on Left, false = Big on Right
  const [isBigLeft, setIsBigLeft] = useState(true);

  // Audio prompt storage
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const loadNewRound = useCallback(async () => {
    setGameState(GameState.LOADING);
    setFeedback({ show: false, correct: false });
    
    try {
      const q = await GeminiService.generateGameQuestion();
      setCurrentQuestion(q);
      setIsBigLeft(Math.random() > 0.5);

      const audio = await GeminiService.generateVoicePrompt(q);
      setCurrentAudio(audio);

      setGameState(GameState.PLAYING);
      await GeminiService.playAudio(audio);

    } catch (err) {
      console.error("Failed to load round", err);
      setTimeout(loadNewRound, 1000);
    }
  }, []);

  const handleStart = () => {
    setScore(0);
    setRound(1);
    loadNewRound();
  };

  const handleCardClick = async (selectionIsBig: boolean) => {
    if (gameState !== GameState.PLAYING || !currentQuestion) return;

    const isTargetBig = currentQuestion.targetAttribute === 'big';
    const isCorrect = selectionIsBig === isTargetBig;

    setFeedback({ show: true, correct: isCorrect });
    setGameState(isCorrect ? GameState.SUCCESS : GameState.FAILURE);

    if (isCorrect) {
        setScore(prev => prev + 1);
        try {
            const successAudio = await GeminiService.generateSuccessAudio();
            await GeminiService.playAudio(successAudio);
        } catch (e) { console.error(e); }
    } else {
        try {
            const failAudio = await GeminiService.generateFailureAudio();
            await GeminiService.playAudio(failAudio);
        } catch (e) { console.error(e); }
    }

    setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
            setRound(prev => prev + 1);
            loadNewRound();
        } else {
            setGameState(GameState.GAME_OVER);
            setFeedback({ show: false, correct: false });
        }
    }, 2500);
  };

  const replayInstruction = () => {
    if (currentAudio) {
      GeminiService.playAudio(currentAudio);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          width: '100%',
          background: 'linear-gradient(135deg, #FEF9C3 0%, #FFEDD5 100%)', // Yellow-100 to Orange-100
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header / Score */}
        {(gameState === GameState.PLAYING || gameState === GameState.SUCCESS || gameState === GameState.FAILURE || gameState === GameState.LOADING) && (
          <AppBar position="static" color="transparent" elevation={0} sx={{ pt: 2, px: 2, zIndex: 10 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Chip 
                icon={<SportsEsports sx={{ color: 'white !important' }} />} 
                label={`第 ${round} / ${TOTAL_ROUNDS} 题`} 
                color="primary" 
                sx={{ fontSize: '1.1rem', py: 2.5, px: 1, boxShadow: 3 }}
              />
              
              <Chip 
                icon={<Star sx={{ color: 'yellow !important' }} />} 
                label={`得分: ${score}`} 
                color="secondary" 
                sx={{ fontSize: '1.1rem', py: 2.5, px: 1, boxShadow: 3 }}
              />

              <Button 
                variant="contained" 
                color="info" 
                startIcon={<VolumeUp />} 
                onClick={replayInstruction}
                sx={{ borderRadius: 4, py: 1, px: 3, display: { xs: 'none', sm: 'flex' } }}
              >
                重听
              </Button>
               {/* Mobile Icon Button */}
              <Button 
                variant="contained" 
                color="info" 
                onClick={replayInstruction}
                sx={{ borderRadius: '50%', minWidth: 48, width: 48, height: 48, display: { xs: 'flex', sm: 'none' }, p:0 }}
              >
                <VolumeUp />
              </Button>
            </Toolbar>
          </AppBar>
        )}

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          
          {/* WELCOME SCREEN */}
          {gameState === GameState.WELCOME && (
            <Stack spacing={4} alignItems="center" className="animate-pop">
              <Typography variant="h2" component="h1" fontWeight={900} sx={{ color: '#F97316', textAlign: 'center', textShadow: '2px 2px 0px white' }}>
                大小 <Box component="span" sx={{ color: '#3B82F6' }}>大挑战</Box>
              </Typography>
              
              <Typography variant="h5" sx={{ color: '#4B5563', fontWeight: 600 }}>
                学习 "大" 和 "小" 的概念
              </Typography>

              <Stack direction="row" spacing={4} sx={{ fontSize: '4rem', my: 2 }}>
                <Box component="span" sx={{ animation: 'bounce 1s infinite' }}>🐳</Box>
                <Box component="span" sx={{ animation: 'bounce 1s infinite', animationDelay: '0.2s' }}>🦐</Box>
              </Stack>

              <Button 
                variant="contained" 
                color="success" 
                size="large"
                startIcon={<PlayArrow sx={{ fontSize: 40 }} />}
                onClick={handleStart}
                sx={{ fontSize: '2rem', py: 2, px: 6, borderRadius: 8 }}
              >
                开始游戏!
              </Button>
            </Stack>
          )}

          {/* LOADING SCREEN */}
          {gameState === GameState.LOADING && (
             <Stack alignItems="center" spacing={2}>
               <CircularProgress size={80} thickness={5} sx={{ color: '#F97316' }} />
               <Typography variant="h4" color="textSecondary" fontWeight="bold">
                 准备下一题...
               </Typography>
             </Stack>
          )}

          {/* GAME OVER SCREEN */}
          {gameState === GameState.GAME_OVER && (
            <Paper 
              elevation={6}
              sx={{ 
                p: 6, 
                borderRadius: 8, 
                textAlign: 'center', 
                background: 'rgba(255,255,255,0.8)', 
                backdropFilter: 'blur(10px)',
                maxWidth: 600,
                width: '100%'
              }}
              className="animate-pop"
            >
               <Typography variant="h3" fontWeight={800} gutterBottom>游戏结束!</Typography>
               
               <Typography sx={{ fontSize: '6rem', my: 2 }}>
                  {score === TOTAL_ROUNDS ? '🏆' : score >= TOTAL_ROUNDS / 2 ? '⭐' : '💪'}
               </Typography>

               <Typography variant="h4" fontWeight="bold" gutterBottom>
                  你的得分: <Box component="span" sx={{ color: 'green', fontSize: '1.2em' }}>{score}</Box> / {TOTAL_ROUNDS}
               </Typography>

               <Typography variant="h6" color="textSecondary" paragraph>
                  {score === TOTAL_ROUNDS ? '哇！你是大小专家！' : '做得很棒，继续加油！'}
               </Typography>

               <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<Refresh />}
                onClick={handleStart}
                sx={{ mt: 4, fontSize: '1.5rem', py: 1.5, px: 6 }}
              >
                再玩一次
              </Button>
            </Paper>
          )}

          {/* PLAYING SCREEN */}
          {(gameState === GameState.PLAYING || gameState === GameState.SUCCESS || gameState === GameState.FAILURE) && currentQuestion && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 6, color: '#374151' }}>
                 请找出
                 <Box component="span" sx={{ 
                   fontSize: currentQuestion.targetAttribute === 'big' ? '1.3em' : '1em',
                   color: currentQuestion.targetAttribute === 'big' ? '#9333EA' : '#3B82F6',
                   mx: 1.5,
                   display: 'inline-block',
                   transform: currentQuestion.targetAttribute === 'big' ? 'scale(1.1)' : 'scale(0.9)'
                 }}>
                    {currentQuestion.targetAttribute === 'big' ? '大' : '小'}
                 </Box> 
                 的 {currentQuestion.objectName}
              </Typography>

              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={{ xs: 4, md: 10 }} 
                justifyContent="center" 
                alignItems="center"
              >
                  {/* Cards */}
                  <GameCard 
                      emoji={currentQuestion.emoji}
                      isBig={isBigLeft}
                      color={currentQuestion.colorHex}
                      onClick={() => handleCardClick(isBigLeft)}
                      disabled={gameState !== GameState.PLAYING}
                  />

                  <GameCard 
                      emoji={currentQuestion.emoji}
                      isBig={!isBigLeft}
                      color={currentQuestion.colorHex}
                      onClick={() => handleCardClick(!isBigLeft)}
                      disabled={gameState !== GameState.PLAYING}
                  />
              </Stack>
            </Box>
          )}

        </Container>

        <FeedbackOverlay show={feedback.show} isCorrect={feedback.correct} />

        {/* Footer Decoration */}
        <Box sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          height: 60, 
          bgcolor: '#4CAF50', 
          opacity: 0.2, 
          borderTopLeftRadius: '50%', 
          borderTopRightRadius: '50%', 
          pointerEvents: 'none',
          zIndex: 0 
        }} />

      </Box>
    </ThemeProvider>
  );
};

export default App;