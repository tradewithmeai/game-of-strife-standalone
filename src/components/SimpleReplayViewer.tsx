// Simple replay viewer - reconstructs and replays games
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { StoredGame } from '@/types/gameStorage';
import { Cell, GameBoard } from '@/components/GameBoard';
import { VictoryModal } from '@/components/VictoryModal';
import { SinglePlayerVictoryModal } from '@/components/SinglePlayerVictoryModal';
import { useGameSimulation } from '@/hooks/useGameSimulation';
import { useGameRules } from '@/hooks/useGameRules';

interface SimpleReplayViewerProps {
  game: StoredGame;
  onBack: () => void;
}

export const SimpleReplayViewer: React.FC<SimpleReplayViewerProps> = ({ game, onBack }) => {
  const [currentBoard, setCurrentBoard] = useState<Cell[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [gameStage, setGameStage] = useState<'placement' | 'simulation' | 'paused' | 'finished'>('simulation');
  const [winner, setWinner] = useState<number | null>(null);
  const [boardHistory, setBoardHistory] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Create initial board from stored positions
  const createInitialBoard = useCallback((): Cell[][] => {
    const board: Cell[][] = Array.from({ length: game.settings.boardSize }, () =>
      Array.from({ length: game.settings.boardSize }, () => ({
        alive: false,
        player: null,
        superpowerType: 0,
        memory: 0
      }))
    );

    // Place tokens at recorded positions
    game.initialBoard.forEach(pos => {
      if (pos.row >= 0 && pos.row < game.settings.boardSize && 
          pos.col >= 0 && pos.col < game.settings.boardSize) {
        board[pos.row][pos.col] = {
          alive: true,
          player: pos.player,
          superpowerType: pos.superpowerType,
          memory: 0
        };
      }
    });

    return board;
  }, [game]);

  // Initialize board
  useEffect(() => {
    setCurrentBoard(createInitialBoard());
    setGeneration(0);
    setIsComplete(false);
    setShowVictory(false);
  }, [createInitialBoard]);

  // Use the same game simulation engine as 2-player mode
  const { nextGeneration } = useGameSimulation({
    boardSize: game.settings.boardSize,
    birthRules: game.settings.birthRules,
    survivalRules: game.settings.survivalRules,
    enabledSuperpowers: game.settings.enabledSuperpowers,
    superpowerPercentage: game.settings.superpowerPercentage,
    generation,
    setBoard: setCurrentBoard,
    setGeneration,
    setIsSimulating,
    setGameStage,
    setWinner,
    setBoardHistory,
    maxGenerations: 100
  });

  // Simulation loop using proper game engine
  useEffect(() => {
    if (!isPlaying) {
      setIsSimulating(false);
      return;
    }

    setIsSimulating(true);
    const interval = setInterval(() => {
      nextGeneration();
    }, 200);

    return () => {
      clearInterval(interval);
      setIsSimulating(false);
    };
  }, [isPlaying, nextGeneration]);

  // Handle game completion
  useEffect(() => {
    if (gameStage === 'finished') {
      setIsPlaying(false);
      setIsComplete(true);
      // Show victory modal after a brief delay
      setTimeout(() => setShowVictory(true), 500);
    }
  }, [gameStage]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentBoard(createInitialBoard());
    setGeneration(0);
    setIsPlaying(false);
    setIsComplete(false);
    setShowVictory(false);
    setGameStage('simulation');
    setWinner(null);
    setBoardHistory([]);
    setIsSimulating(false);
  };

  const handlePlayAgain = () => {
    handleReset();
  };

  const handleCloseVictory = () => {
    setShowVictory(false);
  };

  return (
    <div className="min-h-screen bg-retro-dark text-retro-cyan flex flex-col">
      {/* Minimal overlay controls */}
      <div className="absolute top-4 left-4 right-4 z-[9999] flex items-center justify-between pointer-events-none">
        <button
          onClick={onBack}
          className="retro-button text-xs px-3 py-2 pointer-events-auto"
        >
          ← BACK
        </button>
        
        <button
          onClick={handlePlayPause}
          className="retro-button text-xs px-3 py-2 pointer-events-auto"
        >
          {isPlaying ? '⏸️ PAUSE' : '▶️ PLAY'}
        </button>
      </div>

      {/* Fullscreen Game Board */}
      <div className="flex-1 flex items-center justify-center bg-retro-dark">
        <GameBoard
          board={currentBoard}
          onCellClick={() => {}}
          isPlacementStage={false}
          selectedCell={null}
          fullscreen={true}
        />
      </div>

      {/* Victory Modal */}
      {showVictory && game.gameMode === '2player' && (
        <VictoryModal
          winner={winner !== null ? winner : game.result.winner}
          player1Score={game.result.player1Score}
          player2Score={game.result.player2Score}
          sessionWins={{ player1: 0, player2: 0 }} // No session tracking in replay
          generation={generation}
          onPlayAgain={handlePlayAgain}
          onMainMenu={onBack}
          onViewBoard={handleCloseVictory}
        />
      )}

      {showVictory && game.gameMode === 'training' && (
        <SinglePlayerVictoryModal
          finalScore={game.result.player1Score}
          tokensPlaced={game.initialBoard.length}
          generation={generation}
          onPlayAgain={handlePlayAgain}
          onMainMenu={onBack}
        />
      )}
    </div>
  );
};