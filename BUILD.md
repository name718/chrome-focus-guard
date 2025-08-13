# FocusGuard 构建配置文档

## 概述

FocusGuard Chrome扩展提供了两种构建方式：
1. **Webpack构建** - 生产环境推荐，提供代码优化和压缩
2. **简化构建** - 开发环境推荐，快速文件复制，无需编译

## 快速开始

### 安装依赖
```bash
npm install
```

### 构建扩展
```bash
# 生产构建（推荐）
npm run build

# 快速开发构建
npm run build:simple
```

## 构建方式详解

### 1. Webpack构建（生产推荐）

#### 特性
- ✅ 代码压缩和优化
- ✅ Babel转译（支持现代JavaScript语法）
- ✅ 模块化打包
- ✅ Source Map支持
- ✅ 代码分割优化

#### 命令
```bash
npm run build          # 生产构建
npm run build:dev      # 开发构建（包含source map）
npm run dev            # 开发模式（监听文件变化）
```

#### 输出目录
```
dist/
├── background/service-worker.js    # 压缩后的后台脚本
├── content-scripts/                # 压缩后的内容脚本
├── popup/                          # 压缩后的弹出窗口
├── options/                        # 压缩后的选项页面
├── pages/                          # 压缩后的特殊页面
└── manifest.json                   # 扩展清单
```

### 2. 简化构建（开发推荐）

#### 特性
- ✅ 快速构建（无需编译）
- ✅ 直接文件复制
- ✅ 适合快速开发和测试
- ✅ 支持文件监听

#### 命令
```bash
npm run build:simple           # 单次构建
npm run build:simple:watch     # 监听文件变化
```

#### 输出目录
```
dist/
├── background/                 # 原始后台脚本
├── content-scripts/            # 原始内容脚本
├── popup/                      # 原始弹出窗口
├── options/                    # 原始选项页面
├── pages/                      # 原始特殊页面
├── utils/                      # 工具函数
├── manifest.json               # 扩展清单
└── build-info.json             # 构建信息
```

## 配置文件说明

### Webpack配置 (`webpack.config.js`)
- **入口文件**: 分别配置各个模块的入口点
- **Babel转译**: 支持ES2020语法，目标Chrome 88+
- **文件复制**: 自动复制HTML和manifest文件
- **优化配置**: 生产环境代码压缩

### Babel配置 (`.babelrc`)
- **目标环境**: Chrome 88+ (支持Manifest V3)
- **语法支持**: ES2020、Class Properties等
- **运行时支持**: 自动polyfill

### 简化构建脚本 (`build-simple.js`)
- **文件监听**: 自动检测文件变化
- **增量构建**: 只复制修改的文件
- **构建信息**: 生成详细的构建报告

## 开发工作流

### 日常开发
```bash
# 1. 启动文件监听
npm run build:simple:watch

# 2. 修改代码（自动重新构建）

# 3. 在Chrome中重新加载扩展
```

### 生产发布
```bash
# 1. 构建生产版本
npm run build

# 2. 创建发布包
npm run zip

# 3. 测试构建结果
# 在Chrome中加载dist/目录
```

### 快速测试
```bash
# 1. 快速构建
npm run build:simple

# 2. 立即测试
# 在Chrome中加载dist/目录
```

## 构建输出对比

| 特性 | Webpack构建 | 简化构建 |
|------|-------------|----------|
| 构建速度 | 慢（需要编译） | 快（直接复制） |
| 代码大小 | 小（压缩优化） | 大（原始大小） |
| 开发体验 | 好（热重载） | 很好（即时生效） |
| 生产适用性 | 优秀 | 一般 |
| 调试支持 | 好（Source Map） | 很好（原始代码） |

## 故障排除

### 常见问题

#### 1. Webpack构建失败
```bash
# 清理并重新安装依赖
npm run clean
rm -rf node_modules
npm install
npm run build
```

#### 2. 简化构建失败
```bash
# 检查文件权限
chmod +x build-simple.js

# 手动运行构建脚本
node build-simple.js
```

#### 3. 扩展加载失败
```bash
# 检查构建输出
ls -la dist/

# 验证manifest.json
cat dist/manifest.json

# 重新构建
npm run build:simple
```

### 调试技巧

#### Webpack调试
```bash
# 启用详细日志
npm run build:dev

# 检查webpack配置
node -e "console.log(require('./webpack.config.js'))"
```

#### 简化构建调试
```bash
# 启用详细日志
DEBUG=* npm run build:simple

# 检查构建脚本
node -e "console.log(require('./build-simple.js'))"
```

## 性能优化建议

### 开发环境
- 使用 `npm run build:simple:watch` 进行快速迭代
- 避免频繁的webpack构建
- 利用Chrome扩展的热重载功能

### 生产环境
- 使用 `npm run build` 进行最终构建
- 启用代码压缩和优化
- 测试构建后的扩展性能

### 持续集成
```bash
# CI/CD脚本示例
npm ci                    # 安装依赖
npm run build            # 生产构建
npm run zip              # 创建发布包
# 上传到Chrome Web Store
```

## 总结

FocusGuard提供了灵活的构建配置，满足不同开发阶段的需求：

- **开发阶段**: 使用简化构建，快速迭代
- **测试阶段**: 使用webpack开发构建，验证功能
- **发布阶段**: 使用webpack生产构建，优化性能

选择合适的构建方式可以显著提升开发效率和产品质量。
