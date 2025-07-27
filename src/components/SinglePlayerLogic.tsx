import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard, Cell } from './GameBoard';
import { GameSettings as GameSettingsInterface } from './GameSettings';
import { GameHUD } from './GameHUD';
import { PhaseIndicator } from './PhaseIndicator';
import { SimulationCountdown } from './SimulationCountdown';
import { SinglePlayerVictoryModal } from './SinglePlayerVictoryModal';
import { useGameState } from '@/hooks/useGameState';
import { useGameSimulation } from '@/hooks/useGameSimulation';
import { useGameStorage } from '@/hooks/useGameStorage';
import type { GameStage } from '@/types/gameTypes';

interface SinglePlayerLogicProps {
  onBackToMenu: () => void;
  gameSettings: GameSettingsInterface;
}

export const SinglePlayerLogic: React.FC<SinglePlayerLogicProps> = ({ onBackToMenu, gameSettings }) => {
  
  const BOARD_SIZE = gameSettings.boardSize;
  const TOKENS_PER_PLAYER = gameSettings.tokensPerPlayer;
  const MAX_GENERATIONS = 100;
  const BIRTH_RULES = gameSettings.birthRules || [3];
  const SURVIVAL_RULES = gameSettings.survivalRules || [2, 3];
  const ENABLED_SUPERPOWERS = gameSettings.enabledSuperpowers || [];
  const SUPERPOWER_PERCENTAGE = gameSettings.superpowerPercentage || 20;


  const gameState = useGameState(gameSettings);
  const { saveGame } = useGameStorage();
  
  const [showCountdown, setShowCountdown] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [tokensPlaced, setTokensPlaced] = useState(0);
  const [initialBoardState, setInitialBoardState] = useState<Cell[][]>([]);

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

    // No recording needed - we'll save the complete game at the end

    // Update token count
    gameState.setPlayer1Tokens(prev => prev - 1);
    setTokensPlaced(prev => prev + 1);
  }, [gameStage, board, player1Tokens, gameState, SUPERPOWER_PERCENTAGE, ENABLED_SUPERPOWERS]);

  const handleCountdownComplete = useCallback(() => {
    // Capture initial board state before simulation starts
    setInitialBoardState(board.map(row => row.map(cell => ({ ...cell }))));
    
    setShowCountdown(false);
    gameState.setGameStage('simulation');
    gameState.setIsSimulating(true);
    gameState.setBoardHistory([]);
  }, [gameState, board]);

  const calculateFinalScore = useCallback((currentBoard: Cell[][]) => {
    let score = 0;
    let aliveCells = 0;
    let playerCells = 0;
    
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = currentBoard[row][col];
        if (cell) {
          // Only count living cells (consistent with 2-player mode)
          if (cell.alive) {
            aliveCells++;
            if (cell.player === 0) {
              score++;
            }
          }
          
          // Debug counters  
          if (cell.player !== null) playerCells++;
        }
      }
    }
    
    return score;
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
    setShowCountdown(false);
    setShowVictory(false);
    setTokensPlaced(0);
    setInitialBoardState([]);
  };

  const handlePlayAgain = () => {
    setShowVictory(false);
    handleResetGame();
  };

  const handleStartSimulation = () => {
    setShowCountdown(true);
  };
  
  // Check if player finished placing tokens
  useEffect(() => {
    console.log('🎯 SinglePlayer state check:', { player1Tokens, gameStage, showCountdown });
    if (player1Tokens === 0 && gameStage === 'placement' && !showCountdown) {
      console.log('🎯 Triggering single player simulation countdown');
      setShowCountdown(true);
    }
  }, [player1Tokens, gameStage, showCountdown]);

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
      const score = calculateFinalScore(board);
      setFinalScore(score);
      
      // Calculate survival rate
      const survivalRate = tokensPlaced > 0 ? Math.round((score / tokensPlaced) * 100) : 0;
      
      // Save game for replay
      const result = {
        winner: 0,
        player1Score: score,
        player2Score: 0,
        generations: generation
      };
      
      saveGame('training', gameSettings, initialBoardState, board, result);
      setShowVictory(true);
    }
  }, [gameStage, showVictory, calculateFinalScore, board, generation, saveGame, gameSettings, tokensPlaced, initialBoardState]);

  // Use fullscreen mode during placement and simulation for mobile
  const useFullscreen = gameStage === 'placement' || gameStage === 'simulation' || gameStage === 'paused';
  
  if (useFullscreen) {
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
            
            {/* Tokens left indicator */}
            {gameStage === 'placement' && (
              <div className="bg-retro-purple border border-retro-cyan px-2 py-1 font-pixel text-xs">
                TOKENS: {player1Tokens} LEFT
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
        gameMode="training"
        onBackToMenu={onBackToMenu}
        onToggleSimulation={toggleSimulation}
        onResetGame={handleResetGame}
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
          fullscreen={false}
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