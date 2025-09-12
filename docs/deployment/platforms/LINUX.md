# 🐧 Linux Build Guide

Complete guide for building and distributing the TPT Asset Editor on Linux.

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download LTS version](https://nodejs.org/)
- **GCC/G++** - Build tools for native modules

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install build-essential

# Fedora/CentOS/RHEL
sudo dnf groupinstall "Development Tools"

# Arch Linux
sudo pacman -S base-devel
```

### Optional Tools
- **fuse2** - For AppImage creation
- **libnss3-dev** - Additional dependencies

## 🏗️ Building for Linux

### Method 1: Quick Build (Recommended)

```bash
# Navigate to project directory
cd tpt-asset-editor

# Install dependencies
npm install

# Build Linux application
npm run build
```

**Output Location:** `./dist/`
- `TPT Asset Editor-1.0.0.AppImage` - AppImage executable
- `linux-unpacked/` - Portable version

### Method 2: Platform-Specific Build

```bash
# Build only for Linux
npm run build -- --linux

# Build for specific architecture
npm run build -- --linux --x64    # 64-bit
npm run build -- --linux --ia32   # 32-bit
npm run build -- --linux --arm64  # ARM 64-bit
npm run build -- --linux --armv7l # ARM 32-bit
```

### Method 3: Distribution-Specific Builds

```bash
# Build for specific Linux distributions
npm run build -- --linux AppImage  # AppImage (universal)
npm run build -- --linux deb       # Debian package
npm run build -- --linux rpm       # RPM package
npm run build -- --linux pacman    # Arch Linux package
```

## 📦 Distribution Options

### AppImage (Default)
- **File**: `TPT Asset Editor-1.0.0.AppImage`
- **Size**: ~160-200MB
- **Features**:
  - Universal Linux executable
  - No installation required
  - Runs on most Linux distributions
  - Self-contained with all dependencies

### DEB Package
- **File**: `tpt-asset-editor_1.0.0_amd64.deb`
- **Size**: ~150-190MB
- **Features**:
  - Native Debian/Ubuntu package
  - System integration
  - Automatic dependency management

### RPM Package
- **File**: `tpt-asset-editor-1.0.0.x86_64.rpm`
- **Size**: ~150-190MB
- **Features**:
  - Native Fedora/RHEL package
  - System integration
  - Automatic dependency management

## 🚀 Installation Instructions

### Using AppImage
1. Make the AppImage executable: `chmod +x TPT\ Asset\ Editor-1.0.0.AppImage`
2. Double-click to run or execute from terminal: `./TPT\ Asset\ Editor-1.0.0.AppImage`
3. No installation required!

### Using DEB Package (Ubuntu/Debian)
```bash
# Install the package
sudo dpkg -i tpt-asset-editor_1.0.0_amd64.deb

# Fix any dependency issues
sudo apt install -f

# Launch from applications menu or terminal
tpt-asset-editor
```

### Using RPM Package (Fedora/RHEL)
```bash
# Install the package
sudo rpm -i tpt-asset-editor-1.0.0.x86_64.rpm

# Or using dnf/yum
sudo dnf install tpt-asset-editor-1.0.0.x86_64.rpm

# Launch from applications menu
```

## 🔧 Customizing the Build

### Build Configuration (package.json)

```json
{
  "build": {
    "linux": {
      "target": "AppImage",
      "icon": "assets/icons/icon.png",
      "category": "Development",
      "extraResources": [
        "assets/**/*"
      ]
    }
  }
}
```

### Custom AppImage Options

```json
{
  "build": {
    "appImage": {
      "artifactName": "TPT-Asset-Editor-${version}.${ext}",
      "desktop": {
        "Name": "TPT Asset Editor",
        "Comment": "Professional asset generation and editing tools",
        "Categories": "Development;Graphics;"
      }
    }
  }
}
```

## 🐛 Troubleshooting Linux Builds

### Common Issues

**❌ "npm install" fails with build errors**
```bash
# Install additional build dependencies
sudo apt install libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon-dev libxcomposite-dev

# For Fedora/CentOS
sudo dnf install libXScrnSaver GConf2 gtk3 libnotify

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

**❌ Build fails with "cannot find module"**
```bash
# Check Node.js version
node --version

# Reinstall electron-builder
npm uninstall electron-builder
npm install electron-builder --save-dev
```

**❌ AppImage won't run**
```bash
# Make sure FUSE is installed
sudo apt install fuse libfuse2

# Check file permissions
chmod +x TPT\ Asset\ Editor-1.0.0.AppImage

# Try running with --no-sandbox
./TPT\ Asset\ Editor-1.0.0.AppImage --no-sandbox
```

**❌ DEB/RPM package installation fails**
```bash
# Check for missing dependencies
sudo apt install libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0

# Force installation
sudo dpkg -i --force-depends tpt-asset-editor_1.0.0_amd64.deb
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
    "linux": {
      "target": "AppImage"
    }
  }
}
```

## 📊 Build Output Details

### File Structure
```
dist/
├── TPT Asset Editor-1.0.0.AppImage  # AppImage executable
├── linux-unpacked/                  # Portable version
│   ├── TPT Asset Editor            # Main executable
│   ├── resources/                  # Application resources
│   └── lib/                        # Shared libraries
├── tpt-asset-editor_1.0.0_amd64.deb # DEB package
└── tpt-asset-editor-1.0.0.x86_64.rpm # RPM package
```

### File Sizes (Approximate)
- **AppImage**: 160-200MB
- **DEB Package**: 150-190MB
- **RPM Package**: 150-190MB
- **Portable**: 180-220MB
- **Source Code**: ~50MB
- **Dependencies**: ~130MB

## 🚀 Distribution Methods

### Direct Download
1. Build AppImage: `npm run build`
2. Upload to file sharing service
3. Users download and run directly

### Package Repositories
1. Build DEB/RPM packages
2. Host on personal package repository
3. Users install with package manager

### Local Network
1. Build AppImage or packages
2. Share via local network
3. Users install with single command

## 📋 System Requirements

### Minimum Requirements
- **OS**: Ubuntu 18.04+, Fedora 30+, or equivalent
- **RAM**: 4GB
- **Storage**: 500MB free space
- **Display**: 1280x720 resolution
- **Graphics**: OpenGL support

### Recommended Requirements
- **OS**: Ubuntu 20.04+, Fedora 34+, or equivalent
- **RAM**: 8GB
- **Storage**: 1GB free space
- **Display**: 1920x1080 resolution
- **Graphics**: Dedicated GPU recommended

## 🎯 Architecture Considerations

### x86_64 (64-bit Intel/AMD)
- Most common architecture
- Best compatibility
- All features supported

### ARM64 (64-bit ARM)
- Raspberry Pi 4, Apple Silicon via Rosetta
- Limited Node.js module support
- May require additional configuration

### i386/ia32 (32-bit)
- Legacy systems only
- Limited support
- Smaller bundle size

## 🔧 Advanced Configuration

### Desktop Integration

```json
{
  "build": {
    "linux": {
      "desktop": {
        "Name": "TPT Asset Editor",
        "Comment": "Professional asset generation and editing tools",
        "Categories": "Development;Graphics;AudioVideo;",
        "MimeType": "application/x-tpt-asset;"
      }
    }
  }
}
```

### Custom Build Scripts

```json
{
  "build": {
    "afterPack": "scripts/linux-after-pack.js",
    "afterAllArtifactBuild": "scripts/linux-after-build.js"
  }
}
```

## 🎯 Distribution-Specific Notes

### Ubuntu/Debian
- AppImage works on all versions
- DEB packages for 18.04+
- Native desktop integration

### Fedora/RHEL/CentOS
- AppImage universal compatibility
- RPM packages for native integration
- SELinux considerations

### Arch Linux
- AppImage works perfectly
- Can build custom PKGBUILD
- Rolling release compatibility

### Other Distributions
- AppImage is most compatible
- Test on target distribution
- Consider container solutions

## 📞 Need Help?

- Check the [Troubleshooting Guide](../TROUBLESHOOTING.md)
- Review Linux-specific issues
- Test on multiple distributions
- Check system logs: `journalctl -f`
- Use `strace` for debugging: `strace ./TPT\ Asset\ Editor-1.0.0.AppImage`
