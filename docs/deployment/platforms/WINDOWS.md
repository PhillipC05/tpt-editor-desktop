# 🪟 Windows Build Guide

Complete guide for building and distributing the TPT Asset Editor on Windows.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download LTS version](https://nodejs.org/)
- **Git** - [Download Git for Windows](https://git-scm.com/download/win)
- **Visual Studio Build Tools** (for native modules)

### Optional Tools
- **7-Zip** - For extracting archives
- **NSIS** - For creating installers (usually included with electron-builder)

## 🏗️ Building for Windows

### Method 1: Quick Build (Recommended)

```bash
# Navigate to project directory
cd tpt-asset-editor

# Install dependencies
npm install

# Build Windows installer
npm run build
```

**Output Location:** `./dist/`
- `TPT Asset Editor 1.0.0.exe` - NSIS installer
- `win-unpacked/` - Portable version

### Method 2: Platform-Specific Build

```bash
# Build only for Windows
npm run build -- --win

# Or build for current platform only
npm run build -- --win
```

### Method 3: Portable Version

```bash
# Create portable version (no installer)
npm run build -- --win portable
```

## 📦 Distribution Options

### NSIS Installer (Default)
- **File**: `TPT Asset Editor 1.0.0.exe`
- **Size**: ~150-200MB
- **Features**:
  - Automatic installation
  - Start menu shortcuts
  - Desktop icon
  - Uninstaller

### Portable Version
- **Location**: `dist/win-unpacked/`
- **Size**: ~200-250MB
- **Features**:
  - No installation required
  - Run from any folder
  - Self-contained

## 🚀 Installation Instructions

### Using NSIS Installer
1. Double-click `TPT Asset Editor 1.0.0.exe`
2. Follow the installation wizard
3. Choose installation directory (default: `C:\Program Files\TPT Asset Editor\`)
4. The application will be available in Start Menu

### Using Portable Version
1. Extract `win-unpacked` folder to desired location
2. Run `TPT Asset Editor.exe`
3. No installation required!

## 🔧 Customizing the Build

### Build Configuration (package.json)

```json
{
  "build": {
    "win": {
      "target": "nsis",
      "icon": "assets/icons/icon.ico",
      "requestedExecutionLevel": "asInvoker",
      "extraResources": [
        "assets/**/*"
      ]
    }
  }
}
```

### Custom Installer Options

```json
{
  "build": {
    "nsis": {
      "oneClick": false,
      "perMachine": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "assets/icons/installer.ico",
      "uninstallerIcon": "assets/icons/uninstaller.ico",
      "installerHeaderIcon": "assets/icons/icon.ico",
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "TPT Asset Editor"
    }
  }
}
```

## 🐛 Troubleshooting Windows Builds

### Common Issues

**❌ "MSBUILD : error MSB3428: Could not load the Visual C++ component"**
```bash
# Install Windows Build Tools
npm install --global windows-build-tools

# Or install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

**❌ "npm install" hangs or fails**
```bash
# Clear npm cache
npm cache clean --force

# Use different registry
npm install --registry=https://registry.npmjs.org/

# Try with verbose logging
npm install --verbose
```

**❌ Build fails with "EPERM" errors**
```bash
# Run command prompt as Administrator
# Or disable Windows Defender temporarily
# Or exclude project folder from antivirus
```

**❌ Application won't start after installation**
```bash
# Check if antivirus is blocking the executable
# Try running as Administrator
# Check Windows Event Viewer for error details
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
    "win": {
      "target": "nsis"
    }
  }
}
```

## 📊 Build Output Details

### File Structure
```
dist/
├── TPT Asset Editor 1.0.0.exe    # NSIS installer
├── win-unpacked/                 # Portable version
│   ├── TPT Asset Editor.exe     # Main executable
│   ├── resources/               # Application resources
│   └── locales/                 # Language files
└── win-ia32-unpacked/           # 32-bit version (if built)
```

### File Sizes (Approximate)
- **Installer**: 150-200MB
- **Portable**: 200-250MB
- **Source Code**: ~50MB
- **Dependencies**: ~150MB

## 🚀 Distribution Methods

### Local Installation
1. Build the installer: `npm run build`
2. Copy `TPT Asset Editor 1.0.0.exe` to target machine
3. Run installer as administrator

### Network Share
1. Build portable version
2. Copy `win-unpacked` folder to network share
3. Users can run directly from network (slower startup)

### USB Drive
1. Build portable version
2. Copy to USB drive
3. Run from any Windows computer

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10 (64-bit)
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Display**: 1280x720 resolution

### Recommended Requirements
- **OS**: Windows 10 or 11 (64-bit)
- **RAM**: 8GB
- **Storage**: 1GB free space
- **Display**: 1920x1080 resolution

## 🎯 Next Steps

- **Test the Build**: Install on a clean Windows machine
- **Customize Icons**: Replace default icons with your branding
- **Add Version Info**: Update version numbers and metadata
- **Create Uninstaller**: Test the uninstall process

## 📞 Need Help?

- Check the [Troubleshooting Guide](../TROUBLESHOOTING.md)
- Review Windows-specific issues
- Test on multiple Windows versions (10, 11)
