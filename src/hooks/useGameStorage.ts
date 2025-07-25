// Simple game storage hook
import { useCallback } from 'react';
import { StoredGame, TokenPosition, GameResult } from '@/types/gameStorage';
import { GameSettings } from '@/components/GameSettings';
import { Cell } from '@/components/GameBoard';

const STORAGE_KEY = 'stored-games';

export const useGameStorage = () => {
  
  const saveGame = useCallback((
    gameMode: 'training' | '2player',
    settings: GameSettings,
    initialBoard: Cell[][],
    finalBoard: Cell[][],
    result: GameResult
  ) => {
    // Extract token positions from initial board (right after placement phase)
    const initialPositions: TokenPosition[] = [];
    for (let row = 0; row < settings.boardSize; row++) {
      for (let col = 0; col < settings.boardSize; col++) {
        const cell = initialBoard[row][col];
        if (cell.player !== null && cell.alive) {
          initialPositions.push({
            row,
            col,
            player: cell.player,
            superpowerType: cell.superpowerType
          });
        }
      }
    }

    // Extract positions from final board (after simulation)
    const finalPositions: TokenPosition[] = [];
    for (let row = 0; row < settings.boardSize; row++) {
      for (let col = 0; col < settings.boardSize; col++) {
        const cell = finalBoard[row][col];
        if (cell.player !== null && cell.alive) {
          finalPositions.push({
            row,
            col,
            player: cell.player,
            superpowerType: cell.superpowerType
          });
        }
      }
    }

    const storedGame: StoredGame = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      gameMode,
      settings: {
        boardSize: settings.boardSize,
        tokensPerPlayer: settings.tokensPerPlayer,
        birthRules: settings.birthRules,
        survivalRules: settings.survivalRules,
        enabledSuperpowers: settings.enabledSuperpowers,
        superpowerPercentage: settings.superpowerPercentage
      },
      initialBoard: initialPositions,
      finalBoard: finalPositions,
      result
    };

    try {
      const existingGames = getStoredGames();
      const updatedGames = [...existingGames, storedGame];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGames));
      return true;
    } catch (error) {
      console.error('❌ Failed to save game:', error);
      return false;
    }
  }, []);

  const getStoredGames = useCallback((): StoredGame[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to load games:', error);
      return [];
    }
  }, []);

  const clearAllGames = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    saveGame,
    getStoredGames,
    clearAllGames
  };
};