// Simplified Game Recording for AI Training - Essential Data Only

import { GameSettings } from '@/components/GameSettings';

export interface TokenPlacement {
  row: number;
  col: number;
  player: 0 | 1;
  superpowerType: number;
  moveNumber: number; // Order of placement for strategy analysis
}

export interface GameOutcome {
  winner: 0 | 1 | null; // null for draw
  finalScores: {
    player1: number;
    player2: number;
  };
  totalGenerations: number;
  gameEndReason: 'max_generations' | 'stable_state' | 'extinction';
}

export interface SimpleGameRecord {
  gameId: string;
  timestamp: number;
  
  // Essential data for AI training
  settings: GameSettings;
  placements: TokenPlacement[];
  outcome: GameOutcome;
  
  // Optimization
  gameHash: string; // unique hash for deduplication
  placementHash: string; // hash of just the placement pattern
  
  // Metadata
  version: string;
  platform: 'web' | 'android';
}

export interface CompressedGameData {
  gameId: string;
  gameHash: string;
  compressedData: string; // Base64 encoded
  originalSize: number;
  compressedSize: number;
  timestamp: number;
}

// Simple API interface
export interface GameDataUploader {
  uploadGame(record: CompressedGameData): Promise<boolean>;
  uploadBatch(records: CompressedGameData[]): Promise<number>; // returns success count
}