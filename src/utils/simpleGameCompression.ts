// Simple Game Data Compression and Hashing

import { SimpleGameRecord, CompressedGameData, TokenPlacement } from '@/types/simpleGameRecording';
import { GameSettings } from '@/components/GameSettings';

// Simple hash function
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Generate hash for placement pattern (for strategy analysis)
export const generatePlacementHash = (placements: TokenPlacement[]): string => {
  const pattern = placements
    .sort((a, b) => a.moveNumber - b.moveNumber) // Ensure consistent ordering
    .map(p => `${p.player}:${p.row},${p.col}:${p.superpowerType}`)
    .join('|');
  return hashString(pattern);
};

// Generate hash for entire game (settings + placements)
export const generateGameHash = (settings: GameSettings, placements: TokenPlacement[]): string => {
  const gameData = {
    settings: {
      boardSize: settings.boardSize,
      tokensPerPlayer: settings.tokensPerPlayer,
      birthRules: settings.birthRules,
      survivalRules: settings.survivalRules,
      enabledSuperpowers: settings.enabledSuperpowers,
      superpowerPercentage: settings.superpowerPercentage
    },
    placements: placements.map(p => `${p.player}:${p.row},${p.col}:${p.superpowerType}`).join('|')
  };
  return hashString(JSON.stringify(gameData));
};

// Compress game record
export const compressGameRecord = (record: SimpleGameRecord): CompressedGameData => {
  // Create compact representation
  const compactData = {
    id: record.gameId,
    ts: record.timestamp,
    s: {
      bs: record.settings.boardSize,
      tp: record.settings.tokensPerPlayer,
      br: record.settings.birthRules,
      sr: record.settings.survivalRules,
      es: record.settings.enabledSuperpowers,
      sp: record.settings.superpowerPercentage
    },
    p: record.placements.map(p => [p.row, p.col, p.player, p.superpowerType, p.moveNumber]),
    o: {
      w: record.outcome.winner,
      s1: record.outcome.finalScores.player1,
      s2: record.outcome.finalScores.player2,
      g: record.outcome.totalGenerations,
      r: record.outcome.gameEndReason
    },
    v: record.version,
    pl: record.platform
  };

  const jsonString = JSON.stringify(compactData);
  const compressed = btoa(jsonString); // Simple base64 compression

  return {
    gameId: record.gameId,
    gameHash: record.gameHash,
    compressedData: compressed,
    originalSize: jsonString.length,
    compressedSize: compressed.length,
    timestamp: record.timestamp
  };
};

// Decompress game record (for verification/replay)
export const decompressGameRecord = (compressed: CompressedGameData): SimpleGameRecord => {
  const jsonString = atob(compressed.compressedData);
  const compact = JSON.parse(jsonString);

  return {
    gameId: compact.id,
    timestamp: compact.ts,
    settings: {
      boardSize: compact.s.bs,
      tokensPerPlayer: compact.s.tp,
      birthRules: compact.s.br,
      survivalRules: compact.s.sr,
      enabledSuperpowers: compact.s.es,
      superpowerPercentage: compact.s.sp
    },
    placements: compact.p.map((p: number[]) => ({
      row: p[0],
      col: p[1],
      player: p[2] as 0 | 1,
      superpowerType: p[3],
      moveNumber: p[4]
    })),
    outcome: {
      winner: compact.o.w,
      finalScores: {
        player1: compact.o.s1,
        player2: compact.o.s2
      },
      totalGenerations: compact.o.g,
      gameEndReason: compact.o.r
    },
    gameHash: compressed.gameHash,
    placementHash: generatePlacementHash(compact.p.map((p: number[]) => ({
      row: p[0],
      col: p[1],
      player: p[2] as 0 | 1,
      superpowerType: p[3],
      moveNumber: p[4]
    }))),
    version: compact.v,
    platform: compact.pl
  };
};

// Generate unique game ID
export const generateGameId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `game_${timestamp}_${random}`;
};

// Calculate compression ratio
export const getCompressionStats = (original: number, compressed: number) => ({
  ratio: Math.round((1 - compressed / original) * 100),
  savings: original - compressed,
  efficiency: compressed < original ? 'good' : 'poor'
});