// Game Data API Service for Database Communication

import { GameDataAPI, CompressedGameRecord } from '@/types/gameRecording';

// Configuration - replace with your actual API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api/v1'
  : 'http://localhost:3001/api/v1';

const API_ENDPOINTS = {
  UPLOAD_GAME: '/games/upload',
  UPLOAD_BATCH: '/games/upload-batch',
  CHECK_DUPLICATE: '/games/check-duplicate',
  HEALTH: '/health'
};

// HTTP utility functions
const makeRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' = 'POST', 
  data?: any
): Promise<any> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '1.0',
        'X-Client': 'game-of-strife-local'
      }
    };

    if (data && method === 'POST') {
      options.body = JSON.stringify(data);
    }

    console.log(`🌐 API Request: ${method} ${url}`);
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ API Response:`, result);
    
    return result;
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    throw error;
  }
};

// Game Data API Implementation
export class GameDataAPIService implements GameDataAPI {
  private retryCount = 3;
  private retryDelay = 1000; // 1 second

  // Upload a single game record
  async uploadGameRecord(record: CompressedGameRecord): Promise<boolean> {
    try {
      const response = await this.withRetry(() => 
        makeRequest(API_ENDPOINTS.UPLOAD_GAME, 'POST', {
          gameId: record.gameId,
          gameHash: record.gameHash,
          compressedData: record.compressedData,
          dataSize: record.dataSize,
          compressedSize: record.compressedSize,
          timestamp: record.timestamp,
          uploadTimestamp: Date.now()
        })
      );

      return response.success === true;
    } catch (error) {
      console.error('Failed to upload game record:', error);
      return false;
    }
  }

  // Upload multiple game records in a batch
  async uploadBatch(records: CompressedGameRecord[]): Promise<{ success: number; failed: number; }> {
    if (records.length === 0) {
      return { success: 0, failed: 0 };
    }

    try {
      const response = await this.withRetry(() =>
        makeRequest(API_ENDPOINTS.UPLOAD_BATCH, 'POST', {
          games: records.map(record => ({
            gameId: record.gameId,
            gameHash: record.gameHash,
            compressedData: record.compressedData,
            dataSize: record.dataSize,
            compressedSize: record.compressedSize,
            timestamp: record.timestamp,
            uploadTimestamp: Date.now()
          })),
          batchSize: records.length,
          batchTimestamp: Date.now()
        })
      );

      return {
        success: response.successCount || 0,
        failed: response.failedCount || 0
      };
    } catch (error) {
      console.error('Failed to upload batch:', error);
      return { success: 0, failed: records.length };
    }
  }

  // Check if a game already exists (prevent duplicates)
  async checkDuplicate(gameHash: string): Promise<boolean> {
    try {
      const response = await this.withRetry(() =>
        makeRequest(`${API_ENDPOINTS.CHECK_DUPLICATE}?hash=${encodeURIComponent(gameHash)}`, 'GET')
      );

      return response.exists === true;
    } catch (error) {
      console.error('Failed to check duplicate:', error);
      return false; // Assume not duplicate if check fails
    }
  }

  // Retry mechanism for network requests
  private async withRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryCount) {
        throw error;
      }

      console.log(`🔄 Retrying API request (attempt ${attempt + 1}/${this.retryCount})...`);
      
      await new Promise(resolve => 
        setTimeout(resolve, this.retryDelay * attempt)
      );
      
      return this.withRetry(operation, attempt + 1);
    }
  }

  // Test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      await makeRequest(API_ENDPOINTS.HEALTH, 'GET');
      return true;
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const gameDataAPI = new GameDataAPIService();

// Local storage fallback for offline scenarios
export class LocalStorageAPI implements GameDataAPI {
  private storageKey = 'gameDataBackup';

  async uploadGameRecord(record: CompressedGameRecord): Promise<boolean> {
    try {
      const existing = this.getStoredRecords();
      existing.push(record);
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
      console.log('💾 Stored game record locally:', record.gameId);
      return true;
    } catch (error) {
      console.error('Failed to store game record locally:', error);
      return false;
    }
  }

  async uploadBatch(records: CompressedGameRecord[]): Promise<{ success: number; failed: number; }> {
    let successCount = 0;
    
    for (const record of records) {
      const success = await this.uploadGameRecord(record);
      if (success) successCount++;
    }

    return {
      success: successCount,
      failed: records.length - successCount
    };
  }

  async checkDuplicate(gameHash: string): Promise<boolean> {
    const existing = this.getStoredRecords();
    return existing.some(record => record.gameHash === gameHash);
  }

  private getStoredRecords(): CompressedGameRecord[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve stored records:', error);
      return [];
    }
  }

  // Get all locally stored records for manual upload
  getLocalBackup(): CompressedGameRecord[] {
    return this.getStoredRecords();
  }

  // Clear local backup after successful upload
  clearLocalBackup(): void {
    localStorage.removeItem(this.storageKey);
    console.log('🗑️ Cleared local game data backup');
  }
}

export const localStorageAPI = new LocalStorageAPI();

// Hybrid API that tries remote first, falls back to local storage
export class HybridGameDataAPI implements GameDataAPI {
  constructor(
    private remoteAPI: GameDataAPIService,
    private localAPI: LocalStorageAPI
  ) {}

  async uploadGameRecord(record: CompressedGameRecord): Promise<boolean> {
    // Try remote upload first
    const remoteSuccess = await this.remoteAPI.uploadGameRecord(record);
    
    if (remoteSuccess) {
      return true;
    }

    // Fall back to local storage
    console.log('📡 Remote upload failed, storing locally as backup');
    return this.localAPI.uploadGameRecord(record);
  }

  async uploadBatch(records: CompressedGameRecord[]): Promise<{ success: number; failed: number; }> {
    // Try remote upload first
    const remoteResult = await this.remoteAPI.uploadBatch(records);
    
    // Store any failed uploads locally
    if (remoteResult.failed > 0) {
      const failedRecords = records.slice(remoteResult.success);
      await this.localAPI.uploadBatch(failedRecords);
      console.log(`📡 ${remoteResult.failed} records stored locally as backup`);
    }

    return remoteResult;
  }

  async checkDuplicate(gameHash: string): Promise<boolean> {
    // Check remote first, then local
    const remoteExists = await this.remoteAPI.checkDuplicate(gameHash);
    if (remoteExists) return true;
    
    return this.localAPI.checkDuplicate(gameHash);
  }
}

// Default API instance - uses hybrid approach
export const gameAPI = new HybridGameDataAPI(gameDataAPI, localStorageAPI);