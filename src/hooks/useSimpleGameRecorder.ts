// Simplified Game Recorder - Essential Data Only

import { useState, useCallback, useRef } from 'react';
import { Cell } from '@/components/GameBoard';
import { GameSettings } from '@/components/GameSettings';
import { 
  SimpleGameRecord, 
  TokenPlacement, 
  GameOutcome, 
  CompressedGameData 
} from '@/types/simpleGameRecording';
import { 
  generateGameId, 
  generateGameHash, 
  generatePlacementHash, 
  compressGameRecord 
} from '@/utils/simpleGameCompression';

interface SimpleRecorderState {
  isRecording: boolean;
  currentGame: Partial<SimpleGameRecord> | null;
  totalGamesRecorded: number;
  pendingUploads: CompressedGameData[];
}

export const useSimpleGameRecorder = () => {
  const [state, setState] = useState<SimpleRecorderState>({
    isRecording: false,
    currentGame: null,
    totalGamesRecorded: 0,
    pendingUploads: []
  });

  const moveCounterRef = useRef(0);

  // Start recording a new game
  const startRecording = useCallback((gameSettings: GameSettings) => {
    const gameId = generateGameId();
    moveCounterRef.current = 0;

    const newGame: Partial<SimpleGameRecord> = {
      gameId,
      timestamp: Date.now(),
      settings: { ...gameSettings },
      placements: [],
      version: '1.0.0',
      platform: 'web' // Will be 'android' when deployed
    };

    setState(prev => ({
      ...prev,
      isRecording: true,
      currentGame: newGame
    }));

    console.log('🎬 Started simple recording:', gameId);
    return gameId;
  }, []);

  // Record a token placement
  const recordPlacement = useCallback((
    row: number, 
    col: number, 
    player: 0 | 1, 
    superpowerType: number
  ) => {
    if (!state.isRecording || !state.currentGame) return;

    moveCounterRef.current += 1;

    const placement: TokenPlacement = {
      row,
      col,
      player,
      superpowerType,
      moveNumber: moveCounterRef.current
    };

    setState(prev => ({
      ...prev,
      currentGame: prev.currentGame ? {
        ...prev.currentGame,
        placements: [...(prev.currentGame.placements || []), placement]
      } : null
    }));

    console.log('📍 Recorded placement:', placement);
  }, [state.isRecording, state.currentGame]);

  // Finish recording with final outcome
  const finishRecording = useCallback((
    finalBoard: Cell[][], 
    winner: number | null, 
    generation: number,
    gameEndReason: 'max_generations' | 'stable_state' | 'extinction' = 'max_generations'
  ): CompressedGameData | null => {
    if (!state.isRecording || !state.currentGame || !state.currentGame.placements) {
      return null;
    }

    // Calculate final scores
    let player1Score = 0;
    let player2Score = 0;
    
    finalBoard.forEach(row => {
      row.forEach(cell => {
        if (cell.alive) {
          if (cell.player === 0) player1Score++;
          else if (cell.player === 1) player2Score++;
        }
      });
    });

    const outcome: GameOutcome = {
      winner: winner as (0 | 1 | null),
      finalScores: { player1: player1Score, player2: player2Score },
      totalGenerations: generation,
      gameEndReason
    };

    // Generate hashes
    const placementHash = generatePlacementHash(state.currentGame.placements);
    const gameHash = generateGameHash(state.currentGame.settings!, state.currentGame.placements);

    // Complete record
    const completeRecord: SimpleGameRecord = {
      ...state.currentGame,
      outcome,
      gameHash,
      placementHash
    } as SimpleGameRecord;

    // Compress
    const compressed = compressGameRecord(completeRecord);

    // Update state
    setState(prev => ({
      ...prev,
      isRecording: false,
      currentGame: null,
      totalGamesRecorded: prev.totalGamesRecorded + 1,
      pendingUploads: [...prev.pendingUploads, compressed]
    }));

    console.log('🎯 Game recording completed:', {
      gameId: completeRecord.gameId,
      gameHash,
      placements: state.currentGame.placements.length,
      outcome,
      compressionRatio: `${Math.round((1 - compressed.compressedSize / compressed.originalSize) * 100)}%`,
      dataSize: `${compressed.originalSize} -> ${compressed.compressedSize} bytes`
    });

    return compressed;
  }, [state.isRecording, state.currentGame]);

  // Cancel current recording
  const cancelRecording = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRecording: false,
      currentGame: null
    }));
    moveCounterRef.current = 0;
    console.log('❌ Cancelled recording');
  }, []);

  // Get pending uploads for transmission
  const getPendingUploads = useCallback((): CompressedGameData[] => {
    return [...state.pendingUploads];
  }, [state.pendingUploads]);

  // Clear uploaded games from pending queue
  const markUploaded = useCallback((gameIds: string[]) => {
    setState(prev => ({
      ...prev,
      pendingUploads: prev.pendingUploads.filter(
        record => !gameIds.includes(record.gameId)
      )
    }));
    console.log('✅ Marked as uploaded:', gameIds);
  }, []);

  // Get recording status
  const getStatus = useCallback(() => ({
    isRecording: state.isRecording,
    currentGameId: state.currentGame?.gameId || null,
    placementsRecorded: state.currentGame?.placements?.length || 0,
    pendingUploads: state.pendingUploads.length,
    totalGamesRecorded: state.totalGamesRecorded
  }), [state]);

  return {
    // Core recording functions
    startRecording,
    recordPlacement,
    finishRecording,
    cancelRecording,
    
    // Upload management
    getPendingUploads,
    markUploaded,
    
    // Status
    getStatus,
    isRecording: state.isRecording,
    pendingUploads: state.pendingUploads.length,
    totalGamesRecorded: state.totalGamesRecorded
  };
};