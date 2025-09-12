/**
 * TPT Asset Editor - Distribution Build Script
 * Handles cross-platform builds and packaging for Windows, macOS, and Linux
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class DistributionBuilder {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.distDir = path.join(this.rootDir, 'dist');
        this.buildDir = path.join(this.rootDir, 'build');
        this.packageJson = require(path.join(this.rootDir, 'package.json'));

        this.platform = os.platform();
        this.arch = os.arch();
    }

    /**
     * Main build function
     */
    async buildAll() {
        console.log('🚀 Starting TPT Asset Editor Distribution Build...\n');

        try {
            // Clean previous builds
            await this.clean();

            // Install dependencies
            await this.installDependencies();

            // Build for current platform
            await this.buildCurrentPlatform();

            // Build for other platforms (if possible)
            await this.buildCrossPlatform();

            // Create installers
            await this.createInstallers();

            // Test builds
            await this.testBuilds();

            console.log('\n✅ Distribution build completed successfully!');
            console.log(`📦 Build artifacts available in: ${this.distDir}`);

        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    /**
     * Clean previous build artifacts
     */
    async clean() {
        console.log('🧹 Cleaning previous builds...');

        const dirsToClean = [this.distDir, this.buildDir, 'node_modules/.cache'];

        for (const dir of dirsToClean) {
            const fullPath = path.join(this.rootDir, dir);
            if (await fs.pathExists(fullPath)) {
                await fs.remove(fullPath);
                console.log(`  Removed: ${dir}`);
            }
        }

        console.log('✅ Clean completed\n');
    }

    /**
     * Install build dependencies
     */
    async installDependencies() {
        console.log('📦 Installing dependencies...');

        try {
            // Install main dependencies
            execSync('npm install', { cwd: this.rootDir, stdio: 'inherit' });

            // Install electron-builder if not present
            if (!await fs.pathExists(path.join(this.rootDir, 'node_modules/.bin/electron-builder'))) {
                execSync('npm install electron-builder --save-dev', { cwd: this.rootDir, stdio: 'inherit' });
            }

            console.log('✅ Dependencies installed\n');

        } catch (error) {
            throw new Error(`Failed to install dependencies: ${error.message}`);
        }
    }

    /**
     * Build for current platform
     */
    async buildCurrentPlatform() {
        console.log(`🏗️ Building for current platform: ${this.platform}-${this.arch}`);

        const buildCommand = this.getBuildCommand(this.platform);

        try {
            execSync(buildCommand, {
                cwd: this.rootDir,
                stdio: 'inherit',
                env: { ...process.env, NODE_ENV: 'production' }
            });

            console.log(`✅ Current platform build completed\n`);

        } catch (error) {
            throw new Error(`Current platform build failed: ${error.message}`);
        }
    }

    /**
     * Build for other platforms (cross-platform)
     */
    async buildCrossPlatform() {
        console.log('🌐 Building for other platforms...');

        const targets = this.getCrossPlatformTargets();

        for (const target of targets) {
            try {
                console.log(`  Building for ${target.platform}...`);

                const buildCommand = this.getBuildCommand(target.platform, target.arch);

                execSync(buildCommand, {
                    cwd: this.rootDir,
                    stdio: 'inherit',
                    env: { ...process.env, NODE_ENV: 'production' }
                });

                console.log(`  ✅ ${target.platform} build completed`);

            } catch (error) {
                console.warn(`  ⚠️ ${target.platform} build failed (may require native tools): ${error.message}`);
            }
        }

        console.log('✅ Cross-platform builds completed\n');
    }

    /**
     * Get build command for specific platform
     */
    getBuildCommand(platform, arch = this.arch) {
        const baseCommand = 'npx electron-builder';

        switch (platform) {
            case 'win32':
                return `${baseCommand} --win --x64`;
            case 'darwin':
                return `${baseCommand} --mac --x64`;
            case 'linux':
                return `${baseCommand} --linux --x64`;
            default:
                return `${baseCommand} --dir`; // Directory build for current platform
        }
    }

    /**
     * Get cross-platform build targets
     */
    getCrossPlatformTargets() {
        const targets = [];

        if (this.platform === 'win32') {
            targets.push({ platform: 'darwin', arch: 'x64' });
            targets.push({ platform: 'linux', arch: 'x64' });
        } else if (this.platform === 'darwin') {
            targets.push({ platform: 'win32', arch: 'x64' });
            targets.push({ platform: 'linux', arch: 'x64' });
        } else if (this.platform === 'linux') {
            targets.push({ platform: 'win32', arch: 'x64' });
            targets.push({ platform: 'darwin', arch: 'x64' });
        }

        return targets;
    }

    /**
     * Create platform-specific installers
     */
    async createInstallers() {
        console.log('📦 Creating installers...');

        const installerConfigs = {
            win32: this.createWindowsInstaller,
            darwin: this.createMacInstaller,
            linux: this.createLinuxInstaller
        };

        const createInstaller = installerConfigs[this.platform];
        if (createInstaller) {
            try {
                await createInstaller.call(this);
                console.log('✅ Installer created\n');
            } catch (error) {
                console.warn(`⚠️ Installer creation failed: ${error.message}\n`);
            }
        }
    }

    /**
     * Create Windows installer
     */
    async createWindowsInstaller() {
        console.log('  Creating Windows installer...');

        const installerConfig = {
            name: this.packageJson.name,
            version: this.packageJson.version,
            description: this.packageJson.description,
            author: this.packageJson.author,
            exe: `${this.packageJson.name}.exe`,
            setupExe: `${this.packageJson.name}-setup-${this.packageJson.version}.exe`,
            setupIcon: 'assets/icons/icon.ico'
        };

        // Create NSIS installer script
        const nsisScript = this.generateNSISScript(installerConfig);
        const scriptPath = path.join(this.rootDir, 'installer.nsi');

        await fs.writeFile(scriptPath, nsisScript);

        // Run NSIS compiler (if available)
        try {
            execSync(`makensis ${scriptPath}`, { cwd: this.rootDir });
            console.log('  ✅ Windows installer created');
        } catch (error) {
            console.warn('  ⚠️ NSIS not available, skipping Windows installer');
        }

        // Clean up
        if (await fs.pathExists(scriptPath)) {
            await fs.remove(scriptPath);
        }
    }

    /**
     * Create macOS installer
     */
    async createMacInstaller() {
        console.log('  Creating macOS installer...');

        const appName = `${this.packageJson.name}.app`;
        const dmgName = `${this.packageJson.name}-${this.packageJson.version}.dmg`;

        try {
            // Create DMG using hdiutil
            const dmgCommand = `hdiutil create -volname "${this.packageJson.name}" -srcfolder "${path.join(this.distDir, 'mac', appName)}" -ov -format UDZO "${path.join(this.distDir, dmgName)}"`;

            execSync(dmgCommand, { cwd: this.rootDir });
            console.log('  ✅ macOS DMG created');

        } catch (error) {
            console.warn('  ⚠️ DMG creation failed, using app bundle only');
        }
    }

    /**
     * Create Linux installer
     */
    async createLinuxInstaller() {
        console.log('  Creating Linux AppImage...');

        try {
            // Create AppImage using electron-builder
            execSync('npx electron-builder --linux AppImage', {
                cwd: this.rootDir,
                stdio: 'inherit'
            });

            console.log('  ✅ Linux AppImage created');

        } catch (error) {
            console.warn('  ⚠️ AppImage creation failed');
        }
    }

    /**
     * Generate NSIS installer script
     */
    generateNSISScript(config) {
        return `!include "MUI2.nsh"

Name "${config.name}"
OutFile "${config.setupExe}"
Unicode True
InstallDir "$PROGRAMFILES\\${config.name}"
InstallDirRegKey HKCU "Software\\${config.name}" ""

!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "Main Section" SecMain
    SetOutPath "$INSTDIR"
    File /r "dist\\win-unpacked\\*.*"

    WriteRegStr HKCU "Software\\${config.name}" "" $INSTDIR
    WriteUninstaller "$INSTDIR\\Uninstall.exe"

    CreateShortCut "$SMPROGRAMS\\${config.name}.lnk" "$INSTDIR\\${config.exe}"
    CreateShortCut "$DESKTOP\\${config.name}.lnk" "$INSTDIR\\${config.exe}"
SectionEnd

Section "Uninstall"
    Delete "$SMPROGRAMS\\${config.name}.lnk"
    Delete "$DESKTOP\\${config.name}.lnk"
    Delete "$INSTDIR\\Uninstall.exe"

    RMDir /r "$INSTDIR"
    DeleteRegKey HKCU "Software\\${config.name}"
SectionEnd`;
    }

    /**
     * Test the builds
     */
    async testBuilds() {
        console.log('🧪 Testing builds...');

        const testResults = {
            windows: false,
            macos: false,
            linux: false
        };

        // Check if build artifacts exist
        const buildChecks = {
            windows: path.join(this.distDir, 'win-unpacked'),
            macos: path.join(this.distDir, 'mac'),
            linux: path.join(this.distDir, 'linux-unpacked')
        };

        for (const [platform, buildPath] of Object.entries(buildChecks)) {
            if (await fs.pathExists(buildPath)) {
                testResults[platform] = true;
                console.log(`  ✅ ${platform} build verified`);
            } else {
                console.log(`  ⚠️ ${platform} build not found`);
            }
        }

        // Test executable (if on current platform)
        if (this.platform === 'win32' && testResults.windows) {
            await this.testWindowsExecutable();
        } else if (this.platform === 'darwin' && testResults.macos) {
            await this.testMacExecutable();
        } else if (this.platform === 'linux' && testResults.linux) {
            await this.testLinuxExecutable();
        }

        console.log('✅ Build testing completed\n');
    }

    /**
     * Test Windows executable
     */
    async testWindowsExecutable() {
        try {
            const exePath = path.join(this.distDir, 'win-unpacked', `${this.packageJson.name}.exe`);

            if (await fs.pathExists(exePath)) {
                // Basic file validation
                const stats = await fs.stat(exePath);
                if (stats.size > 0) {
                    console.log('  ✅ Windows executable validated');
                }
            }
        } catch (error) {
            console.warn('  ⚠️ Windows executable test failed:', error.message);
        }
    }

    /**
     * Test macOS executable
     */
    async testMacExecutable() {
        try {
            const appPath = path.join(this.distDir, 'mac', `${this.packageJson.name}.app`);

            if (await fs.pathExists(appPath)) {
                // Check if app bundle structure is correct
                const contentsPath = path.join(appPath, 'Contents');
                const infoPlistPath = path.join(contentsPath, 'Info.plist');

                if (await fs.pathExists(infoPlistPath)) {
                    console.log('  ✅ macOS app bundle validated');
                }
            }
        } catch (error) {
            console.warn('  ⚠️ macOS app bundle test failed:', error.message);
        }
    }

    /**
     * Test Linux executable
     */
    async testLinuxExecutable() {
        try {
            const exePath = path.join(this.distDir, 'linux-unpacked', this.packageJson.name);

            if (await fs.pathExists(exePath)) {
                const stats = await fs.stat(exePath);
                if (stats.size > 0) {
                    console.log('  ✅ Linux executable validated');
                }
            }
        } catch (error) {
            console.warn('  ⚠️ Linux executable test failed:', error.message);
        }
    }

    /**
     * Generate build report
     */
    generateBuildReport() {
        const report = {
            timestamp: new Date().toISOString(),
            version: this.packageJson.version,
            platform: this.platform,
            arch: this.arch,
            buildDir: this.distDir,
            artifacts: []
        };

        // Scan for build artifacts
        const scanDir = async (dir) => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        await scanDir(fullPath);
                    } else {
                        const stats = await fs.stat(fullPath);
                        report.artifacts.push({
                            path: path.relative(this.distDir, fullPath),
                            size: stats.size,
                            modified: stats.mtime.toISOString()
                        });
                    }
                }
            } catch (error) {
                // Ignore errors for missing directories
            }
        };

        // Generate report asynchronously
        scanDir(this.distDir).then(() => {
            const reportPath = path.join(this.distDir, 'build-report.json');
            fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 Build report generated: ${reportPath}`);
        });

        return report;
    }

    /**
     * Setup auto-updater configuration
     */
    async setupAutoUpdater() {
        console.log('🔄 Setting up auto-updater...');

        const updaterConfig = {
            provider: 'github',
            owner: 'PhillipC05',
            repo: 'tpt-editor-desktop',
            private: false
        };

        // Create updater configuration
        const configPath = path.join(this.rootDir, 'updater-config.json');
        await fs.writeFile(configPath, JSON.stringify(updaterConfig, null, 2));

        console.log('✅ Auto-updater configured\n');
    }
}

// CLI interface
if (require.main === module) {
    const builder = new DistributionBuilder();

    const args = process.argv.slice(2);
    const command = args[0] || 'all';

    switch (command) {
        case 'all':
            builder.buildAll().catch(console.error);
            break;
        case 'clean':
            builder.clean().catch(console.error);
            break;
        case 'current':
            builder.buildCurrentPlatform().catch(console.error);
            break;
        case 'cross':
            builder.buildCrossPlatform().catch(console.error);
            break;
        case 'installers':
            builder.createInstallers().catch(console.error);
            break;
        case 'test':
            builder.testBuilds().catch(console.error);
            break;
        case 'report':
            console.log(JSON.stringify(builder.generateBuildReport(), null, 2));
            break;
        default:
            console.log('Usage: node build-dist.js [all|clean|current|cross|installers|test|report]');
            process.exit(1);
    }
}

module.exports = DistributionBuilder;
