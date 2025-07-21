// Game Recorder Hook for AI Training Data Collection

import { useState, useCallback, useEffect, useRef } from 'react';
import { Cell } from '@/components/GameBoard';
import { GameSettings } from '@/components/GameSettings';
import { 
  GameRecord, 
  PlayerMove, 
  BoardSnapshot, 
  GameOutcome, 
  GamePerformanceMetrics,
  GameRecorderState,
  CompressedGameRecord
} from '@/types/gameRecording';
import { 
  generateGameId, 
  generateSessionId, 
  generateBoardHash, 
  generateGameHash,
  compressGameRecord
} from '@/utils/gameDataCompression';

const STORAGE_KEY = 'gameRecorderData';
const SESSION_KEY = 'gameSessionId';

export const useGameRecorder = () => {
  const [state, setState] = useState<GameRecorderState>({
    isRecording: false,
    currentGame: null,
    pendingUploads: [],
    stats: {
      totalGamesRecorded: 0,
      totalDataSize: 0,
      lastUploadTime: 0
    }
  });

  const sessionIdRef = useRef<string>('');
  const gameStartTimeRef = useRef<number>(0);
  const placementStartTimeRef = useRef<number>(0);
  const simulationStartTimeRef = useRef<number>(0);

  // Initialize session ID
  useEffect(() => {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    sessionIdRef.current = sessionId;

    // Load persisted data
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setState(prevState => ({ ...prevState, ...parsedData }));
      } catch (error) {
        console.error('Failed to load game recorder data:', error);
      }
    }
  }, []);

  // Persist data to localStorage
  const persistState = useCallback((newState: GameRecorderState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      pendingUploads: newState.pendingUploads,
      stats: newState.stats
    }));
  }, []);

  // Start recording a new game
  const startGameRecording = useCallback((gameSettings: GameSettings) => {
    const gameId = generateGameId();
    const timestamp = Date.now();
    
    gameStartTimeRef.current = timestamp;
    placementStartTimeRef.current = timestamp;

    const newGame: Partial<GameRecord> = {
      gameId,
      sessionId: sessionIdRef.current,
      timestamp,
      settings: { ...gameSettings },
      moves: [],
      keyBoardSnapshots: [],
      version: '1.0.0',
      platform: 'web', // Will be 'android' when deployed
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        }
      }
    };

    setState(prevState => ({
      ...prevState,
      isRecording: true,
      currentGame: newGame
    }));

    console.log('🎬 Started recording game:', gameId);
  }, []);

  // Record a player move
  const recordMove = useCallback((
    player: 0 | 1, 
    row: number, 
    col: number, 
    tokensRemaining: number,
    superpowerType: number
  ) => {
    if (!state.isRecording || !state.currentGame) return;

    const move: PlayerMove = {
      player,
      row,
      col,
      timestamp: Date.now(),
      tokensRemaining,
      superpowerType,
      moveNumber: (state.currentGame.moves?.length || 0) + 1
    };

    setState(prevState => ({
      ...prevState,
      currentGame: prevState.currentGame ? {
        ...prevState.currentGame,
        moves: [...(prevState.currentGame.moves || []), move]
      } : null
    }));

    console.log('🎯 Recorded move:', move);
  }, [state.isRecording, state.currentGame]);

  // Record board snapshot at key moments
  const recordBoardSnapshot = useCallback((
    board: Cell[][], 
    generation: number,
    reason: 'placement_complete' | 'simulation_start' | 'simulation_end' | 'key_generation'
  ) => {
    if (!state.isRecording || !state.currentGame) return;

    // Count living cells
    let player0Count = 0;
    let player1Count = 0;
    const superpowerCounts: { [key: number]: number } = {};

    board.forEach(row => {
      row.forEach(cell => {
        if (cell.alive) {
          if (cell.player === 0) player0Count++;
          else if (cell.player === 1) player1Count++;
        }
        if (cell.superpowerType > 0) {
          superpowerCounts[cell.superpowerType] = (superpowerCounts[cell.superpowerType] || 0) + 1;
        }
      });
    });

    const snapshot: BoardSnapshot = {
      generation,
      timestamp: Date.now(),
      board: board.map(row => row.map(cell => ({ ...cell }))), // Deep copy
      livingCells: {
        player0: player0Count,
        player1: player1Count,
        total: player0Count + player1Count
      },
      superpowerCounts
    };

    setState(prevState => ({
      ...prevState,
      currentGame: prevState.currentGame ? {
        ...prevState.currentGame,
        keyBoardSnapshots: [...(prevState.currentGame.keyBoardSnapshots || []), snapshot]
      } : null
    }));

    console.log(`📸 Recorded ${reason} snapshot:`, {
      generation,
      livingCells: snapshot.livingCells,
      superpowers: Object.keys(superpowerCounts).length
    });
  }, [state.isRecording, state.currentGame]);

  // Mark simulation start
  const markSimulationStart = useCallback(() => {
    simulationStartTimeRef.current = Date.now();
  }, []);

  // Finish recording and process the game
  const finishGameRecording = useCallback((
    finalBoard: Cell[][],
    outcome: GameOutcome
  ) => {
    if (!state.isRecording || !state.currentGame) return null;

    const endTime = Date.now();
    const placementDuration = simulationStartTimeRef.current - placementStartTimeRef.current;
    const simulationDuration = endTime - simulationStartTimeRef.current;
    const totalGameDuration = endTime - gameStartTimeRef.current;

    // Calculate metrics
    const moves = state.currentGame.moves || [];
    const boardSize = state.currentGame.settings?.boardSize || 40;
    const totalCells = boardSize * boardSize;
    const usedCells = finalBoard.flat().filter(cell => cell.player !== null).length;
    const superpowerCells = finalBoard.flat().filter(cell => cell.superpowerType > 0).length;

    const metrics: GamePerformanceMetrics = {
      placementDuration,
      simulationDuration,
      totalGameDuration,
      averageTimePerMove: moves.length > 0 ? placementDuration / moves.length : 0,
      boardUtilization: (usedCells / totalCells) * 100,
      superpowerUtilization: usedCells > 0 ? (superpowerCells / usedCells) * 100 : 0
    };

    // Generate hashes
    const boardHash = generateBoardHash(finalBoard);
    const gameHash = generateGameHash(moves, state.currentGame.settings);

    // Complete game record
    const completeGame: GameRecord = {
      ...state.currentGame,
      outcome,
      metrics,
      boardHash,
      gameHash
    } as GameRecord;

    // Compress the game record
    const compressedRecord = compressGameRecord(completeGame);

    // Update state
    setState(prevState => {
      const newState = {
        ...prevState,
        isRecording: false,
        currentGame: null,
        pendingUploads: [...prevState.pendingUploads, compressedRecord],
        stats: {
          totalGamesRecorded: prevState.stats.totalGamesRecorded + 1,
          totalDataSize: prevState.stats.totalDataSize + compressedRecord.dataSize,
          lastUploadTime: prevState.stats.lastUploadTime
        }
      };
      
      persistState(newState);
      return newState;
    });

    console.log('🎬 Finished recording game:', {
      gameId: completeGame.gameId,
      gameHash,
      outcome,
      metrics,
      dataSize: compressedRecord.dataSize,
      compressedSize: compressedRecord.compressedSize,
      compressionRatio: `${Math.round((1 - compressedRecord.compressedSize / compressedRecord.dataSize) * 100)}%`
    });

    return compressedRecord;
  }, [state.isRecording, state.currentGame, persistState]);

  // Cancel current recording
  const cancelRecording = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isRecording: false,
      currentGame: null
    }));
    console.log('❌ Cancelled game recording');
  }, []);

  // Clear pending uploads (after successful transmission)
  const clearPendingUploads = useCallback((gameIds: string[]) => {
    setState(prevState => {
      const newState = {
        ...prevState,
        pendingUploads: prevState.pendingUploads.filter(
          record => !gameIds.includes(record.gameId)
        ),
        stats: {
          ...prevState.stats,
          lastUploadTime: Date.now()
        }
      };
      
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  // Get current recording status
  const getRecordingStatus = useCallback(() => {
    return {
      isRecording: state.isRecording,
      currentGameId: state.currentGame?.gameId || null,
      movesRecorded: state.currentGame?.moves?.length || 0,
      snapshotsRecorded: state.currentGame?.keyBoardSnapshots?.length || 0,
      pendingUploads: state.pendingUploads.length,
      totalGamesRecorded: state.stats.totalGamesRecorded,
      totalDataSize: state.stats.totalDataSize
    };
  }, [state]);

  return {
    // Recording controls
    startGameRecording,
    recordMove,
    recordBoardSnapshot,
    markSimulationStart,
    finishGameRecording,
    cancelRecording,
    
    // Data management
    clearPendingUploads,
    
    // Status and stats
    getRecordingStatus,
    state,
    
    // Pending uploads for database transmission
    pendingUploads: state.pendingUploads
  };
};