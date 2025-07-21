import React from 'react';
import { GameLogic } from './GameLogic';
import { GameSettings as GameSettingsInterface } from './GameSettings';

interface GameScreenProps {
  onBackToMenu: () => void;
  gameSettings: GameSettingsInterface;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToMenu, gameSettings }) => {
  return <GameLogic onBackToMenu={onBackToMenu} gameSettings={gameSettings} />;
};