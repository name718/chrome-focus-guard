# FocusGuard 测试指南

## Service Worker 修复验证

### 问题描述
之前的错误：`Service worker registration failed. Status code: 15`

**原因**: 在Manifest V3中，Service Worker不能使用ES6模块语法（`import`语句）

**解决方案**: 将模块功能内联到Service Worker中，移除`"type": "module"`

### 修复内容

#### 1. Manifest.json 更新
```json
// 修复前
"background": {
  "service_worker": "background/service-worker.js",
  "type": "module"  // ❌ 移除此行
}

// 修复后  
"background": {
  "service_worker": "background/service-worker.js"  // ✅ 无type字段
}
```

#### 2. Service Worker 重构
- ❌ 移除 `import` 语句
- ✅ 内联存储管理功能 (`FocusGuardStorage` 类)
- ✅ 内联URL匹配功能 (`URLMatcher` 类)

### 测试步骤

#### 1. 构建扩展
```bash
# 生产构建（推荐）
npm run build

# 或快速构建
npm run build:simple
```

#### 2. 在Chrome中加载
1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist/` 目录

#### 3. 验证Service Worker
1. 在扩展管理页面查看扩展状态
2. 应该显示"已启用"状态，无错误信息
3. 点击"Service Worker"链接，应该能正常打开DevTools

#### 4. 功能测试
1. **基础功能**: 点击扩展图标，弹出窗口应该正常显示
2. **后台功能**: 在Console中应该看到 `[FocusGuard] Extension installed/updated` 日志
3. **权限功能**: 扩展应该能正常访问storage、tabs等权限

### 预期结果

#### ✅ 成功标志
- Service Worker 成功注册
- 扩展状态显示"已启用"
- 无错误信息或警告
- 基础功能正常工作

#### ❌ 失败标志
- Service Worker 注册失败
- 扩展状态显示错误
- Console中有错误信息
- 功能无法正常使用

### 故障排除

#### 如果仍有问题

1. **检查构建输出**
```bash
ls -la dist/
cat dist/manifest.json
```

2. **检查Service Worker文件**
```bash
cat dist/background/service-worker.js | head -5
```

3. **重新构建**
```bash
npm run clean
npm run build
```

4. **检查Chrome版本**
- 确保Chrome版本 >= 88（支持Manifest V3）

5. **清除扩展缓存**
- 在扩展管理页面点击"重新加载"
- 或完全删除后重新加载

### 开发建议

#### 1. 使用简化构建进行开发
```bash
npm run build:simple:watch
```
- 快速迭代，无需等待webpack编译
- 文件变化时自动重新构建

#### 2. 生产发布前使用webpack构建
```bash
npm run build
```
- 代码压缩和优化
- 更好的性能和兼容性

#### 3. 测试流程
```bash
# 1. 开发测试
npm run build:simple
# 在Chrome中测试

# 2. 生产测试  
npm run build
# 在Chrome中测试

# 3. 发布打包
npm run zip
```

### 技术细节

#### Service Worker 限制
- 不能使用 `import` 语句
- 不能使用 `export` 语句
- 必须使用传统的JavaScript语法
- 支持 `async/await` 和现代JavaScript特性

#### 解决方案选择
1. **内联功能**: 将模块功能直接写入Service Worker
2. **动态导入**: 使用 `import()` 动态加载（需要额外配置）
3. **消息传递**: 通过消息与content scripts通信

我们选择了方案1（内联功能），因为它最简单、最可靠，符合Chrome扩展的最佳实践。

### 总结

Service Worker注册失败的问题已经通过以下方式解决：

1. ✅ 移除 `"type": "module"` 配置
2. ✅ 内联存储和URL匹配功能
3. ✅ 保持所有原有功能
4. ✅ 符合Manifest V3规范

现在扩展应该能够正常加载和工作了！🎉
