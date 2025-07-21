# Game of Strife - Standalone Edition

A mobile-optimized Conway's Game of Life battle simulator with superpowers, featuring both 2-player competitive mode and single-player training mode.

## Features

### Game Modes
- **2 Player Battle**: Competitive Conway's Game of Life with strategic token placement
- **Training Mode**: Single-player practice mode to learn survival patterns and strategies

### Mobile-First Design
- Responsive touch controls optimized for mobile devices
- Device detection and adaptive UI components
- Touch-friendly button sizes (48px minimum on mobile)
- Optimized spacing and typography for different screen sizes

### Gameplay Features
- **Conway's Game of Life Rules**: Classic cellular automata with birth/survival rules
- **Superpowers**: 7 different cell types with special abilities
  - Tank: Extra durability
  - Spreader: Enhanced reproduction
  - Survivor: Harsh condition survival
  - Ghost: Semi-transparent movement
  - Replicator: Fast multiplication
  - Destroyer: Cell elimination
  - Hybrid: Combined abilities
- **Customizable Settings**: Board size, tokens per player, rules, superpower percentages
- **Session Scoring**: Win tracking across multiple games
- **Survival Rate Analytics**: Performance metrics for training mode

### Technical Features
- Built with React 18 + TypeScript + Vite
- Tailwind CSS for styling with retro pixel art theme
- Capacitor for mobile app deployment
- Responsive design with device detection
- Game data recording for AI training
- Local storage with cloud sync capabilities

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Mobile Development
```bash
# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Game Rules

### Conway's Game of Life
- **Birth**: Dead cell with exactly 3 living neighbors becomes alive
- **Survival**: Living cell with 2 or 3 neighbors survives
- **Death**: All other cells die (overpopulation or underpopulation)

### Superpowers
Each token has a chance to spawn with special abilities that modify the standard rules:
- **Tank**: Harder to kill, survives harsh conditions
- **Spreader**: Enhanced birth rate, spreads more aggressively
- **Survivor**: Survives with fewer neighbors
- **Ghost**: Can phase through obstacles
- **Replicator**: Creates additional cells when reproducing
- **Destroyer**: Can eliminate enemy cells
- **Hybrid**: Combines multiple superpower effects

### Victory Conditions
- **2 Player**: Player with most living cells after 100 generations wins
- **Training**: Maximize your survival rate percentage

## Architecture

### Key Components
- `GameLogic.tsx`: 2-player game controller
- `SinglePlayerLogic.tsx`: Training mode controller
- `GameBoard.tsx`: Interactive cellular automata grid
- `VictoryModal.tsx`: End game results with session tracking
- `GameSettings.tsx`: Customizable game parameters
- `useResponsive.ts`: Mobile-optimized responsive design hook

### Device Detection
- Automatic mobile/tablet/desktop detection
- Touch capability detection
- Adaptive UI components based on device type
- Optimized touch targets for mobile devices

## Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API and data services
└── styles/             # CSS and styling
```

## Contributing

This is an evolving project focused on creating an engaging mobile Conway's Game of Life experience. The codebase emphasizes:
- Mobile-first responsive design
- Clean, maintainable React/TypeScript code
- Performance optimization for mobile devices
- Accessible touch interfaces

## License

Private project - All rights reserved.

---

*Game of Strife - Where cellular automata meets strategic gameplay* 🧬⚔️