import { useCallback } from 'react';
import { Cell } from '@/components/GameBoard';
import { assignSuperpower, applySuperpowerLogic } from '@/utils/superpowerUtils';
import { useGameRules } from './useGameRules';

interface UseGameSimulationProps {
  boardSize: number;
  birthRules: number[];
  survivalRules: number[];
  enabledSuperpowers: number[];
  superpowerPercentage: number;
  generation: number;
  setBoard: React.Dispatch<React.SetStateAction<Cell[][]>>;
  setGeneration: React.Dispatch<React.SetStateAction<number>>;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  setGameStage: React.Dispatch<React.SetStateAction<'placement' | 'simulation' | 'paused' | 'finished'>>;
  setWinner: React.Dispatch<React.SetStateAction<number | null>>;
  setBoardHistory: React.Dispatch<React.SetStateAction<string[]>>;
  maxGenerations: number;
}

export const useGameSimulation = ({
  boardSize,
  birthRules,
  survivalRules,
  enabledSuperpowers,
  superpowerPercentage,
  generation,
  setBoard,
  setGeneration,
  setIsSimulating,
  setGameStage,
  setWinner,
  setBoardHistory,
  maxGenerations
}: UseGameSimulationProps) => {
  const { countLivingNeighbors, getNeighborPlayers, determineCellOwner, checkWinner } = useGameRules(
    boardSize,
    birthRules,
    survivalRules
  );

  const boardToString = useCallback((board: Cell[][]) => {
    return board.map(row => 
      row.map(cell => `${cell.player}-${cell.alive}-${cell.superpowerType}`).join(',')
    ).join('|');
  }, []);

  const nextGeneration = useCallback(() => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => row.map(cell => ({ ...cell })));
      let changesCount = 0;
      
      for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
          const cell = prevBoard[row][col];
          const livingNeighbors = countLivingNeighbors(prevBoard, row, col);
          const neighborPlayers = getNeighborPlayers(prevBoard, row, col);
          
          let shouldLive = false;
          let newMemory = cell.memory;

          // Apply superpower logic with birth/survival rules
          if (cell.superpowerType > 0) {
            const superpowerResult = applySuperpowerLogic(cell, livingNeighbors, birthRules, survivalRules);
            shouldLive = superpowerResult.shouldLive;
            newMemory = superpowerResult.newMemory;
          } else {
            // Standard Conway's Game of Life rules
            if (cell.alive) {
              shouldLive = survivalRules.includes(livingNeighbors);
            } else {
              shouldLive = birthRules.includes(livingNeighbors);
            }
          }

          // Update cell state
          if (shouldLive !== cell.alive) {
            newBoard[row][col].alive = shouldLive;
            changesCount++;

            if (shouldLive && !cell.alive) {
              // Cell birth - determine owner and inherit/assign superpower
              const newOwner = determineCellOwner(neighborPlayers);
              newBoard[row][col].player = newOwner;
              
              // For cell birth, assign superpower if none exists and owner is valid
              if (newBoard[row][col].superpowerType === 0 && newOwner !== null) {
                newBoard[row][col].superpowerType = assignSuperpower(enabledSuperpowers, superpowerPercentage);
              }
              // If cell already has a superpower type from superpower logic (like Ghost phasing in), keep it
              // Memory will be updated below from the superpower logic result
            } else if (!shouldLive && cell.alive) {
              // Cell death - completely reset the cell
              newBoard[row][col].player = null;
              newBoard[row][col].superpowerType = 0;
              newBoard[row][col].memory = 0;
            }
          }

          // Update memory only for living cells
          if (newBoard[row][col].alive) {
            newBoard[row][col].memory = newMemory;
          }
        }
      }
      
      
      // Check for game end conditions
      const boardString = boardToString(newBoard);
      setBoardHistory(prev => {
        const newHistory = [...prev, boardString];
        
        // Check for loops (if current state matches any previous state)
        if (prev.includes(boardString)) {
          setIsSimulating(false);
          setGameStage('finished');
          const finalWinner = checkWinner(newBoard, generation + 1);
          setWinner(finalWinner);
          return newHistory;
        }
        
        // Keep only last 10 states for loop detection
        return newHistory.slice(-10);
      });
      
      // Check if simulation has come to rest (no changes)
      if (changesCount === 0) {
        setIsSimulating(false);
        setGameStage('finished');
        const finalWinner = checkWinner(newBoard, generation + 1);
        setWinner(finalWinner);
      }
      
      return newBoard;
    });
    
    setGeneration(prev => {
      const newGen = prev + 1;
      
      
      // Check for max generations
      if (newGen >= maxGenerations) {
        setIsSimulating(false);
        setGameStage('finished');
        // Determine winner based on current board state
        setTimeout(() => {
          setBoard(currentBoard => {
            const finalWinner = checkWinner(currentBoard, newGen);
            setWinner(finalWinner);
            return currentBoard;
          });
        }, 0);
      }
      return newGen;
    });
  }, [
    countLivingNeighbors,
    getNeighborPlayers,
    determineCellOwner,
    checkWinner,
    boardToString,
    boardSize,
    maxGenerations,
    birthRules,
    survivalRules,
    generation,
    enabledSuperpowers,
    superpowerPercentage,
    setBoard,
    setBoardHistory,
    setIsSimulating,
    setGameStage,
    setWinner,
    setGeneration
  ]);

  return {
    nextGeneration
  };
};
