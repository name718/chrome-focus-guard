#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

class SimpleBuilder {
  constructor() {
    this.rootDir = __dirname;
    this.distDir = path.join(this.rootDir, 'dist');
  }

  async build() {
    console.log('🚀 Starting simple build process...');
    
    try {
      // 清理构建目录
      await this.clean();
      
      // 复制文件
      await this.copyFiles();
      
      // 创建构建信息
      await this.createBuildInfo();
      
      console.log('✅ Simple build completed successfully!');
      
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

  async copyFiles() {
    console.log('📁 Copying files...');
    
    // 复制目录
    const dirs = [
      'background',
      'content-scripts', 
      'popup',
      'options',
      'pages',
      'utils'
    ];
    
    for (const dir of dirs) {
      const srcPath = path.join(this.rootDir, dir);
      const destPath = path.join(this.distDir, dir);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        console.log(`  ✓ Copied ${dir}/`);
      }
    }
    
    // 复制manifest.json
    await fs.copy(
      path.join(this.rootDir, 'manifest.json'),
      path.join(this.distDir, 'manifest.json')
    );
    console.log('  ✓ Copied manifest.json');
  }

  async createBuildInfo() {
    console.log('📝 Creating build info...');
    
    const packageJson = require('./package.json');
    const buildInfo = {
      version: packageJson.version,
      buildTime: new Date().toISOString(),
      buildType: 'simple',
      buildMethod: 'file-copy'
    };
    
    await fs.writeJson(
      path.join(this.distDir, 'build-info.json'),
      buildInfo,
      { spaces: 2 }
    );
    
    console.log('  ✓ Created build-info.json');
  }

  async watch() {
    console.log('👀 Starting file watcher...');
    
    // 简单的文件监听实现
    const chokidar = require('chokidar');
    
    const watcher = chokidar.watch([
      'background/**/*',
      'content-scripts/**/*',
      'popup/**/*',
      'options/**/*',
      'pages/**/*',
      'utils/**/*',
      'manifest.json'
    ], {
      ignored: /node_modules|dist/,
      persistent: true
    });
    
    watcher.on('change', async (filePath) => {
      console.log(`🔄 File changed: ${filePath}`);
      await this.build();
    });
    
    console.log('  ✓ File watcher started');
    console.log('  Press Ctrl+C to stop');
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];

const builder = new SimpleBuilder();

switch (command) {
  case 'watch':
    builder.watch();
    break;
  case 'build':
  default:
    builder.build();
    break;
}
