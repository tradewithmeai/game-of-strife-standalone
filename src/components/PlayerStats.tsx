
import React from 'react';

interface PlayerStatsProps {
  player1Tokens: number;
  player2Tokens: number;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ player1Tokens, player2Tokens }) => {
  return (
    <div className="bg-retro-purple border-b border-retro-cyan px-4 py-2">
      <div className="flex justify-center gap-8 font-pixel text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-retro-cyan border border-retro-cyan" />
          <span className="text-retro-cyan">PLAYER 1 (MOUSE): {player1Tokens} TOKENS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-retro-green border border-retro-green" />
          <span className="text-retro-green">PLAYER 2 (KEYBOARD): {player2Tokens} TOKENS</span>
        </div>
      </div>
    </div>
  );
};
