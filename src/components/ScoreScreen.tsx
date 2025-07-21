
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

interface ScoreScreenProps {
  onBackToMenu: () => void;
}

interface ScoreEntry {
  rank: number;
  name: string;
  score: number;
  level: number;
  date: string;
}

export const ScoreScreen: React.FC<ScoreScreenProps> = ({ onBackToMenu }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    // Simulate high scores data
    const mockScores: ScoreEntry[] = [
      { rank: 1, name: 'PLAYER1', score: 125400, level: 8, date: '2024-01-15' },
      { rank: 2, name: 'RETRO_KING', score: 98750, level: 7, date: '2024-01-14' },
      { rank: 3, name: 'PIXEL_MASTER', score: 87300, level: 6, date: '2024-01-13' },
      { rank: 4, name: 'GAME_HERO', score: 76200, level: 5, date: '2024-01-12' },
      { rank: 5, name: 'HIGH_SCORER', score: 65800, level: 5, date: '2024-01-11' },
      { rank: 6, name: 'CHAMPION', score: 54300, level: 4, date: '2024-01-10' },
      { rank: 7, name: 'LEGEND', score: 43600, level: 4, date: '2024-01-09' },
      { rank: 8, name: 'PRO_GAMER', score: 32100, level: 3, date: '2024-01-08' },
      { rank: 9, name: 'ARCADE_FAN', score: 21400, level: 3, date: '2024-01-07' },
      { rank: 10, name: 'NEWBIE', score: 12800, level: 2, date: '2024-01-06' }
    ];
    
    setScores(mockScores);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return Trophy;
      case 2: case 3: return Medal;
      default: return Award;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-retro-yellow'; // Gold
      case 2: return 'text-retro-cyan';   // Silver
      case 3: return 'text-retro-orange'; // Bronze
      default: return 'text-retro-green';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-retro-dark via-retro-purple to-retro-blue p-4 crt-effect">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToMenu}
          className="retro-button flex items-center gap-2 px-4 py-2 text-xs"
        >
          <ArrowLeft size={12} />
          BACK
        </button>
        
        <h1 className="font-pixel text-2xl text-retro-cyan text-glow animate-neon-pulse">
          HIGH SCORES
        </h1>
        
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Loading animation */}
      <div className="text-center mb-6">
        <div className="font-pixel text-xs text-retro-green">
          LOADING SCORES{'...'.slice(0, animationPhase + 1)}
        </div>
      </div>

      {/* Scores List */}
      <div className="max-w-2xl mx-auto">
        <div className="game-screen p-4">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-2 mb-4 pb-2 border-b border-retro-cyan font-pixel text-xs text-retro-yellow">
            <div>RANK</div>
            <div className="col-span-2">NAME</div>
            <div>SCORE</div>
            <div>LEVEL</div>
            <div>DATE</div>
          </div>

          {/* Score Entries */}
          <div className="space-y-2">
            {scores.map((entry, index) => {
              const RankIcon = getRankIcon(entry.rank);
              const rankColor = getRankColor(entry.rank);
              
              return (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-6 gap-2 py-2 font-pixel text-xs text-retro-cyan hover:bg-retro-purple hover:bg-opacity-30 transition-colors animate-slide-up ${
                    entry.rank <= 3 ? 'bg-retro-purple bg-opacity-20' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex items-center gap-1 ${rankColor}`}>
                    <RankIcon size={12} />
                    <span>#{entry.rank}</span>
                  </div>
                  
                  <div className="col-span-2 font-bold">
                    {entry.name}
                  </div>
                  
                  <div className="text-retro-green">
                    {entry.score.toLocaleString()}
                  </div>
                  
                  <div className="text-retro-orange">
                    {entry.level}
                  </div>
                  
                  <div className="text-retro-cyan opacity-60">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="game-screen p-3 text-center">
            <div className="font-pixel text-xs text-retro-yellow mb-1">
              TOTAL GAMES
            </div>
            <div className="font-pixel text-lg text-retro-cyan text-glow">
              247
            </div>
          </div>
          
          <div className="game-screen p-3 text-center">
            <div className="font-pixel text-xs text-retro-yellow mb-1">
              AVG SCORE
            </div>
            <div className="font-pixel text-lg text-retro-green text-glow">
              45,280
            </div>
          </div>
          
          <div className="game-screen p-3 text-center">
            <div className="font-pixel text-xs text-retro-yellow mb-1">
              BEST STREAK
            </div>
            <div className="font-pixel text-lg text-retro-orange text-glow">
              12
            </div>
          </div>
        </div>

        {/* Clear Scores Button */}
        <div className="mt-6 text-center">
          <button className="retro-button text-retro-red border-retro-red hover:bg-retro-red text-xs px-6 py-2">
            CLEAR ALL SCORES
          </button>
        </div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-retro-yellow opacity-30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
