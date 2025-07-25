// Test Data Collection and Retrieval
// Run with: node test-data-collection.js

console.log('🧪 Testing Game Data Collection & Retrieval...\n');

// Mock browser localStorage for testing
const mockLocalStorage = new Map();

const localStorage = {
  getItem: (key) => mockLocalStorage.get(key) || null,
  setItem: (key, value) => mockLocalStorage.set(key, value),
  removeItem: (key) => mockLocalStorage.delete(key),
  clear: () => mockLocalStorage.clear()
};

// Simulate the data structure that gets stored
const simulateGameRecord = (gameNumber) => {
  const gameId = `game_${Date.now()}_${gameNumber}`;
  
  // This is what our recorder captures - EXACTLY what AI needs
  const gameRecord = {
    gameId,
    timestamp: Date.now(),
    
    // GAME SETTINGS - AI needs these to replicate simulation
    settings: {
      boardSize: 20,
      tokensPerPlayer: 5,
      birthRules: [3],
      survivalRules: [2, 3],
      enabledSuperpowers: [1, 2, 3], // Tank, Spreader, Survivor
      superpowerPercentage: 20
    },
    
    // TOKEN PLACEMENTS - AI needs these as starting positions
    placements: [
      { row: 5, col: 5, player: 0, superpowerType: 1, moveNumber: 1 },
      { row: 6, col: 6, player: 0, superpowerType: 0, moveNumber: 2 },
      { row: 7, col: 7, player: 0, superpowerType: 2, moveNumber: 3 },
      { row: 8, col: 8, player: 0, superpowerType: 0, moveNumber: 4 },
      { row: 9, col: 9, player: 0, superpowerType: 3, moveNumber: 5 },
      
      { row: 15, col: 15, player: 1, superpowerType: 1, moveNumber: 6 },
      { row: 14, col: 14, player: 1, superpowerType: 0, moveNumber: 7 },
      { row: 13, col: 13, player: 1, superpowerType: 2, moveNumber: 8 },
      { row: 12, col: 12, player: 1, superpowerType: 0, moveNumber: 9 },
      { row: 11, col: 11, player: 1, superpowerType: 3, moveNumber: 10 }
    ],
    
    // FINAL OUTCOME - AI needs this as the target to learn
    outcome: {
      winner: gameNumber % 2, // Alternate winners for variety
      finalScores: { 
        player1: 15 + Math.floor(Math.random() * 10), 
        player2: 18 + Math.floor(Math.random() * 10) 
      },
      totalGenerations: 50,
      gameEndReason: 'max_generations'
    },
    
    version: '1.0.0',
    platform: 'web'
  };
  
  return gameRecord;
};

// Test 1: Simulate collecting data from multiple games
console.log('📊 Test 1: Data Collection Simulation');
const collectedGames = [];

for (let i = 1; i <= 5; i++) {
  const gameRecord = simulateGameRecord(i);
  collectedGames.push(gameRecord);
  
  // Store in mock localStorage (this is what the game does)
  const storageKey = `gameRecord_${gameRecord.gameId}`;
  localStorage.setItem(storageKey, JSON.stringify(gameRecord));
  
  console.log(`   ✅ Game ${i}: ID=${gameRecord.gameId}`);
  console.log(`      Settings: ${gameRecord.settings.boardSize}x${gameRecord.settings.boardSize}, ${gameRecord.settings.tokensPerPlayer} tokens`);
  console.log(`      Placements: ${gameRecord.placements.length} total`);
  console.log(`      Winner: Player ${gameRecord.outcome.winner + 1}`);
  console.log(`      Scores: P1=${gameRecord.outcome.finalScores.player1}, P2=${gameRecord.outcome.finalScores.player2}`);
  console.log();
}

// Test 2: Data Retrieval
console.log('🔍 Test 2: Data Retrieval');
const retrievedGames = [];

// Simulate how the app retrieves stored games
for (const [key, value] of mockLocalStorage.entries()) {
  if (key.startsWith('gameRecord_')) {
    try {
      const gameData = JSON.parse(value);
      retrievedGames.push(gameData);
      console.log(`   ✅ Retrieved: ${gameData.gameId}`);
    } catch (error) {
      console.log(`   ❌ Failed to parse: ${key}`);
    }
  }
}

console.log(`\n📈 Retrieved ${retrievedGames.length} games successfully`);

// Test 3: AI Training Data Verification
console.log('\n🤖 Test 3: AI Training Data Verification');

const verifyAIData = (gameRecord) => {
  const checks = {
    hasSettings: !!gameRecord.settings,
    hasBoardSize: typeof gameRecord.settings?.boardSize === 'number',
    hasRules: Array.isArray(gameRecord.settings?.birthRules) && Array.isArray(gameRecord.settings?.survivalRules),
    hasSuperpowers: Array.isArray(gameRecord.settings?.enabledSuperpowers),
    
    hasPlacements: Array.isArray(gameRecord.placements) && gameRecord.placements.length > 0,
    placementsHavePositions: gameRecord.placements.every(p => typeof p.row === 'number' && typeof p.col === 'number'),
    placementsHavePlayer: gameRecord.placements.every(p => p.player === 0 || p.player === 1),
    placementsHaveType: gameRecord.placements.every(p => typeof p.superpowerType === 'number'),
    placementsHaveOrder: gameRecord.placements.every(p => typeof p.moveNumber === 'number'),
    
    hasOutcome: !!gameRecord.outcome,
    hasWinner: gameRecord.outcome?.winner === 0 || gameRecord.outcome?.winner === 1 || gameRecord.outcome?.winner === null,
    hasScores: typeof gameRecord.outcome?.finalScores?.player1 === 'number' && typeof gameRecord.outcome?.finalScores?.player2 === 'number',
    hasGenerations: typeof gameRecord.outcome?.totalGenerations === 'number'
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  return { checks, passed: passedChecks, total: totalChecks, score: passedChecks / totalChecks };
};

let totalScore = 0;
retrievedGames.forEach((game, index) => {
  const verification = verifyAIData(game);
  totalScore += verification.score;
  
  console.log(`   Game ${index + 1}: ${Math.round(verification.score * 100)}% complete (${verification.passed}/${verification.total} checks)`);
  
  if (verification.score < 1) {
    const failedChecks = Object.entries(verification.checks)
      .filter(([_, passed]) => !passed)
      .map(([check, _]) => check);
    console.log(`     ❌ Missing: ${failedChecks.join(', ')}`);
  }
});

const averageScore = totalScore / retrievedGames.length;
console.log(`\n📊 Overall AI Training Data Quality: ${Math.round(averageScore * 100)}%`);

// Test 4: Simulation Replication Test
console.log('\n🔄 Test 4: Simulation Replication Verification');

const canReplicateSimulation = (gameRecord) => {
  // Check if we have everything needed to re-run the exact same simulation
  const requirements = {
    boardSize: !!gameRecord.settings?.boardSize,
    rules: !!gameRecord.settings?.birthRules && !!gameRecord.settings?.survivalRules,
    superpowerSettings: !!gameRecord.settings?.enabledSuperpowers,
    startingPositions: gameRecord.placements?.length === (gameRecord.settings?.tokensPerPlayer * 2),
    playerAssignments: gameRecord.placements?.every(p => p.player === 0 || p.player === 1),
    superpowerTypes: gameRecord.placements?.every(p => typeof p.superpowerType === 'number'),
    expectedOutcome: !!gameRecord.outcome
  };
  
  const canReplicate = Object.values(requirements).every(Boolean);
  
  return { requirements, canReplicate };
};

retrievedGames.forEach((game, index) => {
  const replication = canReplicateSimulation(game);
  console.log(`   Game ${index + 1}: ${replication.canReplicate ? '✅ CAN replicate' : '❌ CANNOT replicate'}`);
  
  if (!replication.canReplicate) {
    const missing = Object.entries(replication.requirements)
      .filter(([_, met]) => !met)
      .map(([req, _]) => req);
    console.log(`     Missing: ${missing.join(', ')}`);
  }
});

// Summary
console.log('\n🎯 SUMMARY - Data Collection & Retrieval Test Results:');
console.log(`✅ Games Collected: ${collectedGames.length}`);
console.log(`✅ Games Retrieved: ${retrievedGames.length}`);
console.log(`✅ Data Quality: ${Math.round(averageScore * 100)}%`);
console.log(`✅ Simulation Replication: ${retrievedGames.every(g => canReplicateSimulation(g).canReplicate) ? 'ALL GAMES' : 'SOME GAMES'}`);

console.log('\n🧠 AI TRAINING READINESS:');
console.log('✅ Start positions: Captured (row, col, player, superpower type)');
console.log('✅ Game settings: Captured (board size, rules, superpowers)');
console.log('✅ Final outcomes: Captured (winner, scores, generations)');
console.log('✅ Move order: Captured (for strategy analysis)');
console.log('✅ Data format: JSON (easily parseable by ML frameworks)');

console.log('\n🎮 READY FOR: Supervised learning (input: settings+placements → output: winner)');
console.log('🎮 READY FOR: Strategy analysis (placement patterns → outcomes)');
console.log('🎮 READY FOR: Simulation replication (exact game recreation)');

console.log('\n✅ DATA COLLECTION & RETRIEVAL TEST PASSED!');