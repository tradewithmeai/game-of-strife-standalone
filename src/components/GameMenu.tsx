import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Target, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameMenuProps {
  onStartGame: () => void;
  onStartTraining: () => void;
  onShowGameSettings: () => void;
  onShowReplay: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ 
  onStartGame, 
  onStartTraining,
  onShowGameSettings,
  onShowReplay
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Primary actions - main menu options
  const primaryActions = [
    { icon: Play, label: 'START GAME', action: onShowGameSettings, color: 'text-retro-green' },
    { icon: Database, label: 'REPLAY GAMES', action: onShowReplay, color: 'text-retro-pink' },
  ];
  

  // Game type shortcuts (moved to bottom)
  const gameTypeItems = [
    { icon: Target, label: 'TRAINING MODE', action: onStartTraining, color: 'text-retro-cyan' },
    { icon: Play, label: '2 PLAYER BATTLE', action: onStartGame, color: 'text-retro-orange' },
  ];

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-b from-retro-dark via-retro-purple to-retro-blue flex flex-col items-center p-4 crt-effect overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
      {/* Title */}
      <div className="text-center mb-12 animate-slide-up">
        <h1 className="font-pixel text-3xl md:text-5xl text-retro-cyan text-glow mb-2 animate-neon-pulse">
          THE GAME OF
        </h1>
        <h2 className="font-pixel text-4xl md:text-6xl text-retro-green text-glow animate-pixel-bounce mb-3">
          STRIFE
        </h2>
        <p className="font-pixel text-xs md:text-sm text-retro-yellow text-glow">
          CELLULAR AUTOMATA BATTLE
        </p>
        <div className="mt-6 text-retro-yellow text-xs font-pixel">
          {Array.from({ length: animationPhase + 1 }, (_, i) => '■').join('')}
          <span className="opacity-50">{'□'.repeat(4 - animationPhase - 1)}</span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="w-full max-w-sm mb-8 space-y-4">
        {primaryActions.map((action, index) => (
          <button
            key={action.label}
            onClick={action.action}
            className={`retro-button w-full flex items-center justify-center gap-3 ${action.color} text-lg py-4 animate-slide-up border-2 hover:bg-opacity-80`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <action.icon size={20} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>


      {/* Sound Toggle */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-3 border-2 ${soundEnabled ? 'border-retro-green text-retro-green' : 'border-retro-red text-retro-red'} bg-retro-purple hover:bg-opacity-80 transition-colors`}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <span className="font-pixel text-xs text-retro-cyan">
          SOUND: {soundEnabled ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Game Type Shortcuts - At Bottom */}
      <div className="mt-8 w-full max-w-sm">
        <div className="text-center mb-4">
          <span className="font-pixel text-xs text-retro-gray">QUICK START</span>
        </div>
        <div className="space-y-2">
          {gameTypeItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`retro-button w-full flex items-center justify-center gap-2 ${item.color} text-xs py-2 animate-slide-up opacity-80 hover:opacity-100`}
              style={{ animationDelay: `${index * 0.1 + 0.6}s` }}
            >
              <item.icon size={14} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-4 left-4 text-retro-cyan opacity-60 text-xs font-pixel">
        LOCAL v1.0
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-retro-cyan opacity-30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      </div>
    </div>
  );
};