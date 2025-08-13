#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 FocusGuard Extension 测试检查\n');

// 检查构建输出
const distDir = path.join(__dirname, 'dist');
const requiredFiles = [
  'manifest.json',
  'background/service-worker.js',
  'content-scripts/content.js',
  'content-scripts/focus-timer.js',
  'content-scripts/page-cleaner.js',
  'popup/index.html',
  'popup/popup.js',
  'options/index.html',
  'options/options.js',
  'pages/focus-redirect.html',
  'pages/focus-redirect.js'
];

console.log('📁 检查构建文件...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`  ✅ ${file} (${size} KB)`);
  } else {
    console.log(`  ❌ ${file} - 缺失`);
    allFilesExist = false;
  }
});

// 检查manifest.json
console.log('\n📋 检查manifest.json...');
try {
  const manifestPath = path.join(distDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log(`  ✅ manifest_version: ${manifest.manifest_version}`);
  console.log(`  ✅ name: ${manifest.name}`);
  console.log(`  ✅ version: ${manifest.version}`);
  
  // 检查权限
  if (manifest.permissions && manifest.permissions.includes('contextMenus')) {
    console.log('  ✅ contextMenus权限已添加');
  } else {
    console.log('  ❌ contextMenus权限缺失');
    allFilesExist = false;
  }
  
  // 检查Service Worker
  if (manifest.background && manifest.background.service_worker) {
    console.log('  ✅ Service Worker配置正确');
  } else {
    console.log('  ❌ Service Worker配置错误');
    allFilesExist = false;
  }
  
} catch (error) {
  console.log(`  ❌ manifest.json解析失败: ${error.message}`);
  allFilesExist = false;
}

// 检查Service Worker文件
console.log('\n🔧 检查Service Worker...');
try {
  const swPath = path.join(distDir, 'background/service-worker.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  
  if (swContent.includes('import') || swContent.includes('export')) {
    console.log('  ❌ Service Worker包含ES6模块语法');
    allFilesExist = false;
  } else {
    console.log('  ✅ Service Worker无ES6模块语法');
  }
  
  if (swContent.includes('chrome.contextMenus')) {
    console.log('  ✅ Service Worker包含contextMenus功能');
  } else {
    console.log('  ❌ Service Worker缺少contextMenus功能');
    allFilesExist = false;
  }
  
  const size = (swContent.length / 1024).toFixed(2);
  console.log(`  📏 Service Worker大小: ${size} KB`);
  
} catch (error) {
  console.log(`  ❌ Service Worker检查失败: ${error.message}`);
  allFilesExist = false;
}

// 总结
console.log('\n📊 测试结果总结');
if (allFilesExist) {
  console.log('🎉 所有检查通过！扩展已准备就绪');
  console.log('\n📱 下一步操作:');
  console.log('1. 在Chrome中打开 chrome://extensions/');
  console.log('2. 开启"开发者模式"');
  console.log('3. 点击"加载已解压的扩展程序"');
  console.log('4. 选择 dist/ 目录');
  console.log('5. 验证扩展状态为"已启用"');
} else {
  console.log('❌ 发现问题，请检查构建配置');
  console.log('\n🔧 建议操作:');
  console.log('1. 运行 npm run clean');
  console.log('2. 运行 npm run build');
  console.log('3. 重新运行此测试脚本');
}

console.log('\n✨ 测试完成！');
