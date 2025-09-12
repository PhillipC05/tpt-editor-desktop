# TPT Asset Editor Desktop - Developer Context

## Project Overview

TPT Asset Editor Desktop is a comprehensive Electron-based application for procedural asset generation for game development. It extends the web-based TPT Online Asset Editor with advanced audio synthesis capabilities and a wide range of visual asset generators.

The application provides tools for generating:
- Audio assets (sound effects, music, ambient sounds)
- Visual assets (characters, monsters, items, vehicles, buildings, particles, UI elements)
- Level layouts and environments
- And hundreds of other specialized game assets

## Key Features

### Audio Generation
- **Sound Effects**: 9 different effect types including sword attacks, fireballs, level up chimes, magic spells, and more
- **Music Composition**: Multiple styles (village, combat, dungeon, ambient) with melody generation and harmony
- **Ambient Environments**: Forest, village, cave, wind, ocean, and weather soundscapes
- **Export Formats**: WAV and MP3 with configurable quality settings

### Visual Asset Generation
- **Vehicles**: Cars, motorcycles, spaceships, boats, submarines with customization options
- **Buildings**: Cottages, mansions, castles, towers, shops with architectural customization
- **Particle Effects**: Explosions, fire, magic spells, weather particles, light rays
- **UI Elements**: Buttons, panels, icons, progress bars with different states
- **Extended Asset Library**: 500+ professional-quality assets across 15+ categories

### Technical Capabilities
- **Cross-platform**: Windows, macOS, and Linux support
- **Database Storage**: SQLite with comprehensive metadata and tagging system
- **Batch Processing**: Generate multiple assets simultaneously
- **Plugin System**: Extensible architecture for custom generators
- **Level Generation**: Complete environment and level layout generation

## Project Structure

```
tpt-editor-desktop/
├── assets/
│   ├── css/           # Stylesheets
│   └── js/            # Frontend JavaScript
├── docs/              # Documentation
├── scripts/           # Build and utility scripts
├── src/
│   ├── generators/    # Asset generation classes
│   ├── audio/         # Audio processing and playback
│   ├── ui/            # UI components
│   ├── database/      # Database schema and utilities
│   ├── utils/         # Utility classes (memory management, background processing)
│   ├── plugins/       # Plugin system
│   └── tests/         # Test suites
├── main.js            # Electron main process
├── preload.js         # Electron preload script
├── package.json       # Project dependencies and scripts
├── README.md          # Project documentation
└── todo.md            # Development roadmap
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd tpt-asset-editor-desktop

# Install dependencies
npm install
```

### Development Commands
```bash
# Start the application in development mode
npm run dev

# Start the application
npm start

# Build for production
npm run build

# Build without publishing
npm run dist

# Run tests
npm test

# Lint code
npm run lint
```

## Architecture Overview

### Core Components

1. **Electron Main Process** (`main.js`): 
   - Creates and manages the application window
   - Handles IPC communication between main and renderer processes
   - Manages the SQLite database
   - Implements the application menu

2. **Preload Script** (`preload.js`):
   - Exposes safe APIs to the renderer process
   - Bridges IPC communication between frontend and backend

3. **Frontend UI** (`src/index.html` and `assets/js/`):
   - Multi-view interface with dashboard, generator, library, batch processor
   - Asset type selection and configuration panels
   - Real-time preview capabilities

4. **Asset Generators** (`src/generators/`):
   - Specialized classes for each asset type
   - Procedural generation algorithms using mathematical functions
   - Configurable parameters for customization

5. **Audio System** (`src/audio/`):
   - Web Audio API integration for real-time playback
   - Waveform and spectrum visualization
   - Audio effects processing (reverb, distortion, pitch shifting)

6. **Database** (`src/database/`):
   - SQLite storage for assets and settings
   - Asset metadata and tagging system

7. **Utility Systems** (`src/utils/`):
   - Memory management
   - Background processing
   - Asset organization

8. **Plugin System** (`src/plugins/`):
   - Extensible architecture for custom generators
   - Plugin loading and management

## Asset Generation Pipeline

1. **User Configuration**: User selects asset type and configures parameters
2. **Generation**: Algorithm-based synthesis using mathematical functions
3. **Processing**: Effects application (for audio) or post-processing (for visuals)
4. **Preview**: Real-time visualization in the UI
5. **Storage**: Assets saved to SQLite database
6. **Export**: Format conversion and file output

## API Examples

### Audio Generation
```javascript
const AudioGenerator = require('./src/generators/audio-generator');

// Generate sound effect
const sfx = await generator.generateSFX({
    effectType: 'sword_attack',
    duration: 1.0,
    format: 'wav'
});

// Generate music
const music = await generator.generateMusic({
    style: 'village',
    duration: 30,
    tempo: 120,
    format: 'mp3',
    quality: 128
});
```

### Asset Database
```javascript
const DatabaseSchema = require('./src/database/schema');

const db = new DatabaseSchema();

// Save asset
const assetId = db.saveAsset(asset);

// Retrieve assets
const assets = db.getAssets('audio', 50, 0);

// Search assets
const results = db.searchAssets('sword', 'audio', ['combat'], 20, 0);
```

## Plugin System

The application supports a comprehensive plugin system that allows developers to:
- Create custom asset generators
- Extend the UI with new components
- Add new export formats
- Implement custom workflows

Plugins are loaded from the `src/plugins/` directory and can hook into various application events.

## Performance Considerations

- Uses intelligent memory pooling for efficient resource management
- Implements background processing for CPU-intensive tasks
- Optimizes Canvas and image buffer management
- Supports streaming generation for very large outputs
- Monitors CPU usage and implements throttling when needed

## Testing

The project includes comprehensive test coverage for:
- Audio generation algorithms
- Export format validation
- Playback compatibility
- Parameter range validation
- Performance benchmarks
- Memory usage monitoring

Run tests with:
```bash
npm test
```

## Building and Distribution

The application can be built for all major platforms:
- Windows (NSIS installer, portable version)
- macOS (DMG installer, app bundle)
- Linux (AppImage, DEB/RPM packages)

Build commands:
```bash
# Build for all platforms
npm run build

# Platform-specific builds
npm run build -- --win
npm run build -- --mac
npm run build -- --linux
```

## Contributing

The project follows standard open-source contribution practices:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Code standards:
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Implement proper error handling
- Add JSDoc comments for public APIs
- Write comprehensive tests

## Current Development Status

According to the `todo.md` roadmap, all major phases of development have been completed:
- ✅ Audio Generation Foundation
- ✅ New Asset Types
- ✅ Audio Integration
- ✅ UI/UX Enhancements
- ✅ Backend Integration
- ✅ Testing & Optimization
- ✅ Documentation & Deployment
- ✅ Massive Asset Library Expansion
- ✅ Level Generation System
- ✅ User Experience & Accessibility
- ✅ Performance & Scalability
- ✅ Content Management & Organization
- ✅ Plugin System & Extensibility
- ✅ Documentation & Developer Experience

The application is production-ready with a comprehensive feature set for game asset generation.