# TPT Asset Editor Desktop

A comprehensive desktop application for procedural asset generation, extending the web-based TPT Online Asset Editor with advanced audio synthesis and new asset types.

## 🎵 Features

### Audio Generation System
- **Sound Effects**: 9 different effect types including sword attacks, fireballs, level up chimes, magic spells, and more
- **Music Composition**: Multiple styles (village, combat, dungeon, ambient) with melody generation and harmony
- **Ambient Environments**: Forest, village, cave, wind, ocean, and weather soundscapes
- **Advanced Audio Processing**: FM synthesis, reverb, distortion, pitch shifting, and spatial positioning
- **Real-time Preview**: Live waveform and spectrum visualization during generation
- **Export Formats**: WAV, MP3, OGG, and JSON metadata with configurable quality settings
- **Multi-track Mixing**: Professional audio mixing with effects chains and master controls

### Visual Asset Generation
- **Vehicles**: Cars (sedan/truck/sports/van), motorcycles, spaceships (fighter/cruiser/cargo), boats (sail/motor/canoe), submarines
- **Buildings**: Cottages, mansions, castles, towers, shops with architectural customization
- **Particle Effects**: Explosions, fire, magic spells, weather particles, light rays, animated transitions
- **UI Elements**: Buttons (with hover/pressed states), panels, icons, progress bars, menus, scrollbars, text inputs, checkboxes

### Enhanced Technical Capabilities
- **Web Audio API Integration**: Real-time audio playback and processing
- **Database Storage**: SQLite with comprehensive metadata and tagging system
- **Batch Processing**: Generate multiple assets simultaneously
- **Parameter Control**: Real-time adjustment of all generation parameters
- **Cross-platform**: Windows, macOS, and Linux support
- **Enhanced Export Formats**: JSON metadata export, sprite sheets, animation sequences
- **Performance Monitoring**: Real-time performance tracking and optimization
- **Centralized Error Handling**: Consistent error logging and handling across the application
- **Plugin Marketplace**: Community plugins with rating system

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd tpt-asset-editor-desktop

# Install dependencies
npm install

# Start the application
npm start
```

### Basic Usage

#### Audio Generation
1. Launch the application
2. Select "Audio Generator" from the main menu
3. Choose audio type (Sound Effect, Music, or Ambient)
4. Configure parameters using the dynamic panels
5. Click "Generate" to create the audio
6. Use the waveform/spectrum visualizers to preview
7. Export in WAV or MP3 format

#### Visual Asset Generation
1. Select desired asset type from the main interface
2. Customize colors, styles, and parameters
3. Generate the sprite
4. Export as PNG with transparent background

## 🏗️ Architecture

### Core Components

```
src/
├── generators/          # Asset generation classes
│   ├── audio-generator.js
│   ├── effect-synthesizer.js
│   ├── music-composer.js
│   ├── ambient-generator.js
│   ├── vehicle-generator.js
│   ├── building-generator.js
│   ├── particle-generator.js
│   └── ui-generator.js
├── audio/               # Audio playback and visualization
│   ├── audio-manager.js
│   ├── waveform-visualizer.js
│   ├── spectrum-visualizer.js
│   └── audio-mixer.js
├── ui/                  # User interface components
│   ├── audio-interface.html
│   └── audio-interface.js
├── database/            # Data persistence
│   └── schema.js
└── tests/               # Test suites
    └── audio-tests.js
```

### Audio Pipeline

1. **Generation**: Algorithm-based synthesis using mathematical functions
2. **Processing**: Effects application (reverb, delay, filtering, compression)
3. **Visualization**: Real-time waveform and frequency spectrum display
4. **Export**: Format conversion and file output

### Data Flow

```
User Input → Parameter Validation → Asset Generation → Processing → Storage → Export
```

## 📚 API Reference

### AudioGenerator

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

// Generate ambient sound
const ambient = await generator.generateAmbient({
    type: 'forest',
    duration: 60,
    intensity: 0.8,
    format: 'wav'
});
```

### AudioManager

```javascript
const AudioManager = require('./src/audio/audio-manager');

const audioManager = new AudioManager();
await audioManager.init();

// Play audio with controls
const instance = await audioManager.playAudio(audioData, 'wav', {
    volume: 0.8,
    pan: 0.0,
    loop: false
});

// Adjust playback
audioManager.setVolume(instance, 0.6);
audioManager.setPan(instance, -0.3);

// Stop playback
audioManager.stopAudio(instance);
```

### Database Schema

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

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Audio tests
node src/tests/audio-tests.js

# All tests
npm test
```

Test coverage includes:
- Audio generation algorithms
- Export format validation
- Playback compatibility
- Parameter range validation
- Performance benchmarks
- Memory usage monitoring

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development Setup
```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run specific tests
npm run test:audio
npm run test:integration
npm run test:enhanced

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Generate documentation
npm run docs

# Serve documentation locally
npm run docs:serve
```

### Adding New Generators

1. Create new generator class in `src/generators/`
2. Implement required methods (`generate*`, `saveToFile`)
3. Add to database schema if needed
4. Update UI components
5. Add tests

### Audio Algorithm Development

When creating new audio synthesis algorithms:

1. Use mathematical functions for waveform generation
2. Implement proper amplitude normalization
3. Consider sample rate and bit depth
4. Add parameter validation
5. Test across different durations and qualities

## 📖 Tutorials

### Creating Custom Sound Effects

```javascript
// Extend EffectSynthesizer
class CustomEffectSynthesizer extends EffectSynthesizer {
    generateCustomEffect(duration) {
        const numSamples = Math.floor(duration * this.sampleRate);
        const audioData = new Float32Array(numSamples);

        // Your custom algorithm here
        for (let i = 0; i < numSamples; i++) {
            const t = i / this.sampleRate;
            // Generate waveform
            audioData[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 2);
        }

        return audioData;
    }
}
```

### Building Custom UI Components

```javascript
// Create new UI generator method
generateCustomButton(config) {
    // Custom button generation logic
    // Use canvas drawing operations
    // Return asset object
}
```

## 🚀 Deployment

Complete deployment guides for building and distributing the TPT Asset Editor.

### Quick Start (5 Minutes)
Get up and running in just 5 minutes with our [Quick Start Guide](./docs/deployment/QUICK-START.md).

### Platform-Specific Guides
- **[Windows](./docs/deployment/platforms/WINDOWS.md)** - NSIS installer, portable version
- **[macOS](./docs/deployment/platforms/MACOS.md)** - DMG installer, universal binaries
- **[Linux](./docs/deployment/platforms/LINUX.md)** - AppImage, DEB/RPM packages

### Troubleshooting
Comprehensive [Troubleshooting Guide](./docs/deployment/TROUBLESHOOTING.md) for common issues.

### Building for Distribution

#### Quick Build (All Platforms)
```bash
# Install dependencies
npm install

# Build for all platforms
npm run build
```

#### Platform-Specific Builds
```bash
# Windows only
npm run build -- --win

# macOS only
npm run build -- --mac

# Linux only
npm run build -- --linux
```

#### Development Build
```bash
# Run in development mode
npm run dev

# Build without publishing
npm run dist
```

### Distribution Options

| Platform | Format | Size | Installation |
|----------|--------|------|-------------|
| **Windows** | NSIS Installer | ~150-200MB | Double-click `.exe` |
| **Windows** | Portable | ~200-250MB | Extract and run |
| **macOS** | DMG | ~180-220MB | Drag to Applications |
| **macOS** | App Bundle | ~200-240MB | Copy to `/Applications/` |
| **Linux** | AppImage | ~160-200MB | Make executable and run |
| **Linux** | DEB Package | ~150-190MB | `sudo dpkg -i package.deb` |
| **Linux** | RPM Package | ~150-190MB | `sudo rpm -i package.rpm` |

### System Requirements

#### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **RAM**: 4GB
- **Storage**: 500MB free space
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

#### Recommended Requirements
- **Node.js**: Latest LTS (18.x)
- **RAM**: 8GB
- **Storage**: 1GB free space
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+

### Build Output Structure
```
dist/
├── TPT Asset Editor-1.0.0.exe          # Windows NSIS installer
├── win-unpacked/                       # Windows portable
├── TPT Asset Editor-1.0.0.dmg          # macOS DMG
├── mac/                                # macOS app bundle
├── TPT Asset Editor-1.0.0.AppImage     # Linux AppImage
├── tpt-asset-editor_1.0.0_amd64.deb    # Debian package
└── tpt-asset-editor-1.0.0.x86_64.rpm   # RPM package
```

### Customizing Builds

#### Build Configuration (package.json)
```json
{
  "build": {
    "appId": "com.tptonline.asseteditor",
    "productName": "TPT Asset Editor",
    "directories": {
      "output": "dist"
    },
    "files": [
      "**/*",
      "!dist/**/*",
      "!build/**/*",
      "!*.md"
    ]
  }
}
```

#### Platform-Specific Configuration
```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "assets/icons/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icons/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icons/icon.png"
    }
  }
}
```

### Common Build Issues

#### Dependencies Installation Fails
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Build Tools Missing
```bash
# Windows
npm install --global windows-build-tools

# macOS
xcode-select --install

# Linux
sudo apt install build-essential
```

#### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Distribution Methods

#### Personal Use
1. Build application for your platform
2. Install locally or share with others
3. No code signing required

#### Local Network Sharing
1. Build portable versions
2. Share via network drive
3. Users can run directly

#### File Sharing Services
1. Upload built installers to Dropbox, Google Drive, etc.
2. Share download links
3. Users download and install

### Performance Optimization

#### Reduce Bundle Size
```bash
# Exclude unnecessary files
echo "node_modules/.bin/*" >> .electronignore
echo "docs/**/*" >> .electronignore
echo "*.md" >> .electronignore
```

#### Enable Compression
```json
{
  "build": {
    "compression": "maximum"
  }
}
```

### Getting Help

- 📖 **[Quick Start Guide](./docs/deployment/QUICK-START.md)**
- 🪟 **[Windows Guide](./docs/deployment/platforms/WINDOWS.md)**
- 🍎 **[macOS Guide](./docs/deployment/platforms/MACOS.md)**
- 🐧 **[Linux Guide](./docs/deployment/platforms/LINUX.md)**
- 🔧 **[Troubleshooting](./docs/deployment/TROUBLESHOOTING.md)**

For additional help, check the troubleshooting guide or create an issue on GitHub.

## 🐛 Troubleshooting

### Common Issues

#### Audio Playback Issues
- **Problem**: No audio output
- **Solution**: Check browser audio permissions and Web Audio API support
- **Debug**: Verify AudioContext state and audio buffer validity

#### Generation Performance
- **Problem**: Slow asset generation
- **Solution**: Reduce batch size, optimize algorithms, monitor memory usage
- **Debug**: Use performance profiling tools

#### Database Errors
- **Problem**: SQLite connection issues
- **Solution**: Check file permissions, verify database path
- **Debug**: Enable SQLite verbose logging

#### Export Failures
- **Problem**: File write errors
- **Solution**: Check disk space, file permissions, output directory
- **Debug**: Verify export format support

### Performance Optimization

- Use Web Workers for heavy computations
- Implement audio buffer pooling
- Cache frequently used assets
- Optimize Canvas operations
- Monitor memory leaks

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Implement proper error handling
- Add JSDoc comments for public APIs
- Write comprehensive tests

## 📄 License

This project is licensed under the GPL-2.0-or-later License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original TPT Online Asset Editor
- Web Audio API community
- Open source audio libraries
- Game development community

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

*Built with ❤️ for game developers and digital artists*
