# Chrome FocusGuard Extension

## 产品定位
**名称**: FocusGuard / ZenMode / 专注结界  
**核心价值**: 帮助用户主动隔离干扰源 + 科学管理时间 + 净化工作环境，一站式解决"分心"痛点。

## 核心功能设计

### 1. 智能网站屏蔽系统

#### 黑名单管理
- 用户可手动添加/导入常见干扰网站（如微博、抖音、知乎热榜、游戏站点）
- 支持模糊匹配（如 `*.twitter.com/*`）和整站屏蔽

#### 专注时间计划
- 设置每日/每周的固定专注时段（如工作日 9:00-12:00）
- 支持"立即开启专注模式"的快捷入口

#### 重定向策略
当用户访问黑名单网站时，强制跳转至激励页面：
- 显示用户预设的待办事项清单（同步Todoist等工具）
- 动态展示励志名言或用户自定义标语（如"写完PPT再刷！"）
- 倒计时解锁功能（"5分钟后可访问"缓解戒断焦虑）

### 2. 沉浸式番茄钟

#### 场景化计时器
- 在当前标签页顶部嵌入半透明计时条（不打断工作流）
- 提供经典番茄钟（25分钟）和深度模式（50分钟）选项

#### 专注锁屏机制
- 计时结束自动冻结页面5秒，显示深呼吸动效 + 休息提示
- 用户需点击"确认休息"才能解除（防无意识跳过）

#### 数据成就系统
- 统计每日完成番茄数，生成专注趋势报告
- 解锁虚拟勋章（如"连续7天专注达人"）

### 3. 页面净化引擎

#### 干扰元素一键移除
点击插件图标激活"净化模式"，自动删除：
- 社交媒体侧边栏（微信/微博推荐）
- 视频网站评论区、相关推荐
- 新闻网站弹窗广告、热点推送

#### 智能预设规则库
- 预置主流网站（B站、Youtube、知乎）的净化规则
- 用户可自定义CSS选择器保存个人规则

## 技术架构

### Manifest V3 结构
```
chrome-focus-guard/
├── manifest.json              # 扩展清单文件
├── background/
│   └── service-worker.js      # 后台服务工作者
├── content-scripts/
│   ├── content.js             # 内容脚本
│   ├── focus-timer.js         # 番茄钟功能
│   └── page-cleaner.js        # 页面净化功能
├── popup/
│   ├── index.html             # 弹出窗口
│   ├── popup.js               # 弹出窗口逻辑
│   └── popup.css              # 弹出窗口样式
├── options/
│   ├── index.html             # 选项页面
│   ├── options.js             # 选项页面逻辑
│   └── options.css            # 选项页面样式
├── pages/
│   ├── focus-redirect.html    # 专注重定向页面
│   └── focus-redirect.js      # 重定向页面逻辑
└── utils/
    ├── storage.js             # 存储管理
    ├── url-matcher.js         # URL匹配器
    └── focus-stats.js         # 专注统计
```

## 开发环境搭建

### 前置要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 开发命令
```bash
# Webpack构建（推荐用于生产）
npm run build          # 生产构建（压缩、优化）
npm run build:dev      # 开发构建（包含source map）
npm run dev            # 开发模式（监听文件变化）

# 简化构建（快速开发）
npm run build:simple   # 简单文件复制构建
npm run build:simple:watch  # 监听文件变化并自动构建

# 工具命令
npm run clean          # 清理构建目录
npm run zip            # 创建生产发布包
npm run zip:dev        # 创建开发发布包
npm run zip:simple     # 创建简化构建发布包
```

### 构建方式选择
- **Webpack构建**: 适合生产环境，提供代码压缩、优化、模块化
- **简化构建**: 适合快速开发和测试，直接复制文件，无需编译

## 构建配置

### Webpack 配置
- **入口文件**: 分别配置background、content-scripts、popup等模块
- **输出优化**: 代码分割、Tree Shaking、压缩优化
- **开发体验**: 热重载、Source Map、错误提示

### Babel 配置
- **目标环境**: Chrome 88+ (支持Manifest V3)
- **语法支持**: ES2020、Class Properties、Rest/Spread

### 代码质量
- **ESLint**: 代码规范和错误检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查支持

## 开发计划

### Phase 1: 基础架构 ✅
- [x] 初始化 Manifest V3 结构
- [x] 实现存储管理系统
- [x] 实现URL匹配器
- [x] 基础UI组件
- [x] 构建配置和开发环境

### Phase 2: 核心功能 ✅
- [x] 智能网站屏蔽系统
- [x] 沉浸式番茄钟
- [x] 页面净化引擎

### Phase 3: 高级功能
- [ ] 数据统计和成就系统
- [ ] 第三方工具集成
- [ ] 用户自定义规则

## 安装和开发

1. 克隆仓库
```bash
git clone <repository-url>
cd chrome-focus-guard
```

2. 安装依赖
```bash
npm install
```

3. 开发模式
```bash
npm run dev
```

4. 在Chrome中加载扩展
- 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
- 开启"开发者模式"
- 点击"加载已解压的扩展程序"
- 选择 `dist/` 目录

5. 开发调试
- 修改代码后，webpack会自动重新构建
- 在扩展管理页面点击"重新加载"
- 使用 Chrome DevTools 调试 background 和 content scripts

## 发布流程

1. 更新版本号
```bash
npm version patch  # 或 minor, major
```

2. 构建生产版本
```bash
npm run build
```

3. 创建发布包
```bash
npm run zip
```

4. 提交代码
```bash
git add .
git commit -m "chore: release v$(npm run version --silent)"
git tag v$(npm run version --silent)
git push origin main --tags
```

## 项目结构

```
chrome-focus-guard/
├── src/                      # 源代码目录
│   ├── background/           # 后台脚本
│   ├── content-scripts/      # 内容脚本
│   ├── popup/               # 弹出窗口
│   ├── options/             # 选项页面
│   ├── pages/               # 特殊页面
│   └── utils/               # 工具函数
├── dist/                    # 构建输出目录
├── build.js                 # 自定义构建脚本
├── webpack.config.js        # Webpack配置
├── .babelrc                 # Babel配置
├── .eslintrc.js            # ESLint配置
├── .prettierrc             # Prettier配置
├── tsconfig.json           # TypeScript配置
├── jest.config.js          # Jest测试配置
└── package.json            # 项目配置
```

