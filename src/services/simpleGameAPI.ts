// Simple Game Data API - Clean and Focused

import { CompressedGameData } from '@/types/simpleGameRecording';

// Configuration
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-game-api.com/api' 
    : 'http://localhost:3001/api',
  endpoints: {
    uploadGame: '/games/upload',
    uploadBatch: '/games/batch',
    checkDuplicate: '/games/exists'
  },
  retries: 3,
  timeout: 10000
};

// Simple HTTP client
const apiRequest = async (endpoint: string, data?: any): Promise<any> => {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Game-Version': '1.0.0',
        'X-Platform': 'web'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Main API class
export class SimpleGameAPI {
  // Upload single game
  async uploadGame(gameData: CompressedGameData): Promise<boolean> {
    try {
      const response = await apiRequest(API_CONFIG.endpoints.uploadGame, {
        gameId: gameData.gameId,
        gameHash: gameData.gameHash,
        data: gameData.compressedData,
        originalSize: gameData.originalSize,
        compressedSize: gameData.compressedSize,
        timestamp: gameData.timestamp
      });
      
      console.log('📤 Game uploaded:', gameData.gameId);
      return response.success === true;
    } catch (error) {
      console.error('Upload failed:', error);
      return false;
    }
  }

  // Upload batch of games
  async uploadBatch(games: CompressedGameData[]): Promise<number> {
    if (games.length === 0) return 0;

    try {
      const response = await apiRequest(API_CONFIG.endpoints.uploadBatch, {
        games: games.map(game => ({
          gameId: game.gameId,
          gameHash: game.gameHash,
          data: game.compressedData,
          originalSize: game.originalSize,
          compressedSize: game.compressedSize,
          timestamp: game.timestamp
        })),
        batchSize: games.length
      });

      const successCount = response.successCount || 0;
      console.log(`📤 Batch upload: ${successCount}/${games.length} succeeded`);
      return successCount;
    } catch (error) {
      console.error('Batch upload failed:', error);
      return 0;
    }
  }

  // Check if game already exists (prevent duplicates)
  async gameExists(gameHash: string): Promise<boolean> {
    try {
      const response = await apiRequest(`${API_CONFIG.endpoints.checkDuplicate}?hash=${gameHash}`);
      return response.exists === true;
    } catch (error) {
      console.warn('Duplicate check failed:', error);
      return false; // Assume doesn't exist if check fails
    }
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      await apiRequest('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Local storage fallback
export class LocalGameStorage {
  private storageKey = 'gameDataQueue';

  // Store games locally
  storeGames(games: CompressedGameData[]): void {
    try {
      const existing = this.getStoredGames();
      const updated = [...existing, ...games];
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      console.log(`💾 Stored ${games.length} games locally. Total: ${updated.length}`);
    } catch (error) {
      console.error('Local storage failed:', error);
    }
  }

  // Get stored games
  getStoredGames(): CompressedGameData[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to read local storage:', error);
      return [];
    }
  }

  // Remove games from storage
  removeGames(gameIds: string[]): void {
    try {
      const existing = this.getStoredGames();
      const filtered = existing.filter(game => !gameIds.includes(game.gameId));
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      console.log(`🗑️ Removed ${gameIds.length} games from local storage`);
    } catch (error) {
      console.error('Failed to remove from local storage:', error);
    }
  }

  // Clear all stored games
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
    console.log('🗑️ Cleared all local game data');
  }
}

// Hybrid uploader (tries API first, falls back to local storage)
export class GameDataUploader {
  constructor(
    private api = new SimpleGameAPI(),
    private localStorage = new LocalGameStorage()
  ) {}

  // Upload with fallback
  async uploadGames(games: CompressedGameData[]): Promise<{
    uploaded: number;
    stored: number;
    failed: number;
  }> {
    if (games.length === 0) {
      return { uploaded: 0, stored: 0, failed: 0 };
    }

    // Try API upload first
    const uploadedCount = await this.api.uploadBatch(games);
    
    if (uploadedCount === games.length) {
      // All uploaded successfully
      return { uploaded: uploadedCount, stored: 0, failed: 0 };
    }

    // Some failed - store failed ones locally
    const failedGames = games.slice(uploadedCount);
    this.localStorage.storeGames(failedGames);
    
    return { 
      uploaded: uploadedCount, 
      stored: failedGames.length, 
      failed: 0 
    };
  }

  // Retry locally stored games
  async retryStoredGames(): Promise<number> {
    const storedGames = this.localStorage.getStoredGames();
    if (storedGames.length === 0) return 0;

    console.log(`🔄 Retrying ${storedGames.length} stored games...`);
    const uploadedCount = await this.api.uploadBatch(storedGames);
    
    if (uploadedCount > 0) {
      // Remove successfully uploaded games
      const uploadedGames = storedGames.slice(0, uploadedCount);
      this.localStorage.removeGames(uploadedGames.map(g => g.gameId));
    }

    return uploadedCount;
  }

  // Get queue status
  getQueueStatus() {
    const stored = this.localStorage.getStoredGames();
    return {
      pendingCount: stored.length,
      totalSize: stored.reduce((sum, game) => sum + game.compressedSize, 0),
      oldestGame: stored.length > 0 ? new Date(Math.min(...stored.map(g => g.timestamp))) : null
    };
  }
}

// Default instance
export const gameUploader = new GameDataUploader();