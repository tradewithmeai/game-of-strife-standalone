import React, { useState } from 'react';
import { GameMenu } from './components/GameMenu';
import { GameScreen } from './components/GameScreen';
import { SinglePlayerScreen } from './components/SinglePlayerScreen';
import { GameSettings, GameSettings as GameSettingsInterface } from './components/GameSettings';
import ReplayModeScreen from './components/ReplayModeScreen';
import './App.css';

type Screen = 'menu' | 'game' | 'training' | 'gameSettings' | 'replay';

// Default game settings  
const defaultGameSettings: GameSettingsInterface = {
  boardSize: 20,
  tokensPerPlayer: 20,
  birthRules: [3],
  survivalRules: [2, 3],
  enabledSuperpowers: [],
  superpowerPercentage: 20
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [gameSettings, setGameSettings] = useState<GameSettingsInterface>(defaultGameSettings);

  const showMenu = () => setCurrentScreen('menu');
  const showGame = () => setCurrentScreen('game');
  const showTraining = () => setCurrentScreen('training');
  const showGameSettings = () => setCurrentScreen('gameSettings');
  const showReplay = () => setCurrentScreen('replay');

  const handleSaveGameSettings = (newSettings: GameSettingsInterface) => {
    setGameSettings(newSettings);
    setCurrentScreen('menu');
  };

  const handleStartGameWithSettings = (newSettings: GameSettingsInterface) => {
    setGameSettings(newSettings);
    setCurrentScreen('game');
  };

  const handleStartTrainingWithSettings = (newSettings: GameSettingsInterface) => {
    setGameSettings(newSettings);
    setCurrentScreen('training');
  };

  return (
    <div className="App">
      {currentScreen === 'menu' && (
        <GameMenu
          onStartGame={showGame}
          onStartTraining={showTraining}
          onShowGameSettings={showGameSettings}
          onShowReplay={showReplay}
        />
      )}
      
      {currentScreen === 'game' && (
        <GameScreen
          onBackToMenu={showMenu}
          gameSettings={gameSettings}
        />
      )}
      
      {currentScreen === 'training' && (
        <SinglePlayerScreen
          onBackToMenu={showMenu}
          gameSettings={gameSettings}
        />
      )}
      
      {currentScreen === 'gameSettings' && (
        <GameSettings
          currentSettings={gameSettings}
          onSave={handleSaveGameSettings}
          onCancel={showMenu}
          onStartGameWithSettings={handleStartGameWithSettings}
          onStartTrainingWithSettings={handleStartTrainingWithSettings}
        />
      )}
      
      
      {currentScreen === 'replay' && (
        <ReplayModeScreen onBack={showMenu} />
      )}
    </div>
  );
}

export default App;