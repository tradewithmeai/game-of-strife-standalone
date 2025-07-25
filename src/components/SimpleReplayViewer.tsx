// Simple replay viewer - reconstructs and replays games
import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';
import { StoredGame } from '@/types/gameStorage';
import { Cell, GameBoard } from '@/components/GameBoard';

interface SimpleReplayViewerProps {
  game: StoredGame;
  onBack: () => void;
}

export const SimpleReplayViewer: React.FC<SimpleReplayViewerProps> = ({ game, onBack }) => {
  const [currentBoard, setCurrentBoard] = useState<Cell[][]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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
  };

  return (
    <div className="min-h-screen bg-retro-dark text-retro-cyan flex flex-col">
      {/* Header */}
      <div className="bg-retro-purple border-b border-retro-cyan p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-retro-purple text-retro-cyan border border-retro-cyan hover:bg-retro-cyan hover:text-retro-dark transition-colors"
            >
              <ArrowLeft size={16} />
              BACK
            </button>
            <h1 className="text-xl font-pixel">REPLAY: {game.gameMode.toUpperCase()}</h1>
          </div>
          <div className="text-sm text-retro-gray">
            {new Date(game.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-retro-dark border-b border-retro-purple p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-4 py-2 bg-retro-purple text-retro-cyan border border-retro-cyan hover:bg-retro-cyan hover:text-retro-dark transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-retro-dark text-retro-cyan border border-retro-cyan hover:bg-retro-cyan hover:text-retro-dark transition-colors"
            >
              <RotateCcw size={16} />
              RESET
            </button>
          </div>

          <div className="text-sm">
            <span className="text-retro-cyan">Generation: {generation}</span>
            {isComplete && <span className="ml-4 text-retro-green">✓ COMPLETE</span>}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="bg-retro-purple border-b border-retro-cyan px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div>
            Board: {game.settings.boardSize}×{game.settings.boardSize} | 
            Tokens: {game.initialBoard.length} | 
            Rules: B{game.settings.birthRules.join('')}/S{game.settings.survivalRules.join('')}
          </div>
          <div>
            Result: {game.result.winner === null ? 'Draw' : `Player ${game.result.winner + 1} Won`} 
            ({game.result.player1Score}-{game.result.player2Score})
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 p-4">
        <GameBoard
          board={currentBoard}
          onCellClick={() => {}}
          isPlacementStage={false}
          selectedCell={null}
        />
      </div>
    </div>
  );
};