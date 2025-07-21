
import { useState, useCallback } from 'react';
import { Cell } from '@/components/GameBoard';
import { GameSettings } from '@/components/GameSettings';
import { GameStage } from '@/types/gameTypes';

export const useGameState = (gameSettings: GameSettings) => {
  const BOARD_SIZE = gameSettings.boardSize;
  const TOKENS_PER_PLAYER = gameSettings.tokensPerPlayer;

  const [board, setBoard] = useState<Cell[][]>(() => 
    Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(null).map(() => ({ 
        player: null, 
        alive: false, 
        superpowerType: 0, 
        memory: 0 
      }))
    )
  );

  const [gameStage, setGameStage] = useState<GameStage>('placement');
  const [player1Tokens, setPlayer1Tokens] = useState(TOKENS_PER_PLAYER);
  const [player2Tokens, setPlayer2Tokens] = useState(TOKENS_PER_PLAYER);
  const [generation, setGeneration] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [boardHistory, setBoardHistory] = useState<string[]>([]);

  const resetGame = useCallback(() => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(null).map(() => ({ 
        player: null, 
        alive: false, 
        superpowerType: 0, 
        memory: 0 
      }))
    ));
    setGameStage('placement');
    setPlayer1Tokens(TOKENS_PER_PLAYER);
    setPlayer2Tokens(TOKENS_PER_PLAYER);
    setGeneration(0);
    setIsSimulating(false);
    setWinner(null);
    setBoardHistory([]);
  }, [BOARD_SIZE, TOKENS_PER_PLAYER]);

  return {
    board,
    setBoard,
    gameStage,
    setGameStage,
    player1Tokens,
    setPlayer1Tokens,
    player2Tokens,
    setPlayer2Tokens,
    generation,
    setGeneration,
    isSimulating,
    setIsSimulating,
    winner,
    setWinner,
    boardHistory,
    setBoardHistory,
    resetGame
  };
};
