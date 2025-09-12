# 🔧 Troubleshooting Guide

Common issues and solutions for the TPT Asset Editor deployment and usage.

## 🚀 Quick Diagnosis

### Check Your Environment
```bash
# Verify Node.js installation
node --version
npm --version

# Check available disk space
df -h

# Check memory
free -h

# Verify Git
git --version
```

### Test Basic Functionality
```bash
# Test npm registry access
npm ping

# Test electron installation
npx electron --version

# Check for conflicting processes
lsof -i :3000  # Check if port 3000 is in use
```

## 📦 Installation Issues

### "npm install" Fails

**❌ Network/Registry Issues**
```bash
# Try different registry
npm install --registry=https://registry.npmjs.org/

# Clear npm cache
npm cache clean --force

# Use verbose logging
npm install --verbose
```

**❌ Permission Errors**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm for user-level installation
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**❌ Native Module Build Failures**
```bash
# Install build tools
# Ubuntu/Debian
sudo apt update && sudo apt install build-essential

# macOS
xcode-select --install

# Windows
npm install --global windows-build-tools
```

### Node.js Version Issues

**❌ Wrong Node.js Version**
```bash
# Check current version
node --version

# Install correct version using nvm
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version  # Should show v18.x.x
```

## 🏗️ Build Issues

### Electron Builder Fails

**❌ Build Tools Missing**
```bash
# Install electron-builder globally
npm install -g electron-builder

# Or reinstall locally
npm uninstall electron-builder
npm install electron-builder --save-dev
```

**❌ Icon Files Missing**
```bash
# Create placeholder icons or disable
# In package.json, remove icon references:
{
  "build": {
    "win": { "icon": false },
    "mac": { "icon": false },
    "linux": { "icon": false }
  }
}
```

**❌ Code Signing Issues (Skip for Personal Use)**
```bash
# Disable code signing in package.json
{
  "build": {
    "win": { "certificateFile": false, "certificatePassword": false },
    "mac": { "identity": false }
  }
}
```

### Platform-Specific Build Issues

#### Windows
```bash
# Install Visual Studio Build Tools
npm install --global windows-build-tools

# Or install full Visual Studio
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# If Xcode is installed
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

#### Linux
```bash
# Install build essentials
sudo apt update
sudo apt install build-essential libnss3-dev libatk-bridge2.0-dev

# For RPM-based systems
sudo dnf groupinstall "Development Tools"
```

## 🚀 Runtime Issues

### Application Won't Start

**❌ Port Already in Use**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in the application
```

**❌ Missing Dependencies**
```bash
# Check for missing libraries
ldd ./TPT\ Asset\ Editor  # Linux
otool -L "TPT Asset Editor.app/Contents/MacOS/TPT Asset Editor"  # macOS
```

**❌ Antivirus Blocking**
- Add the application to antivirus exclusions
- Try running as administrator/sudo
- Temporarily disable antivirus during testing

### Performance Issues

**❌ High Memory Usage**
```bash
# Monitor memory usage
top  # Linux/macOS
taskmgr  # Windows

# Close other applications
# Restart the application
# Check for memory leaks in DevTools
```

**❌ Slow Generation**
- Reduce batch size in settings
- Close other applications
- Check disk space and fragmentation
- Update graphics drivers

**❌ UI Freezing**
- Enable hardware acceleration in settings
- Update graphics drivers
- Try running with `--disable-gpu` flag

## 📁 File System Issues

### Database Problems

**❌ Database File Corrupted**
```bash
# Backup existing database
cp userData/tpt-assets.db userData/tpt-assets.db.backup

# Remove corrupted database
rm userData/tpt-assets.db

# Restart application (will create new database)
```

**❌ Permission Issues**
```bash
# Fix database file permissions
chmod 644 userData/tpt-assets.db
chown $(whoami) userData/tpt-assets.db
```

### Asset Storage Issues

**❌ Export Directory Not Writable**
```bash
# Check permissions
ls -la /path/to/export/directory

# Fix permissions
chmod 755 /path/to/export/directory
```

**❌ Disk Space Full**
```bash
# Check disk usage
df -h

# Free up space
du -sh * | sort -hr | head -10  # Find large files
```

## 🔊 Audio Issues

### No Audio Output

**❌ Audio Device Issues**
```bash
# Check audio devices (Linux)
pactl list sinks

# Check audio settings (macOS)
# System Preferences > Sound

# Check audio settings (Windows)
# Control Panel > Sound
```

**❌ Web Audio API Issues**
- Try refreshing the page
- Check browser audio permissions
- Update audio drivers

### Audio Generation Fails

**❌ Sample Rate Issues**
```bash
# Check system audio settings
# Ensure sample rate is supported (44.1kHz, 48kHz)
```

**❌ Buffer Size Issues**
- Reduce batch size
- Increase system memory
- Close other audio applications

## 🎨 Graphics/Rendering Issues

### Canvas Rendering Problems

**❌ Hardware Acceleration Issues**
```bash
# Disable hardware acceleration
./TPT\ Asset\ Editor --disable-gpu

# Or in application settings
```

**❌ WebGL Issues**
```bash
# Check WebGL support
# Chrome DevTools Console:
# console.log(!!window.WebGLRenderingContext);
```

### Sprite Generation Issues

**❌ Memory Issues During Generation**
- Reduce batch size
- Close other applications
- Increase virtual memory/swap

**❌ Color/Quality Issues**
- Check graphics driver versions
- Try different export formats
- Verify canvas context

## 🌐 Network Issues

### Download/Update Failures

**❌ Proxy/Firewall Issues**
```bash
# Configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Or bypass proxy for localhost
```

**❌ SSL/Certificate Issues**
```bash
# Disable SSL verification (not recommended for production)
npm config set strict-ssl false
```

## 📊 Performance Optimization

### Speed Up Builds

```bash
# Use build cache
npm run build -- --cache

# Parallel processing
export JOBS=max

# Exclude unnecessary files
echo "node_modules/.bin/*" >> .electronignore
echo "*.md" >> .electronignore
echo "docs/**/*" >> .electronignore
```

### Reduce Bundle Size

```json
{
  "build": {
    "compression": "maximum",
    "win": { "target": "nsis" },
    "mac": { "target": "dmg" },
    "linux": { "target": "AppImage" }
  }
}
```

### Memory Optimization

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Monitor memory usage
node --expose-gc --inspect
```

## 🔍 Advanced Debugging

### Enable Debug Logging

```bash
# Run with debug logging
DEBUG=* npm start

# Electron debug mode
npm run dev

# Verbose build logging
npm run build -- --publish never --verbose
```

### DevTools Access

```bash
# Open DevTools programmatically
# In main.js, add:
mainWindow.webContents.openDevTools();

# Or press F12 in the application
```

### System Logs

**Windows:**
- Event Viewer → Windows Logs → Application
- `%APPDATA%\TPT Asset Editor\logs\`

**macOS:**
- Console.app
- `~/Library/Logs/TPT Asset Editor/`

**Linux:**
- `journalctl -f`
- `/var/log/syslog`
- `~/.config/TPT Asset Editor/logs/`

## 🚑 Emergency Recovery

### Complete Reset
```bash
# Backup important data
cp -r userData userData.backup

# Remove all application data
rm -rf userData node_modules dist

# Fresh install
npm install
npm start
```

### Database Recovery
```bash
# Export data before reset
sqlite3 userData/tpt-assets.db .dump > backup.sql

# Recreate database
rm userData/tpt-assets.db
# Restart application to recreate

# Import data if needed
sqlite3 userData/tpt-assets.db < backup.sql
```

## 📞 Getting Help

### Self-Help Resources
- Check this troubleshooting guide first
- Review platform-specific guides
- Search existing issues on GitHub
- Check system requirements

### Debug Information to Provide
When asking for help, include:
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Error messages (full stack trace)
- Steps to reproduce the issue
- System specifications (RAM, CPU, GPU)

### Quick Health Check Script
```bash
#!/bin/bash
echo "=== TPT Asset Editor Health Check ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -a)"
echo "Memory: $(free -h | grep '^Mem:' | awk '{print $2}')"
echo "Disk: $(df -h . | tail -1 | awk '{print $4}')"
echo "=== End Health Check ==="
```

## 🎯 Prevention Tips

- Keep Node.js and npm updated
- Use LTS versions of Node.js
- Regularly clear npm cache
- Keep build tools updated
- Monitor disk space
- Backup important data regularly
- Test builds on clean systems

---

*Most issues can be resolved by ensuring proper system setup and following the installation guides. Start with the [Quick Start Guide](./QUICK-START.md) and work through the platform-specific guides for your system.*
