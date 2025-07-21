
import React from 'react';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { GameRecordingStatus } from './GameRecordingStatus';
import type { GameStage } from '@/types/gameTypes';

interface GameHUDProps {
  gameStage: GameStage;
  generation: number;
  winner: number | null;
  isSimulating: boolean;
  boardSize: number;
  tokensPerPlayer: number;
  birthRules: number[];
  survivalRules: number[];
  enabledSuperpowers: number[];
  superpowerPercentage: number;
  onBackToMenu: () => void;
  onToggleSimulation: () => void;
  onResetGame: () => void;
  // Recording status props
  recordingStatus?: {
    isRecording: boolean;
    movesRecorded: number;
    snapshotsRecorded: number;
    pendingUploads: number;
    isUploading: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'checking';
    totalGamesRecorded: number;
  };
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameStage,
  generation,
  winner,
  isSimulating,
  boardSize,
  tokensPerPlayer,
  birthRules,
  survivalRules,
  enabledSuperpowers,
  superpowerPercentage,
  onBackToMenu,
  onToggleSimulation,
  onResetGame,
  recordingStatus
}) => {
  const getStageText = () => {
    switch (gameStage) {
      case 'placement': return 'PLACEMENT STAGE';
      case 'simulation': return `SIMULATION - GEN ${generation}`;
      case 'paused': return `PAUSED - GEN ${generation}`;
      case 'finished': 
        if (winner === null) return `DRAW - GEN ${generation}`;
        return `PLAYER ${winner + 1} WINS! - GEN ${generation}`;
      default: return 'GAME';
    }
  };

  const getRulesText = () => {
    const enabledCount = enabledSuperpowers.length;
    const spawnRate = Math.round(superpowerPercentage);
    return `B${birthRules.join('')}/S${survivalRules.join('')} | ${spawnRate}% SUPER (${enabledCount}/7)`;
  };

  return (
    <div className="flex justify-between items-center p-4 bg-retro-purple border-b-2 border-retro-cyan">
      <button
        onClick={onBackToMenu}
        className="retro-button flex items-center gap-2 px-4 py-2 text-xs"
      >
        <ArrowLeft size={12} />
        MENU
      </button>
      
      <div className="text-center">
        <div className="font-pixel text-sm text-retro-yellow text-glow">
          {getStageText()}
        </div>
        <div className="font-pixel text-xs text-retro-cyan mt-1">
          {boardSize}x{boardSize} | {tokensPerPlayer} TOKENS | 2P | {getRulesText()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Recording Status */}
        {recordingStatus && (
          <GameRecordingStatus
            isRecording={recordingStatus.isRecording}
            movesRecorded={recordingStatus.movesRecorded}
            snapshotsRecorded={recordingStatus.snapshotsRecorded}
            pendingUploads={recordingStatus.pendingUploads}
            isUploading={recordingStatus.isUploading}
            connectionStatus={recordingStatus.connectionStatus}
            totalGamesRecorded={recordingStatus.totalGamesRecorded}
            className="mr-2"
          />
        )}
        
        {gameStage !== 'placement' && gameStage !== 'finished' && (
          <button
            onClick={onToggleSimulation}
            className="retro-button flex items-center gap-2 px-3 py-2 text-xs"
          >
            {isSimulating ? <Pause size={12} /> : <Play size={12} />}
            {isSimulating ? 'PAUSE' : 'PLAY'}
          </button>
        )}
        <button
          onClick={onResetGame}
          className="retro-button flex items-center gap-2 px-3 py-2 text-xs text-retro-orange"
        >
          <RotateCcw size={12} />
          RESET
        </button>
      </div>
    </div>
  );
};
