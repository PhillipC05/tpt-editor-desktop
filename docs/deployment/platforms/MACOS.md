# 🍎 macOS Build Guide

Complete guide for building and distributing the TPT Asset Editor on macOS.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download LTS version](https://nodejs.org/)
- **Xcode Command Line Tools** - Required for native modules

```bash
# Install Xcode Command Line Tools
xcode-select --install
```

### Optional Tools
- **Homebrew** - For additional package management
- **create-dmg** - For custom DMG creation

## 🏗️ Building for macOS

### Method 1: Quick Build (Recommended)

```bash
# Navigate to project directory
cd tpt-asset-editor

# Install dependencies
npm install

# Build macOS application
npm run build
```

**Output Location:** `./dist/`
- `TPT Asset Editor-1.0.0.dmg` - DMG installer
- `mac/` - Application bundle directory

### Method 2: Platform-Specific Build

```bash
# Build only for macOS
npm run build -- --mac

# Build for specific architecture
npm run build -- --mac --x64    # Intel Macs
npm run build -- --mac --arm64  # Apple Silicon Macs
```

### Method 3: Universal Binary (Intel + Apple Silicon)

```bash
# Build universal binary (requires both architectures)
npm run build -- --mac --universal
```

## 📦 Distribution Options

### DMG Installer (Default)
- **File**: `TPT Asset Editor-1.0.0.dmg`
- **Size**: ~180-220MB
- **Features**:
  - Drag-and-drop installation
  - Automatic Applications folder linking
  - Gatekeeper compatible

### Application Bundle
- **Location**: `dist/mac/TPT Asset Editor.app`
- **Size**: ~200-240MB
- **Features**:
  - Self-contained application
  - Can be run from any location
  - Includes all dependencies

## 🚀 Installation Instructions

### Using DMG Installer
1. Double-click `TPT Asset Editor-1.0.0.dmg`
2. Drag `TPT Asset Editor.app` to Applications folder
3. Eject the DMG disk image
4. Launch from Applications folder or Spotlight

### Manual Installation
1. Copy `TPT Asset Editor.app` to `/Applications/`
2. Right-click and select "Open" (first time only)
3. Click "Open" in the security dialog

## 🔧 Customizing the Build

### Build Configuration (package.json)

```json
{
  "build": {
    "mac": {
      "target": "dmg",
      "icon": "assets/icons/icon.icns",
      "category": "public.app-category.developer-tools",
      "extraResources": [
        "assets/**/*"
      ]
    }
  }
}
```

### Custom DMG Options

```json
{
  "build": {
    "dmg": {
      "title": "TPT Asset Editor",
      "background": "assets/dmg-background.png",
      "icon": "assets/icons/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 130,
          "y": 220,
          "type": "file",
          "path": "TPT Asset Editor.app"
        },
        {
          "x": 410,
          "y": 220,
          "type": "link",
          "path": "/Applications"
        }
      ]
    }
  }
}
```

## 🐛 Troubleshooting macOS Builds

### Common Issues

**❌ "xcode-select: command not found"**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Or install full Xcode from App Store
# Then run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

**❌ "npm install" fails with permission errors**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**❌ Build fails with "cannot find module"**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**❌ Application won't open (Gatekeeper)**
```bash
# Temporarily disable Gatekeeper for testing
sudo spctl --master-disable

# Re-enable after testing
sudo spctl --master-enable

# Or right-click app and select "Open"
```

**❌ Rosetta required on Apple Silicon**
```bash
# Install Rosetta 2
softwareupdate --install-rosetta
```

### Performance Optimization

**Reduce Bundle Size:**
```bash
# Exclude unnecessary files
echo "node_modules/.bin/*" >> .electronignore
echo "*.md" >> .electronignore
echo "docs/**/*" >> .electronignore
```

**Enable Compression:**
```json
{
  "build": {
    "compression": "maximum",
    "mac": {
      "target": "dmg"
    }
  }
}
```

## 📊 Build Output Details

### File Structure
```
dist/
├── TPT Asset Editor-1.0.0.dmg    # DMG installer
├── mac/                         # Application bundle
│   └── TPT Asset Editor.app/    # macOS application
│       ├── Contents/
│       │   ├── MacOS/          # Executables
│       │   ├── Resources/      # Assets and icons
│       │   ├── Frameworks/     # Dependencies
│       │   └── Info.plist      # Application metadata
│       └── (application files)
└── mac-arm64/                   # Apple Silicon specific build
```

### File Sizes (Approximate)
- **DMG**: 180-220MB
- **App Bundle**: 200-240MB
- **Source Code**: ~50MB
- **Dependencies**: ~150MB

## 🚀 Distribution Methods

### Direct Download
1. Build the DMG: `npm run build`
2. Upload `TPT Asset Editor-1.0.0.dmg` to file sharing service
3. Users download and install

### App Store Distribution (Advanced)
- Requires Apple Developer Program ($99/year)
- Code signing certificates
- App review process
- Not recommended for personal use

### Local Network
1. Build DMG or app bundle
2. Share via local network or file server
3. Users can install directly

## 📋 System Requirements

### Minimum Requirements
- **OS**: macOS 10.15 (Catalina)
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Display**: 1280x720 resolution

### Recommended Requirements
- **OS**: macOS 12+ (Monterey or later)
- **RAM**: 8GB
- **Storage**: 1GB free space
- **Display**: 1920x1080 resolution

## 🎯 Architecture Considerations

### Intel Macs (x64)
- Native support for all Node.js modules
- Better compatibility with older software
- Larger bundle size

### Apple Silicon (arm64)
- Better performance and battery life
- Native Apple ecosystem integration
- Some older Node modules may need Rosetta

### Universal Binaries
- Single app that works on both architectures
- Larger file size (~50% bigger)
- Best user experience
- Requires building on both architectures

## 🔧 Advanced Configuration

### Code Signing (Optional for Personal Use)

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "entitlements": "build/entitlements.plist",
      "entitlementsInherit": "build/entitlements.plist"
    }
  }
}
```

### Notarization (Optional for Personal Use)

```json
{
  "build": {
    "afterSign": "scripts/notarize.js"
  }
}
```

## 🎯 Next Steps

- **Test the Build**: Install on different macOS versions
- **Customize Icons**: Create ICNS icon file
- **Add Version Info**: Update CFBundleVersion and CFBundleShortVersionString
- **Test Gatekeeper**: Verify app opens without warnings

## 📞 Need Help?

- Check the [Troubleshooting Guide](../TROUBLESHOOTING.md)
- Review macOS-specific issues
- Test on both Intel and Apple Silicon Macs
- Check Console.app for detailed error logs
