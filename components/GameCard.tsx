import React from 'react';

interface GameCardProps {
  emoji: string;
  isBig: boolean;
  color: string;
  onClick: () => void;
  disabled: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ emoji, isBig, color, onClick, disabled }) => {
  // We use CSS transform scale to represent size to ensure the object is identical, just larger/smaller.
  // Base size for 'Small' is 3rem, 'Big' is 8rem visually via scaling or font-size.
  
  const sizeClass = isBig ? "text-9xl" : "text-5xl";
  const containerSize = isBig ? "h-64 w-64" : "h-40 w-40";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group transition-all duration-300 ease-in-out
        ${containerSize}
        flex items-center justify-center
        rounded-3xl shadow-xl hover:shadow-2xl
        active:scale-95
        animate-pop
        border-4 border-white
        ${disabled ? 'cursor-default opacity-80' : 'cursor-pointer wiggle'}
      `}
      style={{ backgroundColor: color }}
    >
      <span className={`${sizeClass} drop-shadow-md select-none filter transition-transform`}>
        {emoji}
      </span>
      {/* Glossy effect */}
      <div className="absolute top-2 right-2 w-4 h-4 bg-white opacity-40 rounded-full"></div>
      <div className="absolute top-4 right-3 w-2 h-2 bg-white opacity-40 rounded-full"></div>
    </button>
  );
};

export default GameCard;