import React from 'react';
import { GameState, GameQuestion } from './types';
import * as QuestionService from './services/questionService';
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

const TOTAL_ROUNDS = 10;

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

interface AppState {
  gameState: GameState;
  score: number;
  round: number;
  currentQuestion: GameQuestion | null;
  feedback: { show: boolean; correct: boolean };
  isBigLeft: boolean;
  currentAudio: AudioBuffer | null;
  isAudioPlaying: boolean;
  currentPromptText: string;
}

class App extends React.Component<{}, AppState> {
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    
    this.state = {
      gameState: GameState.WELCOME,
      score: 0,
      round: 1,
      currentQuestion: null,
      feedback: { show: false, correct: false },
      isBigLeft: true,
      currentAudio: null,
      isAudioPlaying: false,
      currentPromptText: '',
    };

    // Bind methods
    this.loadNewRound = this.loadNewRound.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.replayInstruction = this.replayInstruction.bind(this);
  }

  componentWillUnmount() {
    // Clean up any pending timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  async loadNewRound() {
    this.setState({ 
      gameState: GameState.PLAYING,
      feedback: { show: false, correct: false },
      isAudioPlaying: true
    });
    
    try {
      const q = await QuestionService.generateGameQuestion();
      this.setState({
        currentQuestion: q,
        isBigLeft: Math.random() > 0.5
      });

      // 生成语音提示并保存文本
      const { audio, promptText } = await QuestionService.generateVoicePrompt(q);
      this.setState({ 
        currentAudio: audio,
        currentPromptText: promptText // 保存语音文本
      });

      await QuestionService.playAudio(audio);
      this.setState({ isAudioPlaying: false });

    } catch (err) {
      console.error("Failed to load round", err);
      this.setState({ isAudioPlaying: false });
      this.timeoutId = setTimeout(this.loadNewRound, 1000);
    }
  }

  handleStart() {
    this.setState({
      score: 0,
      round: 1
    }, this.loadNewRound);
  }

  async handleCardClick(selectionIsBig: boolean) {
    if (this.state.gameState !== GameState.PLAYING || !this.state.currentQuestion) return;

    const isTargetBig = this.state.currentQuestion.targetAttribute === 'big';
    const isCorrect = selectionIsBig === isTargetBig;

    this.setState({
      feedback: { show: true, correct: isCorrect },
      gameState: isCorrect ? GameState.SUCCESS : GameState.FAILURE,
      isAudioPlaying: true
    });

    try {
      if (isCorrect) {
        this.setState(prevState => ({ score: prevState.score + 1 }));
        const successAudio = await QuestionService.generateSuccessAudio();
        await QuestionService.playAudio(successAudio);
      } else {
        const failAudio = await QuestionService.generateFailureAudio();
        await QuestionService.playAudio(failAudio);
      }
      this.setState({ isAudioPlaying: false });
    } catch (e) { 
      console.error(e);
      this.setState({ isAudioPlaying: false });
    }

    this.timeoutId = setTimeout(() => {
      this.setState({ feedback: { show: false, correct: isCorrect } });
      
      if (this.state.round < TOTAL_ROUNDS) {
        this.setState(prevState => ({ round: prevState.round + 1 }), this.loadNewRound);
      } else {
        this.setState({ 
          gameState: GameState.GAME_OVER
        });
      }
    }, 2500);
  }

  renderPlayingScreen() {
    const { gameState, currentQuestion, isAudioPlaying } = this.state;
    
    if (!currentQuestion) return null;

    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" sx={{ mb: 6, color: '#374151' }}>
          请找出
          <Box component="span" sx={{ 
            fontSize: currentQuestion.targetAttribute === 'big' ? '1.3em' : '1em',
            color: currentQuestion.targetAttribute === 'big' ? '#9333EA' : '#3B82F6',
            mx: 1.5,
            display: 'inline-block',
          }}>
            {currentQuestion.targetAttribute === 'big' ? '大' : '小'}
          </Box> 
          的
        </Typography>

        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={{ xs: 4, md: 10 }} 
          justifyContent="center" 
          alignItems="center"
        >
          {/* 修改这里：传递正确的布尔值参数 */}
          <GameCard 
            object={currentQuestion.object1}
            onClick={() => this.handleCardClick(currentQuestion.object1.isBig)}
            disabled={gameState !== GameState.PLAYING || isAudioPlaying}
          />

          <GameCard 
            object={currentQuestion.object2}
            onClick={() => this.handleCardClick(currentQuestion.object2.isBig)}
            disabled={gameState !== GameState.PLAYING || isAudioPlaying}
          />
        </Stack>

        {isAudioPlaying && (
          <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="h6" color="textSecondary">
              播放中...
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  replayInstruction = async () => {
    if (!this.state.currentPromptText) return;
    
    this.setState({ isAudioPlaying: true });
    
    try {
      // 重新播放语音提示
      await QuestionService.speakText(this.state.currentPromptText);
    } catch (error) {
      console.error("Failed to replay instruction:", error);
    } finally {
      this.setState({ isAudioPlaying: false });
    }
  };

  renderHeader() {
    const { gameState, round, score, isAudioPlaying } = this.state;
    
    if (!(gameState === GameState.PLAYING || gameState === GameState.SUCCESS || 
          gameState === GameState.FAILURE || gameState === GameState.LOADING)) {
      return null;
    }

    return (
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
            onClick={this.replayInstruction}
            disabled={isAudioPlaying}
            sx={{ borderRadius: 4, py: 1, px: 3, display: { xs: 'none', sm: 'flex' } }}
          >
            {isAudioPlaying ? '播放中...' : '重听'}
          </Button>
          
          <Button 
            variant="contained" 
            color="info" 
            onClick={this.replayInstruction}
            disabled={isAudioPlaying}
            sx={{ borderRadius: '50%', minWidth: 48, width: 48, height: 48, display: { xs: 'flex', sm: 'none' }, p:0 }}
          >
            <VolumeUp />
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  renderWelcomeScreen() {
    return (
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
          onClick={this.handleStart}
          sx={{ fontSize: '2rem', py: 2, px: 6, borderRadius: 8 }}
        >
          开始游戏!
        </Button>
      </Stack>
    );
  }

  renderGameOverScreen() {
    const { score } = this.state;
    
    return (
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
          onClick={this.handleStart}
          sx={{ mt: 4, fontSize: '1.5rem', py: 1.5, px: 6 }}
        >
          再玩一次
        </Button>
      </Paper>
    );
  }

  renderMainContent() {
    const { gameState, currentQuestion } = this.state;

    return (
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        {gameState === GameState.WELCOME && this.renderWelcomeScreen()}
        {gameState === GameState.GAME_OVER && this.renderGameOverScreen()}
        {(gameState === GameState.PLAYING || gameState === GameState.SUCCESS || gameState === GameState.FAILURE) && 
         currentQuestion && this.renderPlayingScreen()}
      </Container>
    );
  }

  render() {
    const { feedback } = this.state;

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh', 
            width: '100%',
            background: 'linear-gradient(135deg, #FEF9C3 0%, #FFEDD5 100%)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {this.renderHeader()}
          {this.renderMainContent()}

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
  }
}

export default App;