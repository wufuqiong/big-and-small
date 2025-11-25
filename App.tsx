import React, { useState, useCallback } from 'react';
import { GameState, GameQuestion } from './types';
import * as GeminiService from './services/geminiService';
import GameCard from './components/GameCard';
import FeedbackOverlay from './components/FeedbackOverlay';

const TOTAL_ROUNDS = 5;

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
      // 1. Generate Question Logic
      const q = await GeminiService.generateGameQuestion();
      setCurrentQuestion(q);
      setIsBigLeft(Math.random() > 0.5);

      // 2. Generate Audio
      const audio = await GeminiService.generateVoicePrompt(q);
      setCurrentAudio(audio);

      // 3. Start Game
      setGameState(GameState.PLAYING);

      // 4. Play Audio automatically
      await GeminiService.playAudio(audio);

    } catch (err) {
      console.error("Failed to load round", err);
      // Fallback: If error, just retry loading
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

    // Show feedback immediately
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

    // Wait then decide: Next Round OR Game Over
    setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
            setRound(prev => prev + 1);
            loadNewRound();
        } else {
            setGameState(GameState.GAME_OVER);
            setFeedback({ show: false, correct: false });
        }
    }, 2500); // 2.5s delay to hear the feedback audio
  };

  const replayInstruction = () => {
    if (currentAudio) {
      GeminiService.playAudio(currentAudio);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-yellow-100 to-orange-100 p-4 font-sans">
      
      {/* Header / Score - Only show during gameplay */}
      {(gameState === GameState.PLAYING || gameState === GameState.SUCCESS || gameState === GameState.FAILURE || gameState === GameState.LOADING) && (
        <div className="absolute top-6 left-0 right-0 flex justify-between px-8 z-20">
            <div className="bg-white px-6 py-2 rounded-full shadow-lg text-xl font-bold text-orange-500">
                第 {round} / {TOTAL_ROUNDS} 题
            </div>
            <div className="bg-white px-6 py-2 rounded-full shadow-lg text-xl font-bold text-blue-500">
                得分: {score}
            </div>
            <button 
                onClick={replayInstruction}
                className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg transition-colors flex items-center gap-2"
            >
                🔊 重听
            </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex flex-col items-center justify-center flex-grow z-10">
        
        {/* WELCOME SCREEN */}
        {gameState === GameState.WELCOME && (
          <div className="text-center space-y-8 animate-pop">
            <h1 className="text-6xl md:text-8xl font-black text-orange-500 tracking-tight drop-shadow-sm">
              大小 <span className="text-blue-500">大挑战</span>
            </h1>
            <p className="text-2xl text-gray-600 font-semibold">
              学习 "大" 和 "小" 的概念
            </p>
            <div className="flex justify-center gap-4 text-6xl my-8">
               <span className="animate-bounce" style={{ animationDelay: '0s' }}>🐳</span>
               <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🦐</span>
            </div>
            <button 
              onClick={handleStart}
              className="bg-green-500 hover:bg-green-600 text-white text-3xl font-bold py-6 px-16 rounded-full shadow-[0_8px_0_rgb(21,128,61)] active:shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 transition-all"
            >
              开始游戏!
            </button>
          </div>
        )}

        {/* LOADING SCREEN */}
        {gameState === GameState.LOADING && (
           <div className="flex flex-col items-center animate-pulse">
             <div className="text-6xl mb-4">🎈</div>
             <p className="text-2xl text-gray-500 font-semibold">准备下一题...</p>
           </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === GameState.GAME_OVER && (
          <div className="text-center space-y-8 animate-pop bg-white/60 backdrop-blur-md p-12 rounded-3xl shadow-2xl">
             <h2 className="text-5xl font-bold text-gray-800">游戏结束!</h2>
             
             <div className="text-8xl my-6">
                {score === TOTAL_ROUNDS ? '🏆' : score >= TOTAL_ROUNDS / 2 ? '⭐' : '💪'}
             </div>

             <div className="text-3xl font-bold text-gray-700">
                你的得分: <span className="text-green-600 text-5xl">{score}</span> / {TOTAL_ROUNDS}
             </div>

             <p className="text-xl text-gray-500">
                {score === TOTAL_ROUNDS ? '哇！你是大小专家！' : '做得很棒，继续加油！'}
             </p>

             <button 
              onClick={handleStart}
              className="mt-8 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-[0_6px_0_rgb(37,99,235)] active:shadow-[0_3px_0_rgb(37,99,235)] active:translate-y-1 transition-all"
            >
              再玩一次
            </button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {(gameState === GameState.PLAYING || gameState === GameState.SUCCESS || gameState === GameState.FAILURE) && currentQuestion && (
          <div className="w-full">
            
            {/* Instruction Text (Visual Aid) */}
            <div className="text-center mb-12">
               <h2 className="text-4xl md:text-5xl font-bold text-gray-700">
                 请找出
                 <span className={currentQuestion.targetAttribute === 'big' ? "text-6xl text-purple-600 mx-3" : "text-4xl text-blue-500 mx-3"}>
                    {currentQuestion.targetAttribute === 'big' ? '大' : '小'}
                 </span> 
                 的 {currentQuestion.objectName}
               </h2>
            </div>

            {/* Cards Container */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24">
                {/* Left Card */}
                <div className="flex flex-col items-center gap-4">
                    <GameCard 
                        emoji={currentQuestion.emoji}
                        isBig={isBigLeft}
                        color={currentQuestion.colorHex}
                        onClick={() => handleCardClick(isBigLeft)}
                        disabled={gameState !== GameState.PLAYING}
                    />
                </div>

                {/* Right Card */}
                <div className="flex flex-col items-center gap-4">
                    <GameCard 
                        emoji={currentQuestion.emoji}
                        isBig={!isBigLeft}
                        color={currentQuestion.colorHex}
                        onClick={() => handleCardClick(!isBigLeft)}
                        disabled={gameState !== GameState.PLAYING}
                    />
                </div>
            </div>

          </div>
        )}
      </main>

      <FeedbackOverlay show={feedback.show} isCorrect={feedback.correct} />

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-green-400 opacity-20 rounded-t-[50%] pointer-events-none"></div>
    </div>
  );
};

export default App;