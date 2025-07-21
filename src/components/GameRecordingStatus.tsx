// Game Recording Status Component - Shows recording and upload status

import React from 'react';
import { Database, Upload, Wifi, WifiOff, Circle, CheckCircle, AlertCircle } from 'lucide-react';

interface GameRecordingStatusProps {
  isRecording: boolean;
  movesRecorded: number;
  snapshotsRecorded: number;
  pendingUploads: number;
  isUploading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  totalGamesRecorded: number;
  className?: string;
}

export const GameRecordingStatus: React.FC<GameRecordingStatusProps> = ({
  isRecording,
  movesRecorded,
  snapshotsRecorded,
  pendingUploads,
  isUploading,
  connectionStatus,
  totalGamesRecorded,
  className = ''
}) => {
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi size={12} className="text-retro-green" />;
      case 'disconnected':
        return <WifiOff size={12} className="text-retro-red" />;
      case 'checking':
        return <Circle size={12} className="text-retro-yellow animate-pulse" />;
    }
  };

  const getRecordingIcon = () => {
    if (!isRecording) return <Database size={12} className="text-retro-gray" />;
    return <Circle size={12} className="text-retro-red animate-pulse" />;
  };

  const getUploadIcon = () => {
    if (isUploading) return <Upload size={12} className="text-retro-cyan animate-bounce" />;
    if (pendingUploads > 0) return <AlertCircle size={12} className="text-retro-yellow" />;
    return <CheckCircle size={12} className="text-retro-green" />;
  };

  return (
    <div className={`bg-retro-purple border border-retro-cyan rounded px-2 py-1 font-pixel text-xs ${className}`}>
      <div className="flex items-center gap-3 text-retro-cyan">
        
        {/* Recording Status */}
        <div className="flex items-center gap-1">
          {getRecordingIcon()}
          <span className="text-xs">
            {isRecording ? 'REC' : 'IDLE'}
          </span>
          {isRecording && (
            <span className="text-retro-yellow">
              {movesRecorded}M/{snapshotsRecorded}S
            </span>
          )}
        </div>

        {/* Upload Status */}
        <div className="flex items-center gap-1">
          {getUploadIcon()}
          <span className="text-xs">
            {isUploading ? 'UPLOAD' : pendingUploads > 0 ? `${pendingUploads}Q` : 'SYNC'}
          </span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {getConnectionIcon()}
          <span className="text-xs">
            {connectionStatus.toUpperCase()}
          </span>
        </div>

        {/* Total Games Counter */}
        {totalGamesRecorded > 0 && (
          <div className="flex items-center gap-1 text-retro-green">
            <span className="text-xs">
              {totalGamesRecorded}G
            </span>
          </div>
        )}
      </div>
    </div>
  );
};