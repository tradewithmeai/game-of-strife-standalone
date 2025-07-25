
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, RotateCcw, Home, Eye } from 'lucide-react';

interface VictoryModalProps {
  winner: number | null;
  player1Score: number;
  player2Score: number;
  sessionWins: { player1: number; player2: number };
  generation: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  player1Score,
  player2Score,
  sessionWins,
  generation,
  onPlayAgain,
  onMainMenu
}) => {
  const [isHidden, setIsHidden] = useState(false);

  // Add global mouse up listener to ensure modal returns even if cursor moves off button
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsHidden(false);
    };

    if (isHidden) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isHidden]);
  const getWinnerText = () => {
    if (winner === null) return "IT'S A DRAW!";
    return `PLAYER ${winner + 1} WINS!`;
  };

  const getWinnerColor = () => {
    if (winner === null) return 'text-retro-yellow';
    return winner === 0 ? 'text-retro-cyan' : 'text-retro-green';
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4"
      style={{ 
        background: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div 
        className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-retro-dark border-2 border-retro-cyan text-center font-pixel mx-auto"
        style={{ 
          maxHeight: '95vh',
          overflow: 'auto',
          minHeight: 'auto'
        }}
      >
        <div className="p-2 sm:p-3 space-y-1 sm:space-y-2">
          {/* Victory Title */}
          <div>
            <Trophy className={`mx-auto ${getWinnerColor()}`} size={20} />
            <h1 className={`text-xs sm:text-sm ${getWinnerColor()} text-glow`}>
              {getWinnerText()}
            </h1>
            <div className="text-xs text-retro-cyan opacity-75">
              GEN {generation}
            </div>
          </div>

          {/* Scores & Session Combined */}
          <div className="space-y-1">
            <div className="text-xs text-retro-yellow">
              SCORES (WINS)
            </div>
            
            <div className="flex justify-between items-center bg-retro-purple bg-opacity-30 p-1 rounded text-xs">
              <span className="text-retro-cyan">P1: {player1Score} ({sessionWins.player1})</span>
            </div>

            <div className="flex justify-between items-center bg-retro-purple bg-opacity-30 p-1 rounded text-xs">
              <span className="text-retro-green">P2: {player2Score} ({sessionWins.player2})</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 sm:gap-2">
            <button
              onMouseDown={() => setIsHidden(true)}
              onMouseUp={() => setIsHidden(false)}
              onMouseLeave={() => setIsHidden(false)}
              onTouchStart={() => setIsHidden(true)}
              onTouchEnd={() => setIsHidden(false)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-retro-purple border border-retro-yellow text-retro-yellow hover:bg-retro-yellow hover:text-retro-dark transition-colors select-none"
            >
              <Eye size={10} />
              VIEW
            </button>

            <button
              onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-retro-purple border border-retro-green text-retro-green hover:bg-retro-green hover:text-retro-dark transition-colors"
            >
              <RotateCcw size={10} />
              AGAIN
            </button>

            <button
              onClick={onMainMenu}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-retro-purple border border-retro-cyan text-retro-cyan hover:bg-retro-cyan hover:text-retro-dark transition-colors"
            >
              <Home size={10} />
              MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Hide the modal when the View Board button is pressed
  if (isHidden) {
    return null;
  }

  return createPortal(modalContent, document.body);
};
