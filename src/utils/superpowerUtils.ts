
import { Cell, MEMORY_FLAGS } from '@/components/GameBoard';

export const assignSuperpower = (enabledSuperpowers: number[], superpowerPercentage: number): number => {
  if (enabledSuperpowers.length === 0 || Math.random() >= superpowerPercentage / 100) {
    return 0; // Normal cell
  }
  // Pick a random superpower from enabled ones
  const randomIndex = Math.floor(Math.random() * enabledSuperpowers.length);
  return enabledSuperpowers[randomIndex];
};

export const setMemoryFlag = (memory: number, flag: number): number => {
  return memory | flag;
};

export const hasMemoryFlag = (memory: number, flag: number): boolean => {
  return (memory & flag) !== 0;
};

export const applySuperpowerLogic = (cell: Cell, livingNeighbors: number, birthRules: number[], survivalRules: number[]): { shouldLive: boolean, newMemory: number } => {
  let shouldLive = cell.alive;
  let newMemory = cell.memory;

  // Apply superpower modifications to standard Conway rules
  switch (cell.superpowerType) {
    case 1: // Tank - Extra durability, harder to kill
      if (cell.alive) {
        shouldLive = survivalRules.includes(livingNeighbors) || livingNeighbors >= 1;
        if (shouldLive && !survivalRules.includes(livingNeighbors)) {
          newMemory = setMemoryFlag(newMemory, MEMORY_FLAGS.HAS_SURVIVED_DEATH);
        }
      } else {
        shouldLive = birthRules.includes(livingNeighbors);
      }
      break;
      
    case 2: // Spreader - Enhanced reproduction abilities
      if (cell.alive) {
        shouldLive = survivalRules.includes(livingNeighbors);
      } else {
        // Can birth with fewer neighbors than normal
        shouldLive = birthRules.includes(livingNeighbors) || livingNeighbors >= 2;
        if (shouldLive && !birthRules.includes(livingNeighbors)) {
          newMemory = setMemoryFlag(newMemory, MEMORY_FLAGS.HAS_SPREAD);
        }
      }
      break;
      
    case 3: // Survivor - Can survive harsh conditions
      if (cell.alive) {
        // Much better survival - can survive with any neighbors or in isolation
        shouldLive = survivalRules.includes(livingNeighbors) || livingNeighbors <= 1 || livingNeighbors >= 6;
        if (shouldLive && !survivalRules.includes(livingNeighbors)) {
          newMemory = setMemoryFlag(newMemory, MEMORY_FLAGS.IS_VETERAN);
        }
      } else {
        shouldLive = birthRules.includes(livingNeighbors);
      }
      break;
      
    case 4: // Ghost - Semi-transparent, special movement
      if (cell.alive) {
        shouldLive = survivalRules.includes(livingNeighbors);
        // Sometimes randomly dies (phases out)
        if (shouldLive && Math.random() < 0.05) {
          shouldLive = false;
        }
      } else {
        shouldLive = birthRules.includes(livingNeighbors);
        // Sometimes randomly comes alive (phases in)
        if (!shouldLive && livingNeighbors > 0 && Math.random() < 0.1) {
          shouldLive = true;
        }
      }
      break;
      
    case 5: // Replicator - Fast multiplication
      if (cell.alive) {
        shouldLive = survivalRules.includes(livingNeighbors);
      } else {
        // Enhanced birth conditions
        shouldLive = birthRules.includes(livingNeighbors) || (livingNeighbors >= 2 && Math.random() < 0.3);
      }
      break;
      
    case 6: // Destroyer - Can eliminate other cells
      if (cell.alive) {
        // Very robust survival
        shouldLive = survivalRules.includes(livingNeighbors) || livingNeighbors >= 1;
        newMemory = setMemoryFlag(newMemory, MEMORY_FLAGS.BATTLE_SCARRED);
      } else {
        shouldLive = birthRules.includes(livingNeighbors);
      }
      break;
      
    case 7: // Hybrid - Combines multiple abilities
      if (cell.alive) {
        // Combines Tank + Survivor abilities
        shouldLive = survivalRules.includes(livingNeighbors) || livingNeighbors >= 1 || livingNeighbors <= 1;
        if (shouldLive && !survivalRules.includes(livingNeighbors)) {
          newMemory = setMemoryFlag(newMemory, MEMORY_FLAGS.IS_VETERAN | MEMORY_FLAGS.HAS_SURVIVED_DEATH);
        }
      } else {
        // Combines Spreader birth ability
        shouldLive = birthRules.includes(livingNeighbors) || livingNeighbors >= 2;
        if (shouldLive && !birthRules.includes(livingNeighbors)) {
          newMemory = setMemoryFlag(newMemory, MEMORY_FLAGS.HAS_SPREAD);
        }
      }
      break;
      
    default:
      // Normal cells follow standard rules
      if (cell.alive) {
        shouldLive = survivalRules.includes(livingNeighbors);
      } else {
        shouldLive = birthRules.includes(livingNeighbors);
      }
      break;
  }

  return { shouldLive, newMemory };
};
