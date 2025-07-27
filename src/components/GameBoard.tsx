
import React, { useCallback, useState, useRef, useEffect } from 'react';

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
  fullscreen?: boolean;
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
  isPlacementStage,
  fullscreen = false
}) => {
  const boardSize = board.length;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const lastPlacedCell = useRef<string | null>(null);
  
  // Removed landscape fullscreen functionality to restore core game functionality

  // Get cell coordinates from mouse/touch position with expanded hit areas
  const getCellFromPosition = useCallback((clientX: number, clientY: number): {row: number, col: number} | null => {
    if (!boardRef.current) return null;
    
    const rect = boardRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // Calculate cell size - for 600px max width
    const cellSize = Math.min(rect.width, rect.height) / boardSize;
    
    // Add tolerance for easier targeting (expand hit area by 25%)
    const tolerance = cellSize * 0.125; // 12.5% on each side = 25% total expansion
    
    const col = Math.floor((relativeX + tolerance) / cellSize);
    const row = Math.floor((relativeY + tolerance) / cellSize);
    
    // Check bounds with tolerance
    if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
      // Additional check: ensure we're not too far from the actual cell center
      const cellCenterX = (col + 0.5) * cellSize;
      const cellCenterY = (row + 0.5) * cellSize;
      const distanceX = Math.abs(relativeX - cellCenterX);
      const distanceY = Math.abs(relativeY - cellCenterY);
      
      // Allow placement if within expanded area (cellSize/2 + tolerance)
      if (distanceX <= cellSize * 0.75 && distanceY <= cellSize * 0.75) {
        return { row, col };
      }
    }
    
    return null;
  }, [boardSize]);

  // Handle token placement during drag
  const handlePlacement = useCallback((row: number, col: number) => {
    if (!isPlacementStage || !onCellClick) return;
    
    const cellKey = `${row}-${col}`;
    // Avoid placing multiple tokens on the same cell during one drag
    if (lastPlacedCell.current === cellKey) return;
    
    // Check if cell is already occupied
    if (board[row] && board[row][col] && board[row][col].player !== null) return;
    
    lastPlacedCell.current = cellKey;
    onCellClick(row, col);
  }, [isPlacementStage, onCellClick, board]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isPlacementStage) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStarted(true);
    lastPlacedCell.current = null;
    
    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell) {
      handlePlacement(cell.row, cell.col);
    }
  }, [isPlacementStage, getCellFromPosition, handlePlacement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isPlacementStage) return;
    e.preventDefault();
    
    const cell = getCellFromPosition(e.clientX, e.clientY);
    if (cell) {
      handlePlacement(cell.row, cell.col);
    }
  }, [isDragging, isPlacementStage, getCellFromPosition, handlePlacement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    lastPlacedCell.current = null;
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isPlacementStage) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStarted(true);
    lastPlacedCell.current = null;
    
    const touch = e.touches[0];
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    if (cell) {
      handlePlacement(cell.row, cell.col);
    }
  }, [isPlacementStage, getCellFromPosition, handlePlacement]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !isPlacementStage) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    if (cell) {
      handlePlacement(cell.row, cell.col);
    }
  }, [isDragging, isPlacementStage, getCellFromPosition, handlePlacement]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastPlacedCell.current = null;
  }, []);

  // Global mouse events for when dragging outside the board
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const cell = getCellFromPosition(e.clientX, e.clientY);
      if (cell) {
        handlePlacement(cell.row, cell.col);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      lastPlacedCell.current = null;
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, getCellFromPosition, handlePlacement]);

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
    
    // Only show alive cells - dead cells should be invisible (empty)
    if (cell.alive && cell.player === 0) {
      baseColor = 'bg-retro-cyan';
    } else if (cell.alive && cell.player === 1) {
      baseColor = 'bg-retro-green';
    } else {
      // Dead cells or empty cells are invisible
      baseColor = 'bg-retro-dark border-retro-purple';
    }

    const superpowerClass = cell.alive && cell.superpowerType > 0 ? getSuperpowerVisualClass(cell.superpowerType, cell.memory) : '';
    return `${baseColor} ${superpowerClass}`.trim();
  };

  const getCellHover = (cell: Cell) => {
    if (!isPlacementStage) return '';
    if (cell.player !== null) return '';
    return 'hover:bg-retro-yellow hover:opacity-50 cursor-pointer';
  };

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    // Only handle click if it wasn't part of a drag operation
    if (dragStarted) {
      setDragStarted(false);
      return;
    }
    
    if (isPlacementStage && onCellClick) {
      onCellClick(rowIndex, colIndex);
    }
  }, [onCellClick, isPlacementStage, dragStarted]);

  // Simplified fullscreen classes (no landscape-specific logic)
  const containerClass = fullscreen 
    ? "fullscreen-game-container"
    : "game-screen p-2 bg-retro-dark overflow-hidden";

  const boardClass = fullscreen
    ? "grid gap-0.5 border-2 border-retro-cyan fullscreen-game-board"
    : "grid gap-0.5 mx-auto p-1 border-2 border-retro-purple";

  const boardStyle = fullscreen
    ? {
        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
        touchAction: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none'
      }
    : {
        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
        width: 'min(95vw, min(95vh, 95vw))',
        height: 'min(95vw, min(95vh, 95vw))',
        touchAction: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none'
      };

  return (
    <div className={containerClass}>
      
      <div 
        ref={boardRef}
        className={boardClass}
        style={boardStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
