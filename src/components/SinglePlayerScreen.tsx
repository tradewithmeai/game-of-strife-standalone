import React from 'react';
import { SinglePlayerLogic } from './SinglePlayerLogic';
import { GameSettings as GameSettingsInterface } from './GameSettings';

interface SinglePlayerScreenProps {
  onBackToMenu: () => void;
  gameSettings: GameSettingsInterface;
}

export const SinglePlayerScreen: React.FC<SinglePlayerScreenProps> = ({ onBackToMenu, gameSettings }) => {
  return <SinglePlayerLogic onBackToMenu={onBackToMenu} gameSettings={gameSettings} />;
};