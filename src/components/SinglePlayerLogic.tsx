import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard, Cell } from './GameBoard';
import { GameSettings as GameSettingsInterface } from './GameSettings';
import { GameHUD } from './GameHUD';
import { PhaseIndicator } from './PhaseIndicator';
import { SimulationCountdown } from './SimulationCountdown';
import { SinglePlayerVictoryModal } from './SinglePlayerVictoryModal';
import { useGameState } from '@/hooks/useGameState';
import { useGameSimulation } from '@/hooks/useGameSimulation';
import { useSimpleGameRecorder } from '@/hooks/useSimpleGameRecorder';
import { gameUploader } from '@/services/simpleGameAPI';
import type { GameStage } from '@/types/gameTypes';

interface SinglePlayerLogicProps {
  onBackToMenu: () => void;
  gameSettings: GameSettingsInterface;
}

export const SinglePlayerLogic: React.FC<SinglePlayerLogicProps> = ({ onBackToMenu, gameSettings }) => {
  console.log('🎮 SinglePlayerLogic component mounted with settings:', gameSettings);
  
  const BOARD_SIZE = gameSettings.boardSize;
  const TOKENS_PER_PLAYER = gameSettings.tokensPerPlayer;
  const MAX_GENERATIONS = 100;
  const BIRTH_RULES = gameSettings.birthRules || [3];
  const SURVIVAL_RULES = gameSettings.survivalRules || [2, 3];
  const ENABLED_SUPERPOWERS = gameSettings.enabledSuperpowers || [];
  const SUPERPOWER_PERCENTAGE = gameSettings.superpowerPercentage || 20;

  // Debug log settings on component mount
  console.log('🎮 SinglePlayerLogic Settings:', {
    boardSize: BOARD_SIZE,
    tokensPerPlayer: TOKENS_PER_PLAYER,
    birthRules: BIRTH_RULES,
    survivalRules: SURVIVAL_RULES,
    enabledSuperpowers: ENABLED_SUPERPOWERS,
    superpowerPercentage: SUPERPOWER_PERCENTAGE
  });

  const gameState = useGameState(gameSettings);
  
  // Simple game recording for AI training data
  const recorder = useSimpleGameRecorder();

  // Initialize simple game recording
  useEffect(() => {
    console.log('🎬 Starting simple game recording...');
    recorder.startRecording(gameSettings);
    
    return () => {
      // Cleanup: cancel recording if component unmounts unexpectedly
      if (recorder.isRecording) {
        console.log('🎬 Component unmounting, cancelling recording...');
        recorder.cancelRecording();
      }
    };
  }, [gameSettings, recorder]);
  
  const [showCountdown, setShowCountdown] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [tokensPlaced, setTokensPlaced] = useState(0);

  const {
    board,
    gameStage,
    player1Tokens,
    generation,
    isSimulating,
    winner
  } = gameState;

  // Initialize simulation hook
  const { nextGeneration } = useGameSimulation({
    boardSize: BOARD_SIZE,
    birthRules: BIRTH_RULES,
    survivalRules: SURVIVAL_RULES,
    enabledSuperpowers: ENABLED_SUPERPOWERS,
    superpowerPercentage: SUPERPOWER_PERCENTAGE,
    generation: gameState.generation,
    setBoard: gameState.setBoard,
    setGeneration: gameState.setGeneration,
    setIsSimulating: gameState.setIsSimulating,
    setGameStage: gameState.setGameStage,
    setWinner: gameState.setWinner,
    setBoardHistory: gameState.setBoardHistory,
    maxGenerations: MAX_GENERATIONS
  });

  // Handle cell clicks - Single player using mouse/touch
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStage !== 'placement') return;
    if (board[row][col].player !== null) return;
    if (player1Tokens <= 0) return;

    // Assign superpower during token placement
    const superpowerType = Math.random() < (SUPERPOWER_PERCENTAGE / 100) && ENABLED_SUPERPOWERS.length > 0
      ? ENABLED_SUPERPOWERS[Math.floor(Math.random() * ENABLED_SUPERPOWERS.length)]
      : 0;

    // Place the token (always player 0 in single player)
    gameState.setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      newBoard[row][col] = { 
        player: 0, 
        alive: true, 
        superpowerType: superpowerType,
        memory: 0
      };
      return newBoard;
    });

    // Record the placement for AI training data
    recorder.recordPlacement(row, col, 0, superpowerType);

    // Update token count
    gameState.setPlayer1Tokens(prev => prev - 1);
    setTokensPlaced(prev => prev + 1);
  }, [gameStage, board, player1Tokens, gameState, SUPERPOWER_PERCENTAGE, ENABLED_SUPERPOWERS, recorder]);

  const handleCountdownComplete = useCallback(() => {
    console.log('🚀 Countdown complete, starting simulation...');
    setShowCountdown(false);
    gameState.setGameStage('simulation');
    gameState.setIsSimulating(true);
    gameState.setBoardHistory([]);
    console.log('🚀 Simulation state set to:', { 
      gameStage: 'simulation', 
      isSimulating: true 
    });
  }, [gameState]);

  const calculateFinalScore = useCallback((currentBoard: Cell[][]) => {
    let score = 0;
    
    console.log('🎯 Calculating final score...');
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = currentBoard[row][col];
        if (cell && cell.alive && cell.player === 0) {
          score++;
        }
      }
    }
    
    console.log('🎯 Final cell count:', score);
    return score;
  }, [BOARD_SIZE]);

  const toggleSimulation = () => {
    if (gameStage === 'simulation') {
      gameState.setGameStage('paused');
      gameState.setIsSimulating(false);
    } else if (gameStage === 'paused') {
      gameState.setGameStage('simulation');
      gameState.setIsSimulating(true);
    }
  };

  const handleResetGame = () => {
    gameState.resetGame();
    setShowCountdown(false);
    setShowVictory(false);
    setTokensPlaced(0);
  };

  const handlePlayAgain = () => {
    setShowVictory(false);
    handleResetGame();
  };

  const handleStartSimulation = () => {
    console.log('Player finished placing tokens, starting countdown');
    setShowCountdown(true);
  };
  
  // Check if player finished placing tokens
  useEffect(() => {
    if (player1Tokens === 0 && gameStage === 'placement' && !showCountdown) {
      console.log('Player finished placing all tokens, starting countdown');
      setShowCountdown(true);
    }
  }, [player1Tokens, gameStage, showCountdown]);

  // Simulation loop
  useEffect(() => {
    console.log('🔄 Simulation useEffect triggered:', { 
      isSimulating, 
      gameStage,
      nextGeneration: typeof nextGeneration
    });
    
    if (isSimulating) {
      console.log('🚀 Starting simulation interval...');
      const interval = setInterval(() => {
        console.log('⏰ Calling nextGeneration()...');
        nextGeneration();
      }, 200);

      return () => {
        console.log('🛑 Clearing simulation interval');
        clearInterval(interval);
      };
    }
  }, [isSimulating, nextGeneration]);

  // Handle game end and show victory screen
  useEffect(() => {
    if (gameStage === 'finished' && !showVictory) {
      const score = calculateFinalScore(board);
      setFinalScore(score);
      
      // Calculate survival rate
      const survivalRate = tokensPlaced > 0 ? Math.round((score / tokensPlaced) * 100) : 0;
      
      console.log('🏆 Training session completed:', {
        tokensPlaced,
        finalScore: score,
        survivalRate: `${survivalRate}%`
      });
      
      // Finish simple recording with final outcome
      const compressedRecord = recorder.finishRecording(board, 0, generation, 'max_generations');
      
      if (compressedRecord) {
        // Upload game data for AI training
        gameUploader.uploadGames([compressedRecord]).then(result => {
          console.log('🎯 Game upload result:', {
            uploaded: result.uploaded,
            stored: result.stored,
            failed: result.failed
          });
        });
      }
      
      setShowVictory(true);
    }
  }, [gameStage, showVictory, calculateFinalScore, board, generation, recorder, tokensPlaced]);

  return (
    <div className="min-h-screen bg-retro-dark text-retro-cyan flex flex-col">
      {/* Game HUD */}
      <GameHUD
        gameStage={gameStage}
        generation={generation}
        winner={winner}
        isSimulating={isSimulating}
        boardSize={BOARD_SIZE}
        tokensPerPlayer={TOKENS_PER_PLAYER}
        birthRules={BIRTH_RULES}
        survivalRules={SURVIVAL_RULES}
        enabledSuperpowers={ENABLED_SUPERPOWERS}
        superpowerPercentage={SUPERPOWER_PERCENTAGE}
        onBackToMenu={onBackToMenu}
        onToggleSimulation={toggleSimulation}
        onResetGame={handleResetGame}
        recordingStatus={{
          isRecording: recorder.isRecording,
          movesRecorded: recorder.getStatus().placementsRecorded,
          snapshotsRecorded: 0, // Not needed in simple version
          pendingUploads: recorder.pendingUploads,
          isUploading: false, // Simplified - no continuous upload status
          connectionStatus: 'connected' as const, // Simplified
          totalGamesRecorded: recorder.totalGamesRecorded
        }}
      />

      {/* Phase Indicator for Single Player */}
      {gameStage === 'placement' && (
        <div className="bg-retro-purple border-b border-retro-cyan px-4 py-3">
          <div className="text-center">
            <div className="font-pixel text-lg text-retro-cyan text-glow mb-2">
              TRAINING MODE - PLACE YOUR TOKENS
            </div>
            <div className="font-pixel text-sm text-retro-yellow">
              TOKENS REMAINING: {player1Tokens}
            </div>
            {player1Tokens === 0 && (
              <div className="font-pixel text-sm text-retro-green mt-2 animate-pulse">
                ALL TOKENS PLACED - SIMULATION STARTING...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Board */}
      <div className="flex-1 p-4">
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          isPlacementStage={gameStage === 'placement'}
          selectedCell={null}
        />
      </div>

      {/* Instructions */}
      <div className="bg-retro-purple border-t border-retro-cyan px-4 py-2">
        <div className="text-center font-pixel text-xs text-retro-cyan">
          {gameStage === 'placement' && 'CLICK TO PLACE TOKENS - LEARN SURVIVAL PATTERNS'}
          {gameStage === 'simulation' && 'OBSERVE YOUR CELLS EVOLVE - STUDY THE PATTERNS'}
          {gameStage === 'paused' && 'SIMULATION PAUSED - CLICK PLAY TO CONTINUE'}
          {gameStage === 'finished' && 'TRAINING COMPLETE - REVIEW YOUR SURVIVAL RATE'}
        </div>
      </div>

      {/* Simulation Countdown */}
      {showCountdown && (
        <SimulationCountdown onCountdownComplete={handleCountdownComplete} />
      )}

      {showVictory && (
        <SinglePlayerVictoryModal
          finalScore={finalScore}
          tokensPlaced={tokensPlaced}
          generation={generation}
          onPlayAgain={handlePlayAgain}
          onMainMenu={onBackToMenu}
        />
      )}
    </div>
  );
};