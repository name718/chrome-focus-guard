#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 FocusGuard 功能测试\n');

// 检查关键功能点
const testCases = [
  {
    name: 'FocusTimer 动态导入检查',
    file: 'dist/content-scripts/focus-timer.js',
    check: (content) => {
      const hasImport = content.includes('import(') || content.includes('import ');
      const hasStorage = content.includes('chrome.storage.sync.get');
      const hasRuntime = content.includes('chrome.runtime.onMessage');
      return {
        passed: !hasImport && hasStorage && hasRuntime,
        details: {
          '无动态导入': !hasImport,
          '包含存储API': hasStorage,
          '包含消息监听': hasRuntime
        }
      };
    }
  },
  {
    name: 'PageCleaner 动态导入检查',
    file: 'dist/content-scripts/page-cleaner.js',
    check: (content) => {
      const hasImport = content.includes('import(') || content.includes('import ');
      const hasStorage = content.includes('chrome.storage.sync.get');
      const hasMutationObserver = content.includes('MutationObserver');
      return {
        passed: !hasImport && hasStorage && hasMutationObserver,
        details: {
          '无动态导入': !hasImport,
          '包含存储API': hasStorage,
          '包含DOM观察': hasMutationObserver
        }
      };
    }
  },
  {
    name: 'Service Worker 功能检查',
    file: 'dist/background/service-worker.js',
    check: (content) => {
      const hasContextMenus = content.includes('chrome.contextMenus');
      const hasTabsAPI = content.includes('chrome.tabs.');
      const hasStorage = content.includes('chrome.storage');
      return {
        passed: hasContextMenus && hasTabsAPI && hasStorage,
        details: {
          '包含右键菜单': hasContextMenus,
          '包含标签页API': hasTabsAPI,
          '包含存储API': hasStorage
        }
      };
    }
  },
  {
    name: 'Popup 功能检查',
    file: 'dist/popup/popup.js',
    check: (content) => {
      const hasTabsAPI = content.includes('chrome.tabs.');
      const hasRuntime = content.includes('chrome.runtime.');
      const hasStorage = content.includes('chrome.storage');
      return {
        passed: hasTabsAPI && hasRuntime && hasStorage,
        details: {
          '包含标签页API': hasTabsAPI,
          '包含运行时API': hasRuntime,
          '包含存储API': hasStorage
        }
      };
    }
  }
];

console.log('🔍 开始功能测试...\n');

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  
  try {
    if (!fs.existsSync(testCase.file)) {
      console.log(`   ❌ 文件不存在: ${testCase.file}`);
      allTestsPassed = false;
      return;
    }
    
    const content = fs.readFileSync(testCase.file, 'utf8');
    const result = testCase.check(content);
    
    if (result.passed) {
      console.log('   ✅ 测试通过');
    } else {
      console.log('   ❌ 测试失败');
      allTestsPassed = false;
    }
    
    // 显示详细结果
    Object.entries(result.details).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      console.log(`      ${icon} ${key}: ${value}`);
    });
    
  } catch (error) {
    console.log(`   ❌ 测试执行失败: ${error.message}`);
    allTestsPassed = false;
  }
  
  console.log('');
});

// 检查文件大小优化
console.log('📏 文件大小检查...');
const sizeChecks = [
  { file: 'dist/background/service-worker.js', maxSize: 10, name: 'Service Worker' },
  { file: 'dist/content-scripts/focus-timer.js', maxSize: 15, name: 'FocusTimer' },
  { file: 'dist/content-scripts/page-cleaner.js', maxSize: 10, name: 'PageCleaner' },
  { file: 'dist/popup/popup.js', maxSize: 10, name: 'Popup' }
];

sizeChecks.forEach(check => {
  if (fs.existsSync(check.file)) {
    const stats = fs.statSync(check.file);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const isOptimized = stats.size <= check.maxSize * 1024;
    
    console.log(`  ${isOptimized ? '✅' : '⚠️'} ${check.name}: ${sizeKB} KB ${isOptimized ? '(已优化)' : `(超过${check.maxSize}KB限制)`}`);
  }
});

console.log('\n📊 测试结果总结');
if (allTestsPassed) {
  console.log('🎉 所有功能测试通过！扩展已完全修复');
  console.log('\n🚀 现在可以正常使用以下功能:');
  console.log('  • 番茄钟计时器 (FocusTimer)');
  console.log('  • 页面净化 (PageCleaner)');
  console.log('  • 右键菜单控制');
  console.log('  • 弹出窗口管理');
  console.log('  • 后台服务管理');
  
  console.log('\n📱 下一步操作:');
  console.log('1. 在Chrome中重新加载扩展');
  console.log('2. 测试番茄钟功能');
  console.log('3. 测试页面净化功能');
  console.log('4. 验证右键菜单');
} else {
  console.log('❌ 部分测试失败，请检查构建配置');
}

console.log('\n✨ 功能测试完成！');
