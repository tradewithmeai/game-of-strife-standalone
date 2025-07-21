
import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';

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
  const getWinnerText = () => {
    if (winner === null) return "IT'S A DRAW!";
    return `PLAYER ${winner + 1} WINS!`;
  };

  const getWinnerColor = () => {
    if (winner === null) return 'text-retro-yellow';
    return winner === 0 ? 'text-retro-cyan' : 'text-retro-green';
  };

  return (
    <div className="fixed inset-0 bg-retro-dark bg-opacity-95 flex items-center justify-center z-50">
      <div className="game-screen p-8 max-w-md mx-4 text-center">
        {/* Victory Title */}
        <div className="mb-6">
          <Trophy className={`mx-auto mb-4 ${getWinnerColor()} animate-bounce`} size={64} />
          <h1 className={`font-pixel text-3xl ${getWinnerColor()} text-glow mb-2`}>
            {getWinnerText()}
          </h1>
          <div className="font-pixel text-sm text-retro-cyan opacity-75">
            GENERATION {generation}
          </div>
        </div>

        {/* Final Scores */}
        <div className="mb-8 space-y-4">
          <div className="font-pixel text-lg text-retro-yellow mb-4">
            FINAL CELL COUNT
          </div>
          
          <div className="flex justify-between items-center bg-retro-purple bg-opacity-30 p-3 rounded">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-retro-cyan rounded"></div>
              <span className="font-pixel text-retro-cyan">PLAYER 1</span>
            </div>
            <div className="font-pixel text-xl text-retro-cyan text-glow">
              {player1Score} CELLS
            </div>
          </div>

          <div className="flex justify-between items-center bg-retro-purple bg-opacity-30 p-3 rounded">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-retro-green rounded"></div>
              <span className="font-pixel text-retro-green">PLAYER 2</span>
            </div>
            <div className="font-pixel text-xl text-retro-green text-glow">
              {player2Score} CELLS
            </div>
          </div>
        </div>

        {/* Session Wins */}
        <div className="mb-8 space-y-4">
          <div className="font-pixel text-lg text-retro-pink mb-4">
            SESSION WINS
          </div>
          
          <div className="flex justify-between items-center bg-retro-dark bg-opacity-50 p-3 rounded">
            <div className="flex items-center gap-2">
              <Trophy className="text-retro-cyan" size={16} />
              <span className="font-pixel text-retro-cyan">PLAYER 1</span>
            </div>
            <div className="font-pixel text-2xl text-retro-cyan text-glow">
              {sessionWins.player1}
            </div>
          </div>

          <div className="flex justify-between items-center bg-retro-dark bg-opacity-50 p-3 rounded">
            <div className="flex items-center gap-2">
              <Trophy className="text-retro-green" size={16} />
              <span className="font-pixel text-retro-green">PLAYER 2</span>
            </div>
            <div className="font-pixel text-2xl text-retro-green text-glow">
              {sessionWins.player2}
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
            PLAY AGAIN
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
