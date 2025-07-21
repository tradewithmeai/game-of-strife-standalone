
import React, { useCallback } from 'react';

export interface Cell {
  player: number | null; // 0 for player 1, 1 for player 2, null for empty
  alive: boolean;
  superpowerType: number; // 0 = normal, 1-7 = different superpower types
  memory: number; // 32-bit flags for persistent memory
}

interface GameBoardProps {
  board: Cell[][];
  onCellClick?: (row: number, col: number) => void;
  isPlacementStage: boolean;
  selectedCell?: {row: number, col: number} | null;
}

// Memory bit flags
export const MEMORY_FLAGS = {
  HAS_SURVIVED_DEATH: 1 << 0,
  HAS_CAUSED_BIRTH: 1 << 1,
  IS_VETERAN: 1 << 2,
  HAS_SPREAD: 1 << 3,
  BATTLE_SCARRED: 1 << 4,
};

export const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  onCellClick,
  isPlacementStage
}) => {
  const boardSize = board.length;

  const getSuperpowerVisualClass = (superpowerType: number, memory: number) => {
    const classes = [];
    
    switch (superpowerType) {
      case 1: // Tank
        classes.push('superpower-tank');
        break;
      case 2: // Spreader
        classes.push('superpower-spreader');
        break;
      case 3: // Survivor
        classes.push('superpower-survivor');
        break;
      case 4: // Ghost
        classes.push('superpower-ghost');
        break;
      case 5: // Replicator
        classes.push('superpower-replicator');
        break;
      case 6: // Destroyer
        classes.push('superpower-destroyer');
        break;
      case 7: // Hybrid
        classes.push('superpower-hybrid');
        break;
    }

    // Add memory-based visual effects
    if (memory & MEMORY_FLAGS.IS_VETERAN) classes.push('cell-veteran');
    if (memory & MEMORY_FLAGS.HAS_CAUSED_BIRTH) classes.push('cell-spreader-glow');
    if (memory & MEMORY_FLAGS.BATTLE_SCARRED) classes.push('cell-battle-scarred');

    return classes.join(' ');
  };

  const getCellColor = (cell: Cell) => {
    let baseColor = '';
    if (!cell.alive && cell.player === null) {
      baseColor = 'bg-retro-dark border-retro-purple';
    } else if (cell.player === 0) {
      baseColor = cell.alive ? 'bg-retro-cyan' : 'bg-retro-cyan opacity-60';
    } else if (cell.player === 1) {
      baseColor = cell.alive ? 'bg-retro-green' : 'bg-retro-green opacity-60';
    } else {
      baseColor = 'bg-retro-dark border-retro-purple';
    }

    const superpowerClass = cell.superpowerType > 0 ? getSuperpowerVisualClass(cell.superpowerType, cell.memory) : '';
    return `${baseColor} ${superpowerClass}`.trim();
  };

  const getCellHover = (cell: Cell) => {
    if (!isPlacementStage) return '';
    if (cell.player !== null) return '';
    return 'hover:bg-retro-yellow hover:opacity-50 cursor-pointer';
  };

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    console.log('🖱️ GameBoard cell clicked:', { rowIndex, colIndex, isPlacementStage, hasClickHandler: !!onCellClick });
    
    if (isPlacementStage && onCellClick) {
      console.log('📞 Calling onCellClick handler');
      onCellClick(rowIndex, colIndex);
    } else {
      console.log('❌ Click ignored:', { isPlacementStage, hasClickHandler: !!onCellClick });
    }
  }, [onCellClick, isPlacementStage]);

  return (
    <div className="game-screen p-2 bg-retro-dark overflow-auto max-h-[70vh]">
      <div 
        className="grid gap-0.5 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          maxWidth: '600px',
          touchAction: 'manipulation',
          userSelect: 'none'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              data-cell={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square border border-retro-purple transition-all duration-100 pixel-art
                ${getCellColor(cell)}
                ${getCellHover(cell)}
              `}
              style={{ minWidth: '8px', minHeight: '8px' }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};
