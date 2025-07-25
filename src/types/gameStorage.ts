// Simple game storage for replay functionality
export interface TokenPosition {
  row: number;
  col: number;
  player: 0 | 1;
  superpowerType: number;
}

export interface GameResult {
  winner: number | null;
  player1Score: number;
  player2Score: number;
  generations: number;
}

export interface StoredGame {
  id: string;
  timestamp: number;
  gameMode: 'training' | '2player';
  settings: {
    boardSize: number;
    tokensPerPlayer: number;
    birthRules: number[];
    survivalRules: number[];
    enabledSuperpowers: number[];
    superpowerPercentage: number;
  };
  initialBoard: TokenPosition[];  // Starting positions after token placement
  finalBoard: TokenPosition[];    // End positions after simulation
  result: GameResult;
}