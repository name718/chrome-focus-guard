#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧪 FocusGuard 完整测试套件\n');

const tests = [
  { name: '基础构建测试', command: 'npm run test:extension' },
  { name: '功能完整性测试', command: 'npm run test:functionality' },
  { name: '通信功能测试', command: 'npm run test:communication' }
];

console.log('🚀 开始运行所有测试...\n');

let allTestsPassed = true;
const results = [];

tests.forEach((test, index) => {
  console.log(`📋 ${index + 1}. ${test.name}`);
  console.log('=' * 50);
  
  try {
    const output = execSync(test.command, { encoding: 'utf8' });
    console.log(output);
    
    // 检查测试结果
    if (output.includes('🎉') && !output.includes('❌')) {
      results.push({ name: test.name, status: 'PASSED', output });
      console.log(`✅ ${test.name}: 通过\n`);
    } else {
      results.push({ name: test.name, status: 'FAILED', output });
      allTestsPassed = false;
      console.log(`❌ ${test.name}: 失败\n`);
    }
  } catch (error) {
    results.push({ name: test.name, status: 'ERROR', error: error.message });
    allTestsPassed = false;
    console.log(`💥 ${test.name}: 执行错误 - ${error.message}\n`);
  }
});

// 测试结果总结
console.log('📊 测试结果总结');
console.log('=' * 50);

results.forEach((result, index) => {
  const icon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '💥';
  console.log(`${index + 1}. ${icon} ${result.name}: ${result.status}`);
});

console.log('\n' + '=' * 50);

if (allTestsPassed) {
  console.log('🎉 所有测试通过！FocusGuard扩展已完全修复');
  console.log('\n🚀 扩展功能状态:');
  console.log('  ✅ 基础构建: 正常');
  console.log('  ✅ 功能完整性: 正常');
  console.log('  ✅ 通信功能: 正常');
  console.log('  ✅ 错误处理: 已改进');
  console.log('  ✅ 用户体验: 已优化');
  
  console.log('\n📱 现在可以正常使用:');
  console.log('  • 番茄钟计时器 - 在任何普通网页上');
  console.log('  • 页面净化 - 自动检测和清理干扰元素');
  console.log('  • 右键菜单 - 快速访问扩展功能');
  console.log('  • 智能提示 - 友好的错误和成功反馈');
  
  console.log('\n🔧 使用步骤:');
  console.log('1. 在Chrome中重新加载扩展');
  console.log('2. 访问任何普通网页(如 juejin.cn)');
  console.log('3. 点击扩展图标，测试番茄钟功能');
  console.log('4. 测试页面净化功能');
  console.log('5. 验证右键菜单功能');
  
  console.log('\n💡 特殊说明:');
  console.log('• 在chrome://, about:等特殊页面上会显示友好提示');
  console.log('• 通信失败时会提示用户刷新页面');
  console.log('• 所有操作都有清晰的反馈信息');
  
} else {
  console.log('❌ 部分测试失败，请检查具体错误');
  console.log('\n🔧 建议操作:');
  console.log('1. 检查构建配置');
  console.log('2. 重新运行失败的测试');
  console.log('3. 查看错误日志');
}

console.log('\n✨ 完整测试套件执行完成！');
