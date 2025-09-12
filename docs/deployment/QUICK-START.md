# 🚀 TPT Asset Editor - 5-Minute Setup Guide

Get the TPT Asset Editor up and running on your system in just 5 minutes!

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## ⚡ Quick Setup (5 Minutes)

### Step 1: Download the Project (1 minute)
```bash
# Clone the repository
git clone <your-repo-url> tpt-asset-editor
cd tpt-asset-editor
```

### Step 2: Install Dependencies (2 minutes)
```bash
# Install all required packages
npm install
```
*This will download ~200MB of dependencies. Time depends on your internet connection.*

### Step 3: Run the Application (30 seconds)
```bash
# Start the application
npm start
```

### Step 4: Verify Installation (1 minute)
- The TPT Asset Editor window should open
- You should see the dashboard with asset generation options
- Try generating a simple character asset to test

## 🎯 First Test - Generate Your First Asset

1. Click **"Asset Generator"** in the sidebar
2. Select **"Character"** from the asset types
3. Choose **"Warrior"** as the class type
4. Click **"Generate Asset"**
5. Click **"Save Asset"** to store it

**Success!** You've just created your first procedural asset! 🎉

## 🏗️ Build for Distribution (Optional)

If you want to create an installer for sharing:

### Windows
```bash
npm run build
# Find installer in: ./dist/
```

### macOS
```bash
npm run build
# Find .dmg file in: ./dist/
```

### Linux
```bash
npm run build
# Find AppImage in: ./dist/
```

## 🔧 Development Mode

For development with live reloading:
```bash
# Run with developer tools
npm run dev
```

## 🐛 Having Issues?

### Common Problems & Solutions

**❌ "npm install" fails**
- Check your Node.js version: `node --version`
- Clear npm cache: `npm cache clean --force`
- Try with different network or VPN

**❌ Application won't start**
- Check if port 3000 is available
- Try running as administrator/sudo
- Check antivirus/firewall settings

**❌ Build fails**
- Ensure you have enough disk space
- Try `npm run clean` then rebuild
- Check for missing system dependencies

### Get Help
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review the [Platform-Specific Guides](./platforms/)

## 📚 What's Next?

- **Learn the Interface**: Explore different asset types
- **Batch Processing**: Generate hundreds of assets at once
- **Templates**: Save and reuse your favorite configurations
- **Export Options**: Learn about different export formats

## 🎉 You're All Set!

The TPT Asset Editor is now ready for creating amazing procedural assets for your games and projects!

**Happy Creating!** 🎨
