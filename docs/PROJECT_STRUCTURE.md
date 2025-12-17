# 项目结构说明

## 📁 目录结构

```
山河答卷---基层治理沉浸式策略平台/
├── components/          # React 组件
│   ├── admin/          # 管理员组件
│   ├── ai/             # AI 智能体组件
│   ├── cardEditor/     # 卡牌编辑器组件
│   ├── editor/         # 游戏编辑器组件
│   ├── game/           # 游戏组件
│   ├── library/        # 资源库组件
│   ├── shared/         # 共享组件
│   └── ugc/            # 用户生成内容组件
├── core/               # 核心游戏引擎
├── docs/               # 项目文档
├── hooks/              # React Hooks
├── public/             # 静态资源
│   └── images/        # NPC 图片资源
├── services/          # 服务层
│   ├── ai/            # AI 服务
│   └── database/      # 数据库服务
├── types/             # TypeScript 类型定义（模块化）
├── utils/             # 工具函数
│   ├── card/         # 卡牌相关工具
│   ├── file/         # 文件处理工具
│   └── storage/      # 存储工具
├── App.tsx            # 主应用组件
├── index.tsx          # React 入口
├── index.html         # HTML 模板
├── package.json       # 依赖配置
├── vite.config.ts     # Vite 配置
└── tsconfig.json      # TypeScript 配置
```

## 🎯 核心模块

### 1. 游戏模块 (`components/game/`)
- `GameLoopEnhanced.tsx` - 主游戏循环（卡片滑动UI）
- `Dashboard.tsx` - 仪表盘（液体容器样式）
- `CardDeck.tsx` - 卡牌组件
- `CrisisNegotiation.tsx` - 危机谈判界面
- `GameReport.tsx` - 游戏报告界面
- `GameMenu.tsx` - 暂停菜单
- `PhaseBriefing.tsx` - 阶段简报

### 2. 编辑器模块 (`components/editor/`)
- `Editor.tsx` - 主编辑器
- `TimelineEditor.tsx` - 时间线编辑器
- `ContextPanel.tsx` - 上下文面板
- `CrisisConfigPage.tsx` - 危机配置页面

### 3. AI 服务 (`services/ai/`)
- `aiService.ts` - 统一 AI API 服务（支持多种提供商）
- `aiAgent.ts` - AI 智能体服务（RAG）
- `aiMocks.ts` - AI 模拟数据
- `geminiService.ts` - Gemini 专用服务

### 4. 游戏服务 (`services/`)
- `gameGeminiService.ts` - 游戏专用 AI 服务（危机谈判、报告生成）

### 5. 类型系统 (`types/`)
- 模块化类型定义，按功能分类
- `types/index.ts` - 统一导出

### 6. 工具函数 (`utils/`)
- `gameConfigConverter.ts` - 编辑器配置到游戏格式转换
- `gameAdapter.ts` - 游戏类型适配器
- `imageAssets.ts` - 图片资源管理
- `card/` - 卡牌工具函数
- `file/` - 文件处理工具
- `storage/` - 本地存储工具

## 🔄 数据流

1. **编辑器 → 游戏预览**
   - 编辑器配置 (`GameConfig`) 
   → 转换器 (`gameConfigConverter.ts`)
   → 游戏格式 (`UICard`, `PhaseConfig`)
   → 游戏组件 (`GameLoopEnhanced`)

2. **实战演练**
   - 使用内置标准版游戏配置
   - 不依赖编辑器配置

3. **AI 服务调用**
   - 支持多种提供商（硅基流动、Gemini、OpenAI）
   - 自动检测和切换
   - 统一的错误处理

## 📝 重要文件

- `App.tsx` - 应用路由和模式切换
- `constants.ts` - 游戏常量和示例配置
- `core/GameEngine.ts` - 核心游戏逻辑
- `vite.config.ts` - 构建配置
- `.gitignore` - Git 忽略规则

## 🗑️ 已清理的文件

以下重复文件已被删除：
- 根目录下的重复组件（13个）
- 旧版本工具函数（6个）
- 重复的类型文件（1个）
- cardEditor 目录下的重复工具（3个）

所有功能现在使用统一的模块化文件结构。

