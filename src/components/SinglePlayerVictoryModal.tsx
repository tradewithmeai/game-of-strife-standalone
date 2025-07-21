import React from 'react';
import { Target, RotateCcw, Home, TrendingUp } from 'lucide-react';

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
  const survivalRate = tokensPlaced > 0 ? Math.round((finalScore / tokensPlaced) * 100) : 0;
  
  const getPerformanceText = () => {
    if (survivalRate >= 80) return { text: "EXCELLENT!", color: "text-retro-green" };
    if (survivalRate >= 60) return { text: "GREAT JOB!", color: "text-retro-cyan" };
    if (survivalRate >= 40) return { text: "GOOD EFFORT!", color: "text-retro-yellow" };
    if (survivalRate >= 20) return { text: "KEEP LEARNING!", color: "text-retro-orange" };
    return { text: "TRY AGAIN!", color: "text-retro-red" };
  };

  const getPerformanceIcon = () => {
    if (survivalRate >= 60) return <Target className="mx-auto mb-4 text-retro-green animate-bounce" size={64} />;
    return <TrendingUp className="mx-auto mb-4 text-retro-yellow animate-bounce" size={64} />;
  };

  const performance = getPerformanceText();

  return (
    <div className="fixed inset-0 bg-retro-dark bg-opacity-95 flex items-center justify-center z-50">
      <div className="game-screen p-8 max-w-md mx-4 text-center">
        {/* Training Complete Title */}
        <div className="mb-6">
          {getPerformanceIcon()}
          <h1 className="font-pixel text-2xl text-retro-cyan text-glow mb-2">
            TRAINING COMPLETE
          </h1>
          <h2 className={`font-pixel text-xl ${performance.color} text-glow mb-2`}>
            {performance.text}
          </h2>
          <div className="font-pixel text-sm text-retro-cyan opacity-75">
            SIMULATION ENDED AT GENERATION {generation}
          </div>
        </div>

        {/* Training Results */}
        <div className="mb-8 space-y-4">
          <div className="font-pixel text-lg text-retro-yellow mb-4">
            SURVIVAL ANALYSIS
          </div>
          
          {/* Survival Rate - Main Metric */}
          <div className="bg-retro-purple bg-opacity-50 p-4 rounded border-2 border-retro-cyan">
            <div className="font-pixel text-sm text-retro-cyan mb-2">
              SURVIVAL RATE
            </div>
            <div className={`font-pixel text-4xl ${performance.color} text-glow`}>
              {survivalRate}%
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-retro-dark bg-opacity-50 p-3 rounded">
              <div className="font-pixel text-xs text-retro-green mb-1">
                TOKENS PLACED
              </div>
              <div className="font-pixel text-xl text-retro-green text-glow">
                {tokensPlaced}
              </div>
            </div>

            <div className="bg-retro-dark bg-opacity-50 p-3 rounded">
              <div className="font-pixel text-xs text-retro-cyan mb-1">
                CELLS SURVIVED
              </div>
              <div className="font-pixel text-xl text-retro-cyan text-glow">
                {finalScore}
              </div>
            </div>
          </div>

          {/* Training Tips */}
          <div className="bg-retro-dark bg-opacity-30 p-4 rounded border border-retro-yellow">
            <div className="font-pixel text-xs text-retro-yellow mb-2">
              TRAINING TIP
            </div>
            <div className="font-pixel text-xs text-retro-cyan">
              {survivalRate >= 60 
                ? "Great patterns! Try different formations to explore new strategies."
                : survivalRate >= 30 
                ? "Focus on stable patterns like blocks and blinkers for better survival."
                : "Try placing tokens closer together to form stable communities."
              }
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="retro-button w-full flex items-center justify-center gap-2 px-6 py-3 text-retro-green border-retro-green hover:bg-retro-green hover:text-retro-dark"
          >
            <RotateCcw size={16} />
            TRAIN AGAIN
          </button>

          <button
            onClick={onMainMenu}
            className="retro-button w-full flex items-center justify-center gap-2 px-6 py-3 text-retro-cyan border-retro-cyan hover:bg-retro-cyan hover:text-retro-dark"
          >
            <Home size={16} />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};