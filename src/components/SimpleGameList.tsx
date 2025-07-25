// Simple game list for replay selection
import React from 'react';
import { Play, Target, Users, Trash2 } from 'lucide-react';
import { StoredGame } from '@/types/gameStorage';

interface SimpleGameListProps {
  games: StoredGame[];
  onGameSelect: (game: StoredGame) => void;
  onClearAll: () => void;
}

export const SimpleGameList: React.FC<SimpleGameListProps> = ({ games, onGameSelect, onClearAll }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-retro-gray text-lg mb-4">No games recorded yet</div>
        <div className="text-retro-cyan text-sm">
          Play some games to see them here for replay!
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-retro-cyan">Recorded Games ({games.length})</h2>
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-3 py-1 text-xs bg-retro-dark text-retro-red border border-retro-red hover:bg-retro-red hover:text-retro-dark transition-colors"
        >
          <Trash2 size={12} />
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-retro-purple border border-retro-cyan p-4 hover:bg-retro-dark transition-colors cursor-pointer"
            onClick={() => onGameSelect(game)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {game.gameMode === 'training' ? (
                  <>
                    <Target size={16} className="text-retro-cyan" />
                    <span className="text-retro-cyan font-pixel">TRAINING MODE</span>
                  </>
                ) : (
                  <>
                    <Users size={16} className="text-retro-green" />
                    <span className="text-retro-green font-pixel">2-PLAYER BATTLE</span>
                  </>
                )}
              </div>
              <button className="flex items-center gap-1 px-2 py-1 text-xs bg-retro-cyan text-retro-dark hover:bg-white transition-colors">
                <Play size={12} />
                REPLAY
              </button>
            </div>

            <div className="text-sm text-retro-gray mb-2">
              {new Date(game.timestamp).toLocaleString()}
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="text-retro-yellow">
                {game.settings.boardSize}×{game.settings.boardSize} | 
                {game.initialBoard.length} tokens | 
                B{game.settings.birthRules.join('')}/S{game.settings.survivalRules.join('')}
              </div>
              <div className="text-retro-pink">
                {game.result.winner === null 
                  ? `Draw (${game.result.player1Score}-${game.result.player2Score})` 
                  : `P${game.result.winner + 1} Won (${game.result.player1Score}-${game.result.player2Score})`
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};