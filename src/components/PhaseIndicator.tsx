
import React from 'react';
import { User, Users, Play } from 'lucide-react';

interface PhaseIndicatorProps {
  currentPlayer: number;
  player1Tokens: number;
  player2Tokens: number;
  gameStage: string;
  onStartPlayer2: () => void;
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPlayer,
  player1Tokens,
  player2Tokens,
  gameStage,
  onStartPlayer2
}) => {
  if (gameStage !== 'placement') return null;

  // Player 1 turn
  if (currentPlayer === 0 && player1Tokens > 0) {
    return (
      <div className="bg-retro-purple border-b border-retro-cyan px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <User className="text-retro-cyan" size={20} />
          <div className="font-pixel text-lg text-retro-cyan text-glow">
            PLAYER 1: PLACE YOUR BLUE TOKENS ({player1Tokens} REMAINING)
          </div>
        </div>
      </div>
    );
  }

  // This transition is now automatic, but we can show a brief message
  if (currentPlayer === 0 && player1Tokens === 0 && player2Tokens > 0) {
    return (
      <div className="bg-retro-purple border-b border-retro-cyan px-4 py-3">
        <div className="text-center">
          <div className="font-pixel text-lg text-retro-yellow text-glow animate-pulse">
            PLAYER 1 COMPLETED! SWITCHING TO PLAYER 2...
          </div>
        </div>
      </div>
    );
  }

  // Player 2 turn
  if (currentPlayer === 1 && player2Tokens > 0) {
    return (
      <div className="bg-retro-purple border-b border-retro-cyan px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <Users className="text-retro-green" size={20} />
          <div className="font-pixel text-lg text-retro-green text-glow">
            PLAYER 2: PLACE YOUR GREEN TOKENS ({player2Tokens} REMAINING)
          </div>
        </div>
      </div>
    );
  }

  return null;
};
