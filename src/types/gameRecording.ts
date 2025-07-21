// Game Recording System Types for AI Training Data Collection

import { Cell } from '@/components/GameBoard';
import { GameSettings } from '@/components/GameSettings';

export interface PlayerMove {
  player: 0 | 1;
  row: number;
  col: number;
  timestamp: number;
  tokensRemaining: number;
  superpowerType: number;
  moveNumber: number;
}

export interface BoardSnapshot {
  generation: number;
  timestamp: number;
  board: Cell[][];
  livingCells: {
    player0: number;
    player1: number;
    total: number;
  };
  superpowerCounts: {
    [superpowerType: number]: number;
  };
}

export interface GameOutcome {
  winner: 0 | 1 | null; // null for draw
  finalScores: {
    player1: number;
    player2: number;
  };
  totalGenerations: number;
  gameEndReason: 'max_generations' | 'stable_state' | 'extinction' | 'manual_stop';
}

export interface GamePerformanceMetrics {
  placementDuration: number; // ms
  simulationDuration: number; // ms
  totalGameDuration: number; // ms
  averageTimePerMove: number;
  boardUtilization: number; // percentage of board used
  superpowerUtilization: number; // percentage of tokens with superpowers
}

export interface GameRecord {
  // Unique identifiers
  gameId: string;
  sessionId: string;
  timestamp: number;
  
  // Game configuration
  settings: GameSettings;
  
  // Gameplay data
  moves: PlayerMove[];
  keyBoardSnapshots: BoardSnapshot[]; // snapshots at key points
  outcome: GameOutcome;
  
  // AI training data
  metrics: GamePerformanceMetrics;
  boardHash: string; // unique hash of initial placement pattern
  gameHash: string; // hash of entire game sequence
  
  // Metadata
  version: string;
  platform: 'web' | 'android' | 'ios';
  deviceInfo?: {
    userAgent?: string;
    screenSize?: { width: number; height: number };
  };
}

export interface CompressedGameRecord {
  gameId: string;
  gameHash: string;
  compressedData: string; // Base64 encoded compressed JSON
  dataSize: number; // original size in bytes
  compressedSize: number; // compressed size in bytes
  timestamp: number;
}

export interface GameRecorderState {
  isRecording: boolean;
  currentGame: Partial<GameRecord> | null;
  pendingUploads: CompressedGameRecord[];
  stats: {
    totalGamesRecorded: number;
    totalDataSize: number;
    lastUploadTime: number;
  };
}

// Database API interfaces
export interface GameDataAPI {
  uploadGameRecord(record: CompressedGameRecord): Promise<boolean>;
  uploadBatch(records: CompressedGameRecord[]): Promise<{ success: number; failed: number; }>;
  checkDuplicate(gameHash: string): Promise<boolean>;
}

// Utility types for data analysis
export interface GamePattern {
  boardHash: string;
  frequency: number;
  averageWinRate: { player1: number; player2: number; };
  commonOutcomes: GameOutcome[];
}

export interface MovePattern {
  moveSequence: { row: number; col: number; }[];
  frequency: number;
  successRate: number;
  averageOutcome: GameOutcome;
}