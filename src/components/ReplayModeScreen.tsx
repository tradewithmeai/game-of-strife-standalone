// Simple Game Replay Mode
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database } from 'lucide-react';
import { StoredGame } from '@/types/gameStorage';
import { useGameStorage } from '@/hooks/useGameStorage';
import { SimpleGameList } from '@/components/SimpleGameList';
import { SimpleReplayViewer } from '@/components/SimpleReplayViewer';

type ReplayStage = 'list' | 'viewing';

interface ReplayModeScreenProps {
  onBack: () => void;
}

const ReplayModeScreen: React.FC<ReplayModeScreenProps> = ({ onBack }) => {
  const [stage, setStage] = useState<ReplayStage>('list');
  const [selectedGame, setSelectedGame] = useState<StoredGame | null>(null);
  const [games, setGames] = useState<StoredGame[]>([]);
  
  const { getStoredGames, clearAllGames } = useGameStorage();

  // Load games on mount
  useEffect(() => {
    const storedGames = getStoredGames();
    setGames(storedGames);
  }, [getStoredGames]);

  const handleGameSelect = (game: StoredGame) => {
    setSelectedGame(game);
    setStage('viewing');
  };

  const handleBackToList = () => {
    setStage('list');
    setSelectedGame(null);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all recorded games?')) {
      clearAllGames();
      setGames([]);
    }
  };


  return (
    <div className="min-h-screen bg-retro-dark text-retro-cyan flex flex-col">
      {/* Header */}
      <div className="bg-retro-purple border-b border-retro-cyan p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={stage === 'list' ? onBack : handleBackToList}
            className="flex items-center gap-2 px-4 py-2 bg-retro-purple text-retro-cyan border border-retro-cyan hover:bg-retro-cyan hover:text-retro-dark transition-colors"
          >
            <ArrowLeft size={16} />
            {stage === 'list' ? 'MAIN MENU' : 'GAME LIST'}
          </button>
          
          <div className="flex items-center gap-2">
            <Database size={20} />
            <h1 className="text-xl font-pixel">GAME REPLAYS</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {stage === 'list' && (
          <SimpleGameList 
            games={games}
            onGameSelect={handleGameSelect}
            onClearAll={handleClearAll}
          />
        )}

        {stage === 'viewing' && selectedGame && (
          <SimpleReplayViewer 
            game={selectedGame}
            onBack={handleBackToList}
          />
        )}
      </div>
    </div>
  );
};

export default ReplayModeScreen;