import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Target, RotateCcw, Home, TrendingUp, Eye } from 'lucide-react';

interface SinglePlayerVictoryModalProps {
  finalScore: number;
  tokensPlaced: number;
  generation: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const SinglePlayerVictoryModal: React.FC<SinglePlayerVictoryModalProps> = ({
  finalScore,
  tokensPlaced,
  generation,
  onPlayAgain,
  onMainMenu
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const survivalRate = tokensPlaced > 0 ? Math.round((finalScore / tokensPlaced) * 100) : 0;
  
  const getPerformanceText = () => {
    if (survivalRate >= 80) return { text: "EXCELLENT!", color: "text-retro-green" };
    if (survivalRate >= 60) return { text: "GREAT JOB!", color: "text-retro-cyan" };
    if (survivalRate >= 40) return { text: "GOOD EFFORT!", color: "text-retro-yellow" };
    if (survivalRate >= 20) return { text: "KEEP LEARNING!", color: "text-retro-orange" };
    return { text: "TRY AGAIN!", color: "text-retro-red" };
  };

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

  const performance = getPerformanceText();

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
          {/* Training Complete Title */}
          <div>
            <Target className="mx-auto text-retro-cyan" size={20} />
            <h1 className="text-xs sm:text-sm text-retro-cyan text-glow">
              TRAINING COMPLETE
            </h1>
            <h2 className={`text-xs ${performance.color}`}>
              {performance.text}
            </h2>
            <div className="text-xs text-retro-cyan opacity-75">
              GEN {generation}
            </div>
          </div>

          {/* Training Results */}
          <div className="space-y-1">
            <div className="text-xs text-retro-yellow">
              SURVIVAL ANALYSIS
            </div>
            
            {/* Survival Rate */}
            <div className="bg-retro-purple bg-opacity-30 p-1 rounded text-xs">
              <div className="text-retro-cyan mb-1">SURVIVAL RATE</div>
              <div className={`text-lg ${performance.color} text-glow`}>
                {survivalRate}%
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-1">
              <div className="flex-1 bg-retro-purple bg-opacity-30 p-1 rounded text-xs">
                <div className="text-retro-green">PLACED: {tokensPlaced}</div>
              </div>
              <div className="flex-1 bg-retro-purple bg-opacity-30 p-1 rounded text-xs">
                <div className="text-retro-cyan">SURVIVED: {finalScore}</div>
              </div>
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