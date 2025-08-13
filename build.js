#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class BuildManager {
  constructor() {
    this.rootDir = __dirname;
    this.srcDir = path.join(this.rootDir, 'src');
    this.distDir = path.join(this.rootDir, 'dist');
    this.version = require('./package.json').version;
  }

  async build() {
    console.log('🚀 Starting FocusGuard build process...');
    
    try {
      // 清理构建目录
      await this.clean();
      
      // 复制源文件到src目录
      await this.copySourceFiles();
      
      // 运行webpack构建
      await this.runWebpack();
      
      // 后处理构建文件
      await this.postProcess();
      
      // 创建发布包
      await this.createReleasePackage();
      
      console.log('✅ Build completed successfully!');
      
    } catch (error) {
      console.error('❌ Build failed:', error);
      process.exit(1);
    }
  }

  async clean() {
    console.log('🧹 Cleaning build directory...');
    await fs.remove(this.distDir);
    await fs.ensureDir(this.distDir);
  }

  async copySourceFiles() {
    console.log('📁 Copying source files...');
    
    // 创建src目录结构
    const srcDirs = [
      'background',
      'content-scripts', 
      'popup',
      'options',
      'pages',
      'utils'
    ];
    
    for (const dir of srcDirs) {
      const srcPath = path.join(this.rootDir, dir);
      const destPath = path.join(this.srcDir, dir);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
      }
    }
    
    // 复制manifest.json
    await fs.copy(
      path.join(this.rootDir, 'manifest.json'),
      path.join(this.srcDir, 'manifest.json')
    );
  }

  async runWebpack() {
    console.log('🔨 Running webpack build...');
    
    try {
      execSync('npm run build', { 
        stdio: 'inherit',
        cwd: this.rootDir 
      });
    } catch (error) {
      throw new Error('Webpack build failed');
    }
  }

  async postProcess() {
    console.log('🔧 Post-processing build files...');
    
    // 更新manifest.json中的版本号
    const manifestPath = path.join(this.distDir, 'manifest.json');
    if (await fs.pathExists(manifestPath)) {
      let manifest = await fs.readJson(manifestPath);
      manifest.version = this.version;
      await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    }
    
    // 创建构建信息文件
    const buildInfo = {
      version: this.version,
      buildTime: new Date().toISOString(),
      buildType: 'production'
    };
    
    await fs.writeJson(
      path.join(this.distDir, 'build-info.json'),
      buildInfo,
      { spaces: 2 }
    );
  }

  async createReleasePackage() {
    console.log('📦 Creating release package...');
    
    const zipName = `focus-guard-v${this.version}.zip`;
    const zipPath = path.join(this.rootDir, zipName);
    
    try {
      // 使用系统zip命令创建压缩包
      execSync(`cd ${this.distDir} && zip -r ${zipPath} .`, {
        stdio: 'inherit'
      });
      
      console.log(`📦 Release package created: ${zipName}`);
    } catch (error) {
      console.warn('⚠️  Failed to create zip package, continuing...');
    }
  }

  async dev() {
    console.log('🔄 Starting development build...');
    
    try {
      // 复制源文件
      await this.copySourceFiles();
      
      // 运行开发模式webpack
      execSync('npm run dev', { 
        stdio: 'inherit',
        cwd: this.rootDir 
      });
      
    } catch (error) {
      console.error('❌ Development build failed:', error);
      process.exit(1);
    }
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

const buildManager = new BuildManager();

switch (command) {
  case 'dev':
    buildManager.dev();
    break;
  case 'build':
  default:
    buildManager.build();
    break;
}
