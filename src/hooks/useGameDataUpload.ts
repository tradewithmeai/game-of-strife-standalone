// Game Data Upload Management Hook

import { useState, useCallback, useEffect, useRef } from 'react';
import { CompressedGameRecord } from '@/types/gameRecording';
import { gameAPI } from '@/services/gameDataAPI';

interface UploadState {
  isUploading: boolean;
  uploadProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  lastUploadTime: number;
  uploadErrors: string[];
  connectionStatus: 'connected' | 'disconnected' | 'checking';
}

interface UploadStats {
  totalUploaded: number;
  totalFailed: number;
  totalDataUploaded: number; // bytes
  averageUploadTime: number; // ms
  lastBatchSize: number;
}

export const useGameDataUpload = () => {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    uploadProgress: { current: 0, total: 0, percentage: 0 },
    lastUploadTime: 0,
    uploadErrors: [],
    connectionStatus: 'checking'
  });

  const [stats, setStats] = useState<UploadStats>({
    totalUploaded: 0,
    totalFailed: 0,
    totalDataUploaded: 0,
    averageUploadTime: 0,
    lastBatchSize: 0
  });

  const uploadQueueRef = useRef<CompressedGameRecord[]>([]);
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Check API connection status
  const checkConnection = useCallback(async () => {
    setState(prev => ({ ...prev, connectionStatus: 'checking' }));
    
    try {
      const isConnected = await gameAPI.checkDuplicate('test_connection');
      setState(prev => ({ 
        ...prev, 
        connectionStatus: isConnected ? 'connected' : 'disconnected' 
      }));
      return isConnected;
    } catch (error) {
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      return false;
    }
  }, []);

  // Add records to upload queue
  const queueForUpload = useCallback((records: CompressedGameRecord[]) => {
    uploadQueueRef.current = [...uploadQueueRef.current, ...records];
    console.log(`📤 Queued ${records.length} records for upload. Queue size: ${uploadQueueRef.current.length}`);
  }, []);

  // Process upload queue
  const processUploadQueue = useCallback(async () => {
    if (isProcessingRef.current || uploadQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const startTime = Date.now();
    
    // Take up to 10 records for batch upload
    const batchSize = Math.min(10, uploadQueueRef.current.length);
    const batch = uploadQueueRef.current.splice(0, batchSize);

    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: {
        current: 0,
        total: batch.length,
        percentage: 0
      }
    }));

    try {
      console.log(`📤 Uploading batch of ${batch.length} records...`);

      // Check for duplicates first
      const uniqueRecords: CompressedGameRecord[] = [];
      for (let i = 0; i < batch.length; i++) {
        const record = batch[i];
        
        setState(prev => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            current: i + 1,
            percentage: Math.round(((i + 1) / batch.length) * 50) // First 50% for duplicate checking
          }
        }));

        try {
          const isDuplicate = await gameAPI.checkDuplicate(record.gameHash);
          if (!isDuplicate) {
            uniqueRecords.push(record);
          } else {
            console.log(`⚠️ Skipping duplicate game: ${record.gameId}`);
          }
        } catch (error) {
          console.warn(`Failed to check duplicate for ${record.gameId}, including in upload`);
          uniqueRecords.push(record);
        }
      }

      // Upload unique records
      if (uniqueRecords.length > 0) {
        const result = await gameAPI.uploadBatch(uniqueRecords);
        
        const endTime = Date.now();
        const uploadTime = endTime - startTime;
        const totalDataSize = uniqueRecords.reduce((sum, record) => sum + record.dataSize, 0);

        // Update stats
        setStats(prev => ({
          totalUploaded: prev.totalUploaded + result.success,
          totalFailed: prev.totalFailed + result.failed,
          totalDataUploaded: prev.totalDataUploaded + totalDataSize,
          averageUploadTime: prev.totalUploaded > 0 
            ? (prev.averageUploadTime * prev.totalUploaded + uploadTime) / (prev.totalUploaded + result.success)
            : uploadTime,
          lastBatchSize: uniqueRecords.length
        }));

        console.log(`✅ Upload completed: ${result.success} succeeded, ${result.failed} failed`);

        if (result.failed > 0) {
          setState(prev => ({
            ...prev,
            uploadErrors: [...prev.uploadErrors, `Failed to upload ${result.failed} records`]
          }));
        }
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: {
          current: batch.length,
          total: batch.length,
          percentage: 100
        },
        lastUploadTime: Date.now(),
        connectionStatus: 'connected'
      }));

    } catch (error) {
      console.error('Upload batch failed:', error);
      
      // Put failed records back in queue
      uploadQueueRef.current.unshift(...batch);
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        connectionStatus: 'disconnected',
        uploadErrors: [...prev.uploadErrors, `Upload failed: ${error}`]
      }));

      setStats(prev => ({ ...prev, totalFailed: prev.totalFailed + batch.length }));
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Auto-upload at regular intervals
  useEffect(() => {
    // Check connection on mount
    checkConnection();

    // Set up periodic upload processing
    uploadIntervalRef.current = setInterval(() => {
      if (uploadQueueRef.current.length > 0) {
        processUploadQueue();
      }
    }, 30000); // Every 30 seconds

    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, [checkConnection, processUploadQueue]);

  // Manual upload trigger
  const uploadNow = useCallback(async () => {
    await processUploadQueue();
  }, [processUploadQueue]);

  // Clear error messages
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, uploadErrors: [] }));
  }, []);

  // Get upload status and stats
  const getUploadStatus = useCallback(() => {
    return {
      ...state,
      queueSize: uploadQueueRef.current.length,
      stats,
      hasQueuedUploads: uploadQueueRef.current.length > 0,
      estimatedUploadTime: stats.averageUploadTime * uploadQueueRef.current.length
    };
  }, [state, stats]);

  // Force retry failed uploads
  const retryFailedUploads = useCallback(async () => {
    console.log('🔄 Retrying failed uploads...');
    await processUploadQueue();
  }, [processUploadQueue]);

  // Pause/resume auto-upload
  const pauseAutoUpload = useCallback(() => {
    if (uploadIntervalRef.current) {
      clearInterval(uploadIntervalRef.current);
      uploadIntervalRef.current = null;
      console.log('⏸️ Auto-upload paused');
    }
  }, []);

  const resumeAutoUpload = useCallback(() => {
    if (!uploadIntervalRef.current) {
      uploadIntervalRef.current = setInterval(() => {
        if (uploadQueueRef.current.length > 0) {
          processUploadQueue();
        }
      }, 30000);
      console.log('▶️ Auto-upload resumed');
    }
  }, [processUploadQueue]);

  return {
    // Core functions
    queueForUpload,
    uploadNow,
    checkConnection,
    
    // Status and stats
    getUploadStatus,
    
    // Error handling
    clearErrors,
    retryFailedUploads,
    
    // Control
    pauseAutoUpload,
    resumeAutoUpload,
    
    // Current state
    isUploading: state.isUploading,
    connectionStatus: state.connectionStatus,
    queueSize: uploadQueueRef.current.length,
    uploadErrors: state.uploadErrors
  };
};