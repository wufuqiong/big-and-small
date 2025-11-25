import React from 'react';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  show: boolean;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isCorrect, show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"></div>
      <div className="relative z-10 animate-bounce">
        {isCorrect ? (
          <div className="text-9xl filter drop-shadow-2xl">
            🌟
          </div>
        ) : (
          <div className="text-9xl filter drop-shadow-2xl opacity-90">
            ❌
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackOverlay;