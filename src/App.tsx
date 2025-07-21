import React, { useState } from 'react';
import { GameMenu } from './components/GameMenu';
import { GameScreen } from './components/GameScreen';
import { SinglePlayerScreen } from './components/SinglePlayerScreen';
import { GameSettings, GameSettings as GameSettingsInterface } from './components/GameSettings';
import { SettingsScreen } from './components/SettingsScreen';
import { ScoreScreen } from './components/ScoreScreen';
import './App.css';

type Screen = 'menu' | 'game' | 'training' | 'gameSettings' | 'settings' | 'scores';

// Default game settings  
const defaultGameSettings: GameSettingsInterface = {
  boardSize: 40,
  tokensPerPlayer: 50,
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
  const showSettings = () => setCurrentScreen('settings');
  const showScores = () => setCurrentScreen('scores');

  const handleSaveGameSettings = (newSettings: GameSettingsInterface) => {
    setGameSettings(newSettings);
    setCurrentScreen('menu');
  };

  const handleStartGameWithSettings = (newSettings: GameSettingsInterface) => {
    setGameSettings(newSettings);
    setCurrentScreen('game');
  };

  return (
    <div className="App">
      {currentScreen === 'menu' && (
        <GameMenu
          onStartGame={showGame}
          onStartTraining={showTraining}
          onShowSettings={showSettings}
          onShowScores={showScores}
          onShowGameSettings={showGameSettings}
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
        />
      )}
      
      {currentScreen === 'settings' && (
        <SettingsScreen onBackToMenu={showMenu} />
      )}
      
      {currentScreen === 'scores' && (
        <ScoreScreen onBackToMenu={showMenu} />
      )}
    </div>
  );
}

export default App;