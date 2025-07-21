
import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Gamepad2, Smartphone } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface SettingsScreenProps {
  onBackToMenu: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBackToMenu }) => {
  const { isMobile, getButtonClasses, getSpacingClasses, getContainerClasses, getTextClasses } = useResponsive();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [difficulty, setDifficulty] = useState('normal');
  const [controlScheme, setControlScheme] = useState('touch');

  const settingOptions = [
    {
      label: 'SOUND EFFECTS',
      value: soundEnabled,
      onChange: setSoundEnabled,
      icon: soundEnabled ? Volume2 : VolumeX,
      color: soundEnabled ? 'text-retro-green' : 'text-retro-red'
    },
    {
      label: 'BACKGROUND MUSIC',
      value: musicEnabled,
      onChange: setMusicEnabled,
      icon: musicEnabled ? Volume2 : VolumeX,
      color: musicEnabled ? 'text-retro-green' : 'text-retro-red'
    },
    {
      label: 'VIBRATION',
      value: vibrationEnabled,
      onChange: setVibrationEnabled,
      icon: Smartphone,
      color: vibrationEnabled ? 'text-retro-green' : 'text-retro-red'
    }
  ];

  const difficultyLevels = ['easy', 'normal', 'hard', 'nightmare'];
  const controlSchemes = ['touch', 'tilt', 'hybrid'];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-retro-dark via-retro-purple to-retro-blue ${getContainerClasses()} crt-effect`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-6' : 'mb-8'}`}>
        <button
          onClick={onBackToMenu}
          className={getButtonClasses("retro-button flex items-center gap-2")}
        >
          <ArrowLeft size={isMobile ? 16 : 12} />
          BACK
        </button>
        
        <h1 className={`font-pixel ${isMobile ? 'text-xl' : 'text-2xl'} text-retro-cyan text-glow`}>
          SETTINGS
        </h1>
        
        <div className={isMobile ? "w-16" : "w-20"} /> {/* Spacer */}
      </div>

      <div className={`${isMobile ? 'max-w-full' : 'max-w-md'} mx-auto ${getSpacingClasses()}`}>
        {/* Audio Settings */}
        <div className={`game-screen ${getContainerClasses()}`}>
          <h2 className={`font-pixel ${getTextClasses()} text-retro-yellow ${isMobile ? 'mb-6' : 'mb-4'} text-glow`}>
            AUDIO OPTIONS
          </h2>
          
          {settingOptions.map((setting) => (
            <div key={setting.label} className={`flex items-center justify-between ${isMobile ? 'mb-6' : 'mb-3'}`}>
              <div className="flex items-center gap-3">
                <setting.icon size={isMobile ? 20 : 16} className={setting.color} />
                <span className={`font-pixel ${getTextClasses()} text-retro-cyan`}>
                  {setting.label}
                </span>
              </div>
              
              <button
                onClick={() => setting.onChange(!setting.value)}
                className={getButtonClasses(`font-pixel border-2 transition-colors ${
                  setting.value 
                    ? 'border-retro-green text-retro-green bg-retro-green bg-opacity-20' 
                    : 'border-retro-red text-retro-red bg-retro-red bg-opacity-20'
                }`)}
              >
                {setting.value ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </div>

        {/* Difficulty Settings */}
        <div className={`game-screen ${getContainerClasses()}`}>
          <h2 className={`font-pixel ${getTextClasses()} text-retro-yellow ${isMobile ? 'mb-6' : 'mb-4'} text-glow`}>
            DIFFICULTY
          </h2>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} ${isMobile ? 'gap-3' : 'gap-2'}`}>
            {difficultyLevels.map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={getButtonClasses(`font-pixel border-2 transition-colors ${
                  difficulty === level
                    ? 'border-retro-cyan text-retro-cyan bg-retro-cyan bg-opacity-20'
                    : 'border-retro-purple text-retro-cyan hover:border-retro-cyan'
                }`)}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Control Settings */}
        <div className={`game-screen ${getContainerClasses()}`}>
          <h2 className={`font-pixel ${getTextClasses()} text-retro-yellow ${isMobile ? 'mb-6' : 'mb-4'} text-glow`}>
            CONTROLS
          </h2>
          
          <div className={getSpacingClasses()}>
            {controlSchemes.map((scheme) => (
              <button
                key={scheme}
                onClick={() => setControlScheme(scheme)}
                className={getButtonClasses(`w-full font-pixel border-2 transition-colors flex items-center gap-3 justify-center ${
                  controlScheme === scheme
                    ? 'border-retro-green text-retro-green bg-retro-green bg-opacity-20'
                    : 'border-retro-purple text-retro-cyan hover:border-retro-cyan'
                }`)}
              >
                <Gamepad2 size={isMobile ? 18 : 14} />
                {scheme.toUpperCase()} CONTROL
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button 
          className={getButtonClasses("retro-button w-full text-retro-orange border-retro-orange hover:bg-retro-orange")}
          style={{ marginTop: isMobile ? '24px' : '32px' }}
        >
          RESET TO DEFAULTS
        </button>

        {/* Info */}
        <div className={`text-center ${isMobile ? 'mt-6' : 'mt-6'} font-pixel ${getTextClasses()} text-retro-cyan opacity-60`}>
          CHANGES SAVED AUTOMATICALLY
        </div>
      </div>

      {/* Animated background elements - fewer on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: isMobile ? 4 : 8 }, (_, i) => (
          <div
            key={i}
            className={`absolute ${isMobile ? 'w-3 h-3' : 'w-2 h-2'} border border-retro-cyan opacity-20 animate-ping`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
