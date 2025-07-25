import React, { useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Info, Target } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface GameSettingsProps {
  currentSettings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onCancel: () => void;
  onStartGameWithSettings?: (settings: GameSettings) => void;
  onStartTrainingWithSettings?: (settings: GameSettings) => void;
}

export interface GameSettings {
  tokensPerPlayer: number;
  boardSize: number;
  birthRules: number[];
  survivalRules: number[];
  enabledSuperpowers: number[];
  superpowerPercentage: number;
}

const SUPERPOWER_TYPES = [
  { id: 1, name: 'Tank', color: 'bg-orange-500', description: 'Extra durability, harder to kill' },
  { id: 2, name: 'Spreader', color: 'bg-yellow-500', description: 'Enhanced reproduction abilities' },
  { id: 3, name: 'Survivor', color: 'bg-red-500', description: 'Can survive harsh conditions' },
  { id: 4, name: 'Ghost', color: 'bg-pink-500', description: 'Semi-transparent, special movement' },
  { id: 5, name: 'Replicator', color: 'bg-purple-500', description: 'Fast multiplication' },
  { id: 6, name: 'Destroyer', color: 'bg-red-600', description: 'Can eliminate other cells' },
  { id: 7, name: 'Hybrid', color: 'bg-gradient-to-r from-blue-500 to-green-500', description: 'Combines multiple abilities' }
];

export const GameSettings: React.FC<GameSettingsProps> = ({ currentSettings, onSave, onCancel, onStartGameWithSettings, onStartTrainingWithSettings }) => {
  const [tokensPerPlayer, setTokensPerPlayer] = useState(currentSettings.tokensPerPlayer);
  const [boardSize, setBoardSize] = useState(currentSettings.boardSize);
  const [birthRules, setBirthRules] = useState<number[]>(currentSettings.birthRules);
  const [survivalRules, setSurvivalRules] = useState<number[]>(currentSettings.survivalRules);
  const [enabledSuperpowers, setEnabledSuperpowers] = useState<number[]>(currentSettings.enabledSuperpowers);
  const [superpowerPercentage, setSuperpowerPercentage] = useState(currentSettings.superpowerPercentage);

  // Detect which preset is currently active
  const getCurrentPreset = (): string => {
    const sorted = [...enabledSuperpowers].sort();
    if (sorted.length === 0) return 'none';
    if (sorted.length === 7 && sorted.join(',') === '1,2,3,4,5,6,7') return 'all';
    if (sorted.join(',') === '1,3') return 'defensive';
    if (sorted.join(',') === '2,5,6') return 'aggressive';
    return 'custom';
  };

  const handleStandardConwayRules = () => {
    setBirthRules([3]);
    setSurvivalRules([2, 3]);
    setEnabledSuperpowers([1, 2, 3, 4, 5, 6, 7]);
    setSuperpowerPercentage(20);
    setBoardSize(20);
    setTokensPerPlayer(20);
  };

  const handleStartGame = () => {
    const settings = {
      tokensPerPlayer,
      boardSize,
      birthRules,
      survivalRules,
      enabledSuperpowers,
      superpowerPercentage
    };
    if (onStartGameWithSettings) {
      onStartGameWithSettings(settings);
    } else {
      onSave(settings);
    }
  };

  const handleStartTraining = () => {
    const settings = {
      tokensPerPlayer,
      boardSize,
      birthRules,
      survivalRules,
      enabledSuperpowers,
      superpowerPercentage
    };
    if (onStartTrainingWithSettings) {
      onStartTrainingWithSettings(settings);
    } else {
      onSave(settings);
    }
  };

  const handleBackToMenu = () => {
    // Save settings when going back
    const settings = {
      tokensPerPlayer,
      boardSize,
      birthRules,
      survivalRules,
      enabledSuperpowers,
      superpowerPercentage
    };
    onSave(settings);
  };

  const toggleBirthRule = (rule: number) => {
    setBirthRules(prev => 
      prev.includes(rule) 
        ? prev.filter(r => r !== rule)
        : [...prev, rule].sort()
    );
  };

  const toggleSurvivalRule = (rule: number) => {
    setSurvivalRules(prev => 
      prev.includes(rule) 
        ? prev.filter(r => r !== rule)
        : [...prev, rule].sort()
    );
  };

  const toggleSuperpower = (superpowerId: number) => {
    setEnabledSuperpowers(prev => 
      prev.includes(superpowerId)
        ? prev.filter(id => id !== superpowerId)
        : [...prev, superpowerId].sort()
    );
  };

  const setSuperpowerPreset = (preset: string) => {
    switch (preset) {
      case 'all':
        setEnabledSuperpowers([1, 2, 3, 4, 5, 6, 7]);
        break;
      case 'defensive':
        setEnabledSuperpowers([1, 3]); // Tank, Survivor
        break;
      case 'aggressive':
        setEnabledSuperpowers([2, 5, 6]); // Spreader, Replicator, Destroyer
        break;
      case 'none':
        setEnabledSuperpowers([]);
        break;
      case 'random':
        const randomCount = Math.floor(Math.random() * 3) + 3; // 3-5 random powers
        const shuffled = [...SUPERPOWER_TYPES].sort(() => 0.5 - Math.random());
        setEnabledSuperpowers(shuffled.slice(0, randomCount).map(s => s.id));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-retro-dark via-retro-purple to-retro-blue flex flex-col items-center justify-center p-4 crt-effect">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-8">
        <button
          onClick={handleBackToMenu}
          className="retro-button flex items-center gap-2 px-4 py-2 text-xs"
        >
          <ArrowLeft size={12} />
          BACK
        </button>
        
        <h1 className="font-pixel text-2xl md:text-4xl text-retro-cyan text-glow">
          GAME SETTINGS
        </h1>
        
        <button
          onClick={handleStandardConwayRules}
          className="retro-button flex items-center gap-2 px-4 py-2 text-xs text-retro-green"
        >
          <RotateCcw size={12} />
          STANDARD CONWAY
        </button>
      </div>

      {/* Settings Panel */}
      <div className="bg-retro-purple border-2 border-retro-cyan p-8 rounded-lg w-full max-w-4xl space-y-8 max-h-[70vh] overflow-y-auto">
        
        {/* Tokens Per Player Setting */}
        <div className="space-y-4">
          <Label className="font-pixel text-lg text-retro-green text-glow">
            TOKENS PER PLAYER: {tokensPerPlayer}
          </Label>
          <div className="space-y-2">
            <Slider
              value={[tokensPerPlayer]}
              onValueChange={(value) => setTokensPerPlayer(value[0])}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between font-pixel text-xs text-retro-cyan">
              <span>10</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Board Size Setting */}
        <div className="space-y-4">
          <Label className="font-pixel text-lg text-retro-yellow text-glow">
            BOARD SIZE: {boardSize}x{boardSize}
          </Label>
          <div className="space-y-2">
            <Slider
              value={[boardSize]}
              onValueChange={(value) => setBoardSize(value[0])}
              max={20}
              min={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between font-pixel text-xs text-retro-cyan">
              <span>10x10</span>
              <span>20x20</span>
            </div>
          </div>
        </div>

        {/* Birth Rules Setting */}
        <div className="space-y-4">
          <Label className="font-pixel text-lg text-retro-green text-glow">
            BIRTH RULES (NEIGHBORS TO CREATE LIFE)
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(neighbors => (
              <div key={neighbors} className="flex items-center space-x-2">
                <Checkbox 
                  checked={birthRules.includes(neighbors)}
                  onCheckedChange={() => toggleBirthRule(neighbors)}
                  id={`birth-${neighbors}`}
                />
                <label 
                  htmlFor={`birth-${neighbors}`}
                  className="font-pixel text-xs text-retro-cyan cursor-pointer"
                >
                  {neighbors}
                </label>
              </div>
            ))}
          </div>
          <div className="font-pixel text-xs text-retro-yellow">
            SELECTED: {birthRules.join(', ')} | CONWAY'S: 3
          </div>
        </div>

        {/* Survival Rules Setting */}
        <div className="space-y-4">
          <Label className="font-pixel text-lg text-retro-orange text-glow">
            SURVIVAL RULES (NEIGHBORS TO STAY ALIVE)
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(neighbors => (
              <div key={neighbors} className="flex items-center space-x-2">
                <Checkbox 
                  checked={survivalRules.includes(neighbors)}
                  onCheckedChange={() => toggleSurvivalRule(neighbors)}
                  id={`survival-${neighbors}`}
                />
                <label 
                  htmlFor={`survival-${neighbors}`}
                  className="font-pixel text-xs text-retro-cyan cursor-pointer"
                >
                  {neighbors}
                </label>
              </div>
            ))}
          </div>
          <div className="font-pixel text-xs text-retro-yellow">
            SELECTED: {survivalRules.join(', ')} | CONWAY'S: 2, 3
          </div>
        </div>

        {/* Superpower Percentage */}
        <div className="space-y-4">
          <Label className="font-pixel text-lg text-retro-pink text-glow">
            SUPERPOWER SPAWN RATE: {superpowerPercentage}%
          </Label>
          <div className="space-y-2">
            <Slider
              value={[superpowerPercentage]}
              onValueChange={(value) => setSuperpowerPercentage(value[0])}
              max={50}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between font-pixel text-xs text-retro-cyan">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* Superpower Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="font-pixel text-lg text-retro-cyan text-glow">
              SUPERPOWER TYPES
            </Label>
            <Info size={16} className="text-retro-yellow" />
          </div>
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSuperpowerPreset('all')}
              className={`retro-button px-3 py-1 text-xs ${getCurrentPreset() === 'all' ? 'bg-retro-cyan text-retro-dark border-retro-cyan' : ''}`}
            >
              ALL POWERS
            </button>
            <button
              onClick={() => setSuperpowerPreset('defensive')}
              className={`retro-button px-3 py-1 text-xs ${getCurrentPreset() === 'defensive' ? 'bg-retro-cyan text-retro-dark border-retro-cyan' : ''}`}
            >
              DEFENSIVE
            </button>
            <button
              onClick={() => setSuperpowerPreset('aggressive')}
              className={`retro-button px-3 py-1 text-xs ${getCurrentPreset() === 'aggressive' ? 'bg-retro-cyan text-retro-dark border-retro-cyan' : ''}`}
            >
              AGGRESSIVE
            </button>
            <button
              onClick={() => setSuperpowerPreset('random')}
              className={`retro-button px-3 py-1 text-xs ${getCurrentPreset() === 'random' ? 'bg-retro-cyan text-retro-dark border-retro-cyan' : ''}`}
            >
              RANDOM
            </button>
            <button
              onClick={() => setSuperpowerPreset('none')}
              className={`retro-button px-3 py-1 text-xs text-retro-red ${getCurrentPreset() === 'none' ? 'bg-retro-red text-retro-dark border-retro-red' : ''}`}
            >
              NONE
            </button>
            {getCurrentPreset() === 'custom' && (
              <span className="retro-button px-3 py-1 text-xs text-retro-yellow bg-retro-yellow/20 border-retro-yellow">
                CUSTOM
              </span>
            )}
          </div>

          {/* Superpower Grid */}
          <div className="grid grid-cols-2 gap-4">
            {SUPERPOWER_TYPES.map(superpower => (
              <div key={superpower.id} className="flex items-center space-x-3 p-3 bg-retro-dark border border-retro-cyan rounded">
                <Checkbox 
                  checked={enabledSuperpowers.includes(superpower.id)}
                  onCheckedChange={() => toggleSuperpower(superpower.id)}
                  id={`superpower-${superpower.id}`}
                />
                <div className={`w-4 h-4 ${superpower.color} border border-retro-cyan`} />
                <div className="flex-1">
                  <label 
                    htmlFor={`superpower-${superpower.id}`}
                    className="font-pixel text-xs text-retro-cyan cursor-pointer block"
                  >
                    {superpower.name}
                  </label>
                  <div className="font-pixel text-xs text-retro-yellow opacity-80">
                    {superpower.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="font-pixel text-xs text-retro-yellow text-center">
            {enabledSuperpowers.length} OF 7 SUPERPOWERS ENABLED
            {enabledSuperpowers.length === 0 && " | ALL CELLS WILL BE NORMAL"}
          </div>
        </div>

        {/* Game Preview Info */}
        <div className="bg-retro-dark border border-retro-cyan p-4 rounded space-y-2">
          <div className="font-pixel text-xs text-retro-cyan text-center mb-2">
            GAME PREVIEW - 2 PLAYER BATTLE
          </div>
          <div className="grid grid-cols-2 gap-4 font-pixel text-xs">
            <div className="text-retro-green">
              <div>PLAYER 1 TOKENS:</div>
              <div className="text-lg">{tokensPerPlayer}</div>
            </div>
            <div className="text-retro-green">
              <div>PLAYER 2 TOKENS:</div>
              <div className="text-lg">{tokensPerPlayer}</div>
            </div>
            <div className="text-retro-yellow col-span-2">
              <div>BATTLEFIELD SIZE:</div>
              <div className="text-lg">{boardSize} x {boardSize} CELLS</div>
            </div>
            <div className="text-retro-cyan col-span-2">
              <div>LIFE RULES:</div>
              <div className="text-xs">BIRTH: {birthRules.join(',')} | SURVIVE: {survivalRules.join(',')}</div>
            </div>
            <div className="text-retro-pink col-span-2">
              <div>SUPERPOWERS:</div>
              <div className="text-xs">{superpowerPercentage}% SPAWN | {enabledSuperpowers.length}/7 TYPES</div>
            </div>
          </div>
        </div>

        {/* Game Mode Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleStartGame}
            className="retro-button w-full flex items-center justify-center gap-3 text-retro-green py-4 text-lg animate-pulse"
          >
            <Play size={20} />
            <span>START 2 PLAYER BATTLE</span>
          </button>
          
          <button
            onClick={handleStartTraining}
            className="retro-button w-full flex items-center justify-center gap-3 text-retro-yellow py-3 text-base"
          >
            <Target size={18} />
            <span>START TRAINING SESSION</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center font-pixel text-xs text-retro-cyan max-w-4xl">
        <div>CONFIGURE YOUR 2-PLAYER BATTLEFIELD PARAMETERS</div>
        <div className="mt-2 text-retro-yellow">
          USE "STANDARD CONWAY" TO RESET TO CLASSIC RULES | SELECT SUPERPOWERS FOR STRATEGIC GAMEPLAY
        </div>
      </div>
    </div>
  );
};
