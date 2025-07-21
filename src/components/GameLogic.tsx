import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard, Cell } from './GameBoard';
import { GameSettings as GameSettingsInterface } from './GameSettings';
import { GameHUD } from './GameHUD';
import { PlayerStats } from './PlayerStats';
import { PhaseIndicator } from './PhaseIndicator';
import { SimulationCountdown } from './SimulationCountdown';
import { VictoryModal } from './VictoryModal';
import { useGameState } from '@/hooks/useGameState';
import { useGameSimulation } from '@/hooks/useGameSimulation';
import { useSimpleGameRecorder } from '@/hooks/useSimpleGameRecorder';
import { gameUploader } from '@/services/simpleGameAPI';
import type { GameStage } from '@/types/gameTypes';

interface GameLogicProps {
  onBackToMenu: () => void;
  gameSettings: GameSettingsInterface;
}

export const GameLogic: React.FC<GameLogicProps> = ({ onBackToMenu, gameSettings }) => {
  console.log('🎮 GameLogic component mounted with settings:', gameSettings);
  
  const BOARD_SIZE = gameSettings.boardSize;
  const TOKENS_PER_PLAYER = gameSettings.tokensPerPlayer;
  const MAX_GENERATIONS = 100;
  const BIRTH_RULES = gameSettings.birthRules || [3];
  const SURVIVAL_RULES = gameSettings.survivalRules || [2, 3];
  const ENABLED_SUPERPOWERS = gameSettings.enabledSuperpowers || [];
  const SUPERPOWER_PERCENTAGE = gameSettings.superpowerPercentage || 20;

  // Debug log settings on component mount
  console.log('🎮 GameLogic Settings:', {
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
  
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [finalScores, setFinalScores] = useState({ player1: 0, player2: 0 });
  const [sessionWins, setSessionWins] = useState({ player1: 0, player2: 0 });

  const {
    board,
    gameStage,
    player1Tokens,
    player2Tokens,
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

  // Handle cell clicks - Both players use mouse/touch
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStage !== 'placement') return;
    if (board[row][col].player !== null) return;

    const tokensLeft = currentPlayer === 0 ? player1Tokens : player2Tokens;
    if (tokensLeft <= 0) return;

    // Assign superpower during token placement
    const superpowerType = Math.random() < (SUPERPOWER_PERCENTAGE / 100) && ENABLED_SUPERPOWERS.length > 0
      ? ENABLED_SUPERPOWERS[Math.floor(Math.random() * ENABLED_SUPERPOWERS.length)]
      : 0;

    // Place the token
    gameState.setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      newBoard[row][col] = { 
        player: currentPlayer, 
        alive: true, 
        superpowerType: superpowerType,
        memory: 0
      };
      return newBoard;
    });

    // Record the placement for AI training data
    recorder.recordPlacement(row, col, currentPlayer, superpowerType);

    // Update token count
    if (currentPlayer === 0) {
      gameState.setPlayer1Tokens(prev => prev - 1);
      // Auto-advance to player 2 when player 1 finishes
      if (player1Tokens === 1) { // Will become 0 after this placement
        setCurrentPlayer(1);
      }
    } else {
      gameState.setPlayer2Tokens(prev => prev - 1);
    }
  }, [gameStage, board, currentPlayer, player1Tokens, player2Tokens, gameState, SUPERPOWER_PERCENTAGE, ENABLED_SUPERPOWERS]);

  // Handle start player 2 (kept for compatibility but auto-advances now)
  const handleStartPlayer2 = () => {
    setCurrentPlayer(1);
  };

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

  const calculateFinalScores = useCallback((currentBoard: Cell[][]) => {
    let player1Score = 0;
    let player2Score = 0;
    
    console.log('🎯 Calculating final scores...');
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = currentBoard[row][col];
        if (cell && cell.alive && cell.player !== null) {
          if (cell.player === 0) {
            player1Score++;
          } else if (cell.player === 1) {
            player2Score++;
          }
        }
      }
    }
    
    console.log('🎯 Final cell counts:', { player1Score, player2Score });
    return { player1: player1Score, player2: player2Score };
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
    setCurrentPlayer(0);
    setShowCountdown(false);
    setShowVictory(false);
  };

  const handlePlayAgain = () => {
    setShowVictory(false);
    handleResetGame();
  };
  
  // Check if both players finished placing tokens
  useEffect(() => {
    // Start countdown when player 2 finishes (both players are done)
    if (currentPlayer === 1 && player2Tokens === 0 && gameStage === 'placement' && !showCountdown) {
      console.log('Both players finished placing tokens, starting countdown');
      setShowCountdown(true);
    }
    // Also check if we somehow missed the transition (backup check)
    else if (player1Tokens === 0 && player2Tokens === 0 && gameStage === 'placement' && !showCountdown) {
      console.log('Backup check: Both players finished, starting countdown');
      setShowCountdown(true);
    }
  }, [currentPlayer, player1Tokens, player2Tokens, gameStage, showCountdown]);

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
      const scores = calculateFinalScores(board);
      setFinalScores(scores);
      
      // Determine the actual winner based on living cells
      let gameWinner: number | null = null;
      if (scores.player1 > scores.player2) {
        gameWinner = 0;
      } else if (scores.player2 > scores.player1) {
        gameWinner = 1;
      }
      // If scores are equal, it's a draw (gameWinner stays null)
      
      // Update session wins
      if (gameWinner !== null) {
        setSessionWins(prev => ({
          ...prev,
          [gameWinner === 0 ? 'player1' : 'player2']: prev[gameWinner === 0 ? 'player1' : 'player2'] + 1
        }));
        console.log('🏆 Player', gameWinner + 1, 'wins this round!');
      } else {
        console.log('🤝 Game ended in a draw');
      }
      
      // Update the winner state to match the actual winner
      gameState.setWinner(gameWinner);
      
      // Finish simple recording with final outcome
      const compressedRecord = recorder.finishRecording(board, gameWinner, generation, 'max_generations');
      
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
  }, [gameStage, showVictory, calculateFinalScores, board, generation, winner, recorder, gameState]);

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

      {/* Phase Indicator */}
      {gameStage === 'placement' && (
        <PhaseIndicator
          currentPlayer={currentPlayer}
          player1Tokens={player1Tokens}
          player2Tokens={player2Tokens}
          gameStage={gameStage}
          onStartPlayer2={handleStartPlayer2}
        />
      )}

      {/* Player Stats */}
      {gameStage === 'placement' && (
        <div className="bg-retro-purple border-b border-retro-cyan px-4 py-2">
          <PlayerStats player1Tokens={player1Tokens} player2Tokens={player2Tokens} />
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
          {gameStage === 'placement' && 'CLICK TO PLACE TOKENS'}
          {gameStage === 'simulation' && 'CONWAY\'S GAME OF LIFE WITH SUPERPOWERS SIMULATION RUNNING'}
          {gameStage === 'paused' && 'SIMULATION PAUSED - CLICK PLAY TO CONTINUE'}
          {gameStage === 'finished' && 'GAME FINISHED - CLICK RESET TO PLAY AGAIN'}
        </div>
      </div>

      {/* Simulation Countdown */}
      {showCountdown && (
        <SimulationCountdown onCountdownComplete={handleCountdownComplete} />
      )}

      {showVictory && (
        <VictoryModal
          winner={winner}
          player1Score={finalScores.player1}
          player2Score={finalScores.player2}
          sessionWins={sessionWins}
          generation={generation}
          onPlayAgain={handlePlayAgain}
          onMainMenu={onBackToMenu}
        />
      )}
    </div>
  );
};