// Simple replay viewer - reconstructs and replays games
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { StoredGame } from '@/types/gameStorage';
import { Cell, GameBoard } from '@/components/GameBoard';
import { VictoryModal } from '@/components/VictoryModal';
import { SinglePlayerVictoryModal } from '@/components/SinglePlayerVictoryModal';

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

  // Conway's Game of Life simulation
  const nextGeneration = useCallback((board: Cell[][]): Cell[][] => {
    const newBoard: Cell[][] = board.map(row => row.map(cell => ({ ...cell })));
    const { birthRules, survivalRules, boardSize } = game.settings;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cell = board[row][col];
        let livingNeighbors = 0;

        // Count living neighbors
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
              if (board[newRow][newCol].alive) {
                livingNeighbors++;
              }
            }
          }
        }

        // Apply Conway's rules
        if (cell.alive) {
          newBoard[row][col].alive = survivalRules.includes(livingNeighbors);
          if (!newBoard[row][col].alive) {
            newBoard[row][col].player = null;
            newBoard[row][col].superpowerType = 0;
          }
        } else {
          if (birthRules.includes(livingNeighbors)) {
            newBoard[row][col].alive = true;
            // Determine player ownership from neighbors
            let player0Count = 0;
            let player1Count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                  if (board[newRow][newCol].alive) {
                    if (board[newRow][newCol].player === 0) player0Count++;
                    else if (board[newRow][newCol].player === 1) player1Count++;
                  }
                }
              }
            }
            newBoard[row][col].player = player0Count > player1Count ? 0 : 1;
          }
        }
      }
    }

    return newBoard;
  }, [game.settings]);

  // Simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentBoard(prevBoard => {
        const newBoard = nextGeneration(prevBoard);
        setGeneration(prev => {
          const nextGen = prev + 1;
          if (nextGen >= 100) { // Max generations
            setIsPlaying(false);
            setIsComplete(true);
            // Show victory modal after a brief delay
            setTimeout(() => setShowVictory(true), 500);
          }
          return nextGen;
        });
        return newBoard;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, nextGeneration]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentBoard(createInitialBoard());
    setGeneration(0);
    setIsPlaying(false);
    setIsComplete(false);
    setShowVictory(false);
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
          winner={game.result.winner}
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