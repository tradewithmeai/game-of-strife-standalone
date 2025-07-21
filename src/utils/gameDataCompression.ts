// Game Data Compression and Hashing Utilities

import { Cell } from '@/components/GameBoard';
import { GameRecord, CompressedGameRecord, PlayerMove, BoardSnapshot } from '@/types/gameRecording';

// Simple hash function for generating unique identifiers
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

// Generate a unique hash for the board placement pattern
export const generateBoardHash = (board: Cell[][]): string => {
  const placementPattern = board
    .flat()
    .filter(cell => cell.player !== null)
    .map(cell => `${cell.player}-${cell.superpowerType}`)
    .join(',');
  
  return simpleHash(placementPattern);
};

// Generate a unique hash for the entire game sequence
export const generateGameHash = (moves: PlayerMove[], settings: any): string => {
  const gameData = {
    settings: JSON.stringify(settings),
    moves: moves.map(m => `${m.player}-${m.row}-${m.col}-${m.superpowerType}`).join('|'),
    timestamp: Math.floor(Date.now() / 1000) // Round to nearest second for some collision tolerance
  };
  
  return simpleHash(JSON.stringify(gameData));
};

// Compress board data by encoding only non-empty cells
export const compressBoardSnapshot = (snapshot: BoardSnapshot): string => {
  const compressedCells: Array<{r: number, c: number, p: number | null, a: boolean, s: number, m: number}> = [];
  
  snapshot.board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell.player !== null || cell.alive || cell.superpowerType > 0) {
        compressedCells.push({
          r, c, 
          p: cell.player, 
          a: cell.alive, 
          s: cell.superpowerType, 
          m: cell.memory
        });
      }
    });
  });
  
  return JSON.stringify({
    g: snapshot.generation,
    t: snapshot.timestamp,
    c: compressedCells,
    l: snapshot.livingCells,
    sp: snapshot.superpowerCounts
  });
};

// Decompress board data back to full format
export const decompressBoardSnapshot = (compressed: string, boardSize: number): BoardSnapshot => {
  const data = JSON.parse(compressed);
  
  // Create empty board
  const board: Cell[][] = Array(boardSize).fill(null).map(() =>
    Array(boardSize).fill(null).map(() => ({
      player: null,
      alive: false,
      superpowerType: 0,
      memory: 0
    }))
  );
  
  // Restore compressed cells
  data.c.forEach((cell: any) => {
    board[cell.r][cell.c] = {
      player: cell.p,
      alive: cell.a,
      superpowerType: cell.s,
      memory: cell.m
    };
  });
  
  return {
    generation: data.g,
    timestamp: data.t,
    board,
    livingCells: data.l,
    superpowerCounts: data.sp
  };
};

// Compress entire game record
export const compressGameRecord = (record: GameRecord): CompressedGameRecord => {
  // Create a compact representation
  const compactRecord = {
    id: record.gameId,
    sid: record.sessionId,
    ts: record.timestamp,
    cfg: record.settings,
    mvs: record.moves.map(m => ({
      p: m.player,
      r: m.row,
      c: m.col,
      t: m.timestamp - record.timestamp, // Relative timestamp
      tr: m.tokensRemaining,
      sp: m.superpowerType,
      mn: m.moveNumber
    })),
    snaps: record.keyBoardSnapshots.map(s => compressBoardSnapshot(s)),
    out: record.outcome,
    met: record.metrics,
    bh: record.boardHash,
    v: record.version,
    p: record.platform,
    d: record.deviceInfo
  };
  
  const jsonString = JSON.stringify(compactRecord);
  const compressed = btoa(jsonString); // Base64 encoding (simple compression)
  
  return {
    gameId: record.gameId,
    gameHash: record.gameHash,
    compressedData: compressed,
    dataSize: jsonString.length,
    compressedSize: compressed.length,
    timestamp: record.timestamp
  };
};

// Decompress game record
export const decompressGameRecord = (compressed: CompressedGameRecord): GameRecord => {
  const jsonString = atob(compressed.compressedData);
  const compact = JSON.parse(jsonString);
  
  return {
    gameId: compact.id,
    sessionId: compact.sid,
    timestamp: compact.ts,
    settings: compact.cfg,
    moves: compact.mvs.map((m: any) => ({
      player: m.p,
      row: m.r,
      col: m.c,
      timestamp: m.t + compact.ts, // Restore absolute timestamp
      tokensRemaining: m.tr,
      superpowerType: m.sp,
      moveNumber: m.mn
    })),
    keyBoardSnapshots: compact.snaps.map((s: string) => 
      decompressBoardSnapshot(s, compact.cfg.boardSize)
    ),
    outcome: compact.out,
    metrics: compact.met,
    boardHash: compact.bh,
    gameHash: compressed.gameHash,
    version: compact.v,
    platform: compact.p,
    deviceInfo: compact.d
  };
};

// Generate unique game ID
export const generateGameId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `game_${timestamp}_${random}`;
};

// Generate unique session ID (persists across games in same session)
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${random}`;
};

// Calculate compression ratio
export const getCompressionRatio = (original: number, compressed: number): number => {
  return Math.round((1 - compressed / original) * 100);
};

// Estimate storage requirements
export const estimateStorageSize = (gamesPerDay: number, avgGameSize: number): {
  daily: string;
  monthly: string;
  yearly: string;
} => {
  const daily = gamesPerDay * avgGameSize;
  const monthly = daily * 30;
  const yearly = daily * 365;
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return {
    daily: formatBytes(daily),
    monthly: formatBytes(monthly),
    yearly: formatBytes(yearly)
  };
};