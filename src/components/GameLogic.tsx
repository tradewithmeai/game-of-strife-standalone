import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard, Cell } from './GameBoard';
import { GameSettings as GameSettingsInterface } from './GameSettings';
import { GameHUD } from './GameHUD';
import { PlayerStats } from './PlayerStats';
import { PhaseIndicator } from './PhaseIndicator';
import { SimulationCountdown } from './SimulationCountdown';
import { PlayerTransitionCountdown } from './PlayerTransitionCountdown';
import { VictoryModal } from './VictoryModal';
import { useGameState } from '@/hooks/useGameState';
import { useGameSimulation } from '@/hooks/useGameSimulation';
import { useGameStorage } from '@/hooks/useGameStorage';
import type { GameStage } from '@/types/gameTypes';

interface GameLogicProps {
  onBackToMenu: () => void;
  gameSettings: GameSettingsInterface;
}

export const GameLogic: React.FC<GameLogicProps> = ({ onBackToMenu, gameSettings }) => {
  
  const BOARD_SIZE = gameSettings.boardSize;
  const TOKENS_PER_PLAYER = gameSettings.tokensPerPlayer;
  const MAX_GENERATIONS = 100;
  const BIRTH_RULES = gameSettings.birthRules || [3];
  const SURVIVAL_RULES = gameSettings.survivalRules || [2, 3];
  const ENABLED_SUPERPOWERS = gameSettings.enabledSuperpowers || [];
  const SUPERPOWER_PERCENTAGE = gameSettings.superpowerPercentage || 20;


  const gameState = useGameState(gameSettings);
  const { saveGame } = useGameStorage();
  
  const [currentPlayer, setCurrentPlayer] = useState<0 | 1>(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showPlayerTransition, setShowPlayerTransition] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [finalScores, setFinalScores] = useState({ player1: 0, player2: 0 });
  const [sessionWins, setSessionWins] = useState({ player1: 0, player2: 0 });
  const [tokensPlaced, setTokensPlaced] = useState(0);
  const [initialBoardState, setInitialBoardState] = useState<Cell[][]>([]);

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

    // No recording needed - we'll save the complete game at the end

    // Update token count and tracking
    setTokensPlaced(prev => prev + 1);
    if (currentPlayer === 0) {
      gameState.setPlayer1Tokens(prev => prev - 1);
    } else {
      gameState.setPlayer2Tokens(prev => prev - 1);
    }
  }, [gameStage, board, currentPlayer, player1Tokens, player2Tokens, gameState, SUPERPOWER_PERCENTAGE, ENABLED_SUPERPOWERS]);

  // Handle start player 2 (kept for compatibility but auto-advances now)
  const handleStartPlayer2 = () => {
    setCurrentPlayer(1);
  };

  const handleCountdownComplete = useCallback(() => {
    console.log('🎯 Countdown completed - starting simulation');
    // Capture initial board state before simulation starts
    setInitialBoardState(board.map(row => row.map(cell => ({ ...cell }))));
    
    setShowCountdown(false);
    gameState.setGameStage('simulation');
    gameState.setIsSimulating(true);
    gameState.setBoardHistory([]);
  }, [gameState, board]);

  const calculateFinalScores = useCallback((currentBoard: Cell[][]) => {
    let player1Score = 0;
    let player2Score = 0;
    let totalAliveCells = 0;
    let deadCells = 0;
    
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = currentBoard[row][col];
        if (cell) {
          if (cell.alive) {
            totalAliveCells++;
            if (cell.player === 0) {
              player1Score++;
            } else if (cell.player === 1) {
              player2Score++;
            }
          } else {
            deadCells++;
          }
        }
      }
    }
    
    // Verify totals
    if (player1Score + player2Score !== totalAliveCells) {
      console.warn('⚠️  Score mismatch detected!', {
        player1Score,
        player2Score,
        sum: player1Score + player2Score,
        totalAliveCells
      });
    }
    
    return { player1: player1Score, player2: player2Score };
  }, [BOARD_SIZE, tokensPlaced]);

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
    setShowPlayerTransition(false);
    setShowVictory(false);
    setTokensPlaced(0);
  };

  const handlePlayAgain = () => {
    setShowVictory(false);
    handleResetGame();
  };

  const handlePlayerTransitionComplete = () => {
    console.log('🎯 Player transition completed - setting current player to 1');
    setShowPlayerTransition(false);
    setCurrentPlayer(1);
  };
  
  // Handle player transitions and countdown
  useEffect(() => {
    if (gameStage !== 'placement') return;
    
    console.log('🎯 Game state check:', { 
      currentPlayer, 
      player1Tokens, 
      player2Tokens, 
      showPlayerTransition, 
      showCountdown 
    });
    
    // Show transition screen when player 1 finishes
    if (currentPlayer === 0 && player1Tokens === 0 && !showPlayerTransition) {
      console.log('🎯 Triggering player transition countdown');
      setShowPlayerTransition(true);
      return;
    }
    
    // Start countdown when both players are done
    if (player1Tokens === 0 && player2Tokens === 0 && !showCountdown && !showPlayerTransition) {
      console.log('🎯 Triggering simulation countdown');
      setShowCountdown(true);
    }
  }, [currentPlayer, player1Tokens, player2Tokens, gameStage, showCountdown, showPlayerTransition]);

  // Simulation loop
  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        nextGeneration();
      }, 200);

      return () => {
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
      }
      
      // Update the winner state to match the actual winner
      gameState.setWinner(gameWinner);
      
      // Save game for replay
      const result = {
        winner: gameWinner,
        player1Score: scores.player1,
        player2Score: scores.player2,
        generations: generation
      };
      
      saveGame('2player', gameSettings, initialBoardState, board, result);
      setShowVictory(true);
    }
  }, [gameStage, showVictory, calculateFinalScores, board, generation, winner, saveGame, gameSettings, gameState]);

  // Use fullscreen mode during placement and simulation for mobile  
  const shouldUseFullscreen = gameStage === 'placement' || gameStage === 'simulation' || gameStage === 'paused';
  
  // Special handling for player transition - keep fullscreen but show transition modal
  if (showPlayerTransition) {
    return (
      <>
        {/* Fullscreen Game Board */}
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          isPlacementStage={gameStage === 'placement'}
          selectedCell={null}
          fullscreen={true}
        />
        
        {/* Player Transition Countdown */}
        <PlayerTransitionCountdown onTransitionComplete={handlePlayerTransitionComplete} />
      </>
    );
  }
  
  if (shouldUseFullscreen) {
    return (
      <>
        {/* Fullscreen Game Board */}
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          isPlacementStage={gameStage === 'placement'}
          selectedCell={null}
          fullscreen={true}
        />
        
        {/* Minimal UI Overlay */}
        <div className="fullscreen-ui-overlay">
          <div className="flex items-center space-x-2">
            {/* Back button */}
            <button
              onClick={onBackToMenu}
              className="retro-button text-xs px-2 py-1"
            >
              ← MENU
            </button>
            
            {/* Current player indicator */}
            {gameStage === 'placement' && (
              <div className="bg-retro-purple border border-retro-cyan px-2 py-1 font-pixel text-xs">
                P{currentPlayer + 1}: {currentPlayer === 0 ? player1Tokens : player2Tokens} LEFT
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Generation counter */}
            {(gameStage === 'simulation' || gameStage === 'paused') && (
              <div className="bg-retro-purple border border-retro-cyan px-2 py-1 font-pixel text-xs">
                GEN: {generation}
              </div>
            )}
            
            {/* Simulation controls */}
            {(gameStage === 'simulation' || gameStage === 'paused') && (
              <button
                onClick={toggleSimulation}
                className="retro-button text-xs px-2 py-1"
              >
                {isSimulating ? '⏸️' : '▶️'}
              </button>
            )}
          </div>
        </div>
        
        {/* Modals and overlays */}
        {showPlayerTransition && (
          <PlayerTransitionCountdown onTransitionComplete={handlePlayerTransitionComplete} />
        )}
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
      </>
    );
  }

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
        gameMode="2player"
        onBackToMenu={onBackToMenu}
        onToggleSimulation={toggleSimulation}
        onResetGame={handleResetGame}
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
          fullscreen={false}
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

      {/* Player Transition Countdown */}
      {showPlayerTransition && (
        <PlayerTransitionCountdown onTransitionComplete={handlePlayerTransitionComplete} />
      )}

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