
import { useCallback } from 'react';
import { Cell, MEMORY_FLAGS } from '@/components/GameBoard';
import { applySuperpowerLogic } from '@/utils/superpowerUtils';

export const useGameRules = (boardSize: number, birthRules: number[], survivalRules: number[]) => {
  const countLivingNeighbors = useCallback((board: Cell[][], row: number, col: number): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          if (board[newRow][newCol].alive) count++;
        }
      }
    }
    return count;
  }, [boardSize]);

  const getNeighborPlayers = useCallback((board: Cell[][], row: number, col: number): number[] => {
    const neighbors: number[] = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
          const neighbor = board[newRow][newCol];
          if (neighbor.alive && neighbor.player !== null) {
            neighbors.push(neighbor.player);
          }
        }
      }
    }
    return neighbors;
  }, [boardSize]);

  const determineCellOwner = useCallback((neighborPlayers: number[]): number | null => {
    if (neighborPlayers.length === 0) return null;
    
    const playerCounts: { [key: number]: number } = {};
    neighborPlayers.forEach(player => {
      playerCounts[player] = (playerCounts[player] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominantPlayer: number | null = null;
    
    Object.entries(playerCounts).forEach(([player, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantPlayer = parseInt(player);
      }
    });
    
    return dominantPlayer;
  }, []);

  const checkWinner = useCallback((board: Cell[][], generation: number) => {
    let player1Count = 0;
    let player2Count = 0;
    
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cell = board[row][col];
        if (cell.alive) {
          if (cell.player === 0) player1Count++;
          else if (cell.player === 1) player2Count++;
        }
      }
    }


    if (player1Count === 0 && player2Count === 0) return null;
    return player1Count > player2Count ? 0 : player2Count > player1Count ? 1 : null;
  }, [boardSize]);

  return {
    countLivingNeighbors,
    getNeighborPlayers,
    determineCellOwner,
    checkWinner
  };
};
