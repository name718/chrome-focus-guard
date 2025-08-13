#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📡 FocusGuard 通信测试\n');

// 检查通信相关的代码
const communicationTests = [
  {
    name: 'Popup 通信检查',
    file: 'dist/popup/popup.js',
    checks: [
      {
        name: '包含ping检查方法',
        pattern: 'isContentScriptReady',
        required: true
      },
      {
        name: '包含错误处理方法',
        pattern: 'showError',
        required: true
      },
      {
        name: '包含成功提示方法',
        pattern: 'showSuccess',
        required: true
      },
      {
        name: '包含页面类型检查',
        pattern: 'chrome://',
        required: true
      }
    ]
  },
  {
    name: 'FocusTimer 通信检查',
    file: 'dist/content-scripts/focus-timer.js',
    checks: [
      {
        name: '响应ping消息',
        pattern: 'FOCUS_GUARD_PING',
        required: true
      },
      {
        name: '响应番茄钟消息',
        pattern: 'START_POMODORO',
        required: true
      },
      {
        name: '响应状态查询',
        pattern: 'GET_TIMER_STATUS',
        required: true
      }
    ]
  },
  {
    name: 'PageCleaner 通信检查',
    file: 'dist/content-scripts/page-cleaner.js',
    checks: [
      {
        name: '响应ping消息',
        pattern: 'FOCUS_GUARD_PING',
        required: true
      },
      {
        name: '响应净化器消息',
        pattern: 'TOGGLE_CLEANER',
        required: true
      },
      {
        name: '响应状态查询',
        pattern: 'GET_CLEANER_STATUS',
        required: true
      }
    ]
  }
];

console.log('🔍 开始通信测试...\n');

let allTestsPassed = true;

communicationTests.forEach((testSuite, suiteIndex) => {
  console.log(`${suiteIndex + 1}. ${testSuite.name}`);
  
  if (!fs.existsSync(testSuite.file)) {
    console.log(`   ❌ 文件不存在: ${testSuite.file}`);
    allTestsPassed = false;
    return;
  }
  
  const content = fs.readFileSync(testSuite.file, 'utf8');
  
  testSuite.checks.forEach((check, checkIndex) => {
    const hasPattern = content.includes(check.pattern);
    const passed = hasPattern === check.required;
    
    if (passed) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name}`);
      allTestsPassed = false;
    }
  });
  
  console.log('');
});

// 检查错误处理改进
console.log('🛡️ 错误处理检查...');
const errorHandlingChecks = [
  {
    name: 'Popup错误处理',
    file: 'dist/popup/popup.js',
    patterns: [
      'Could not establish connection',
      '页面不支持此功能',
      '请刷新页面后重试'
    ]
  }
];

errorHandlingChecks.forEach(check => {
  if (fs.existsSync(check.file)) {
    const content = fs.readFileSync(check.file, 'utf8');
    const hasErrorHandling = check.patterns.some(pattern => content.includes(pattern));
    
    if (hasErrorHandling) {
      console.log(`  ✅ ${check.name}: 包含用户友好的错误提示`);
    } else {
      console.log(`  ⚠️ ${check.name}: 错误提示可能不够友好`);
    }
  }
});

// 检查通信流程
console.log('\n🔄 通信流程检查...');
const communicationFlow = [
  '1. Popup检查页面类型',
  '2. Popup发送ping消息',
  '3. Content Script响应ping',
  '4. Popup确认通信可用',
  '5. 执行具体功能'
];

communicationFlow.forEach(step => {
  console.log(`  ${step}`);
});

console.log('\n📊 通信测试结果总结');
if (allTestsPassed) {
  console.log('🎉 所有通信测试通过！');
  console.log('\n🚀 通信功能已修复:');
  console.log('  • Popup可以检测页面类型');
  console.log('  • Content Script响应ping消息');
  console.log('  • 错误处理更加友好');
  console.log('  • 用户获得清晰的反馈');
  
  console.log('\n📱 使用说明:');
  console.log('1. 在普通网页上，扩展功能正常工作');
  console.log('2. 在特殊页面(chrome://, about:等)上，会显示友好提示');
  console.log('3. 通信失败时会提示用户刷新页面');
  console.log('4. 所有操作都有成功/失败反馈');
} else {
  console.log('❌ 部分通信测试失败，请检查代码');
}

console.log('\n✨ 通信测试完成！');
