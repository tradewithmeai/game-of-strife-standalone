// Game Selector for Replay Mode
// Shows list of recorded games with key details for selection

import React from 'react';
import { Play, Clock, Trophy, Grid, Users, Zap, Database } from 'lucide-react';
import { CompressedGameData } from '@/types/simpleGameRecording';

interface ReplayGameSelectorProps {
  games: CompressedGameData[];
  onGameSelect: (game: CompressedGameData) => void;
}

const ReplayGameSelector: React.FC<ReplayGameSelectorProps> = ({ games, onGameSelect }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    return `${(bytes / 1024).toFixed(1)}KB`;
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <Database size={48} className="mx-auto mb-4 text-retro-gray" />
        <h3 className="text-lg text-retro-cyan mb-2">No Recorded Games Found</h3>
        <p className="text-retro-gray mb-6">
          Play some games first to collect data for replay testing.
        </p>
        <div className="text-sm text-retro-yellow bg-retro-dark border border-retro-purple p-4 max-w-md mx-auto">
          <p className="mb-2">To generate test data:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go back to main menu</li>
            <li>Play 2-player battles or training mode</li>
            <li>Complete full games (let simulation finish)</li>
            <li>Return here to see recorded games</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg text-retro-cyan mb-4 flex items-center gap-2">
        <Grid size={20} />
        Recorded Games ({games.length})
      </h2>

      <div className="space-y-3">
        {games.map((game, index) => (
          <div 
            key={game.gameId}
            className="bg-retro-dark border border-retro-purple p-4 hover:border-retro-cyan 
                     transition-colors duration-200 cursor-pointer"
            onClick={() => onGameSelect(game)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Play size={16} className="text-retro-green" />
                    <span className="font-bold text-retro-cyan">
                      Game #{index + 1}
                    </span>
                  </div>
                  
                  <div className="text-retro-gray text-xs">
                    {game.gameId.slice(-8)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-retro-gray" />
                    <span className="text-retro-gray">
                      {formatDate(game.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Grid size={14} className="text-retro-gray" />
                    <span className="text-retro-gray">
                      Hash: {game.gameHash.slice(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-retro-gray" />
                    <span className="text-retro-gray">
                      {formatFileSize(game.originalSize)} → {formatFileSize(game.compressedSize)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-retro-yellow" />
                    <span className="text-retro-yellow">
                      {Math.round((1 - game.compressedSize / game.originalSize) * 100)}% compression
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <button className="px-4 py-2 bg-retro-purple text-retro-cyan border border-retro-cyan 
                               hover:bg-retro-cyan hover:text-retro-dark transition-colors duration-200">
                  REPLAY
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-retro-dark border border-retro-purple text-retro-gray text-sm">
        <h3 className="text-retro-cyan mb-2">🔍 What to Look For:</h3>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Game data loads without errors</li>
          <li>Initial board state matches token placements</li>
          <li>Simulation runs with correct settings</li>
          <li>Final outcome is reasonably similar (may not be identical)</li>
          <li>All required data for AI training is present</li>
        </ul>
      </div>
    </div>
  );
};

export default ReplayGameSelector;