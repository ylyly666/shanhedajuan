# 完整项目结构文档

## 📁 项目概览

**项目名称**: 山河答卷 - 基层治理沉浸式策略平台  
**技术栈**: React 19 + TypeScript + Vite + Tailwind CSS  
**核心功能**: 卡牌叙事游戏编辑器 + 游戏引擎 + 资源库 + AI助手

---

## 🗂️ 完整文件结构

```
山河答卷---基层治理沉浸式策略平台/
│
├── 📄 配置文件
│   ├── package.json                    # 项目依赖配置
│   ├── package-lock.json               # 依赖锁定文件
│   ├── tsconfig.json                   # TypeScript 配置
│   ├── tsconfig.jest.json              # Jest TypeScript 配置
│   ├── vite.config.ts                  # Vite 构建配置
│   ├── tailwind.config.ts              # Tailwind CSS 配置
│   ├── jest.config.cjs                 # Jest 测试配置
│   ├── jest.setup.ts                   # Jest 测试环境设置
│   ├── .env.local                      # 环境变量（本地，不提交）
│   └── metadata.json                   # 项目元数据
│
├── 📄 入口文件
│   ├── index.html                      # HTML 入口
│   ├── index.tsx                       # React 入口
│   ├── index.css                       # 全局样式
│   └── App.tsx                         # 应用主组件（路由）
│
├── 📄 核心类型和配置
│   ├── types/                          # 类型拆分目录（统一从 '@/types' 导出）
│   │   ├── index.ts                    # 类型出口
│   │   ├── game.ts                     # GameStats, GameState
│   │   ├── card.ts                     # Card, CardOption, RandomPool, Stage
│   │   ├── npc.ts                      # StoryNpc, CrisisNpc, NpcAsset
│   │   ├── crisis.ts                   # CrisisConfig, JudgeWeights
│   │   ├── config.ts                   # GameConfig
│   │   ├── resource.ts                 # PolicyDocument, CaseStudy, ResourceLibrary
│   │   └── ai.ts                       # ChatMessage 等
│   └── constants/                      # 预设数据与 DEMO 配置
│
├── 📁 components/                      # React 组件目录（按功能域）
│   │
│   ├── 📄 核心编辑器组件
│   │   ├── editor/                     # 流程编排 & 危机配置
│   │   │   ├── Editor.tsx              # 编辑器路由壳
│   │   │   ├── TimelineEditor.tsx      # 流程编排主界面
│   │   │   ├── ContextPanel.tsx        # 右侧属性面板
│   │   │   └── CrisisConfigPage.tsx    # 危机谈判配置
│   │   └── shared/TopNav.tsx           # 顶部导航栏
│   │
│   ├── 📁 cardEditor/                  # 卡牌编辑器核心模块
│   │   ├── CardListController.tsx      # 第一层卡牌/随机池控制器（上/下移动）
│   │   ├── CardTree.tsx                # 递归渲染卡牌树
│   │   ├── CardNode.tsx                # 单个卡牌节点 UI
│   │   ├── OptionEditor.tsx            # 选项编辑器（仅创建后续、无内联编辑）
│   │   ├── cardTreeUtils.ts            # 工具：颜色分组、父子查找、子树遍历
│   │   ├── handleCreateFollowUp.ts     # 创建后续卡逻辑
│   │   ├── reorderFirstLevel.ts        # 第一层重排序逻辑
│   │
│   ├── 📄 资源库和编辑器组件
│   │   ├── AssetsDrawer.tsx            # 左侧资源库抽屉（NPC、随机事件）
│   │   ├── RandomPoolEditor.tsx        # 随机池编辑器
│   │   ├── InlineNPCForm.tsx           # 内联 NPC 创建表单
│   │   └── ResourceLibrary.tsx         # 资料库展示页面
│   │
│   ├── 📄 游戏引擎
│   │   └── GameEngine.tsx              # 游戏运行时引擎
│   │
│   ├── 📄 其他功能组件
│   │   ├── UGCSubmission.tsx            # UGC 投稿表单
│   │   ├── AdminCaseUpload.tsx         # 管理员案例上传
│   │   ├── AdminReview.tsx              # 管理员审核页面
│   │   ├── AIAgent.tsx                 # AI 智能体页面
│   │   └── AIDock.tsx                  # AI 辅助生成卡牌（可能未完全集成）
│   │
│   └── 📁 __tests__/                    # 组件测试
│       ├── toolbarButtons.test.tsx
│       └── cardEditor/__tests__/
│           ├── CardNode.test.tsx
│           ├── CardNode.connector.test.tsx
│           ├── cardTreeUtils.test.ts
│           ├── CreateFollowUp.integration.test.tsx
│           ├── Dnd.integration.test.tsx
│           ├── groupColoring.test.tsx
│           ├── handleCreateFollowUp.test.ts
│           └── reorderFirstLevel.test.ts
│
├── 📁 utils/                            # 工具函数（已分组）
│   ├── card/                           # 卡牌工具
│   │   ├── cardTreeUtils.ts
│   │   ├── handleCreateFollowUp.ts
│   │   └── reorderFirstLevel.ts
│   ├── storage/storage.ts              # localStorage 持久化
│   ├── file/                           # 文件处理
│   │   ├── fileParser.ts
│   │   └── caseExtractor.ts
│   └── (旧引用已迁移至 services/ai 与 services/database)
│
├── 📁 services/                        # 服务层
│   ├── ai/
│   │   ├── aiService.ts
│   │   ├── geminiService.ts
│   │   ├── aiAgent.ts
│   │   └── aiMocks.ts
│   └── database/
│       └── supabase.ts
│
├── 📁 hooks/                           # 自定义 Hooks
│   ├── useGameState.ts                 # 全局 GameConfig 读写
│   ├── useCardEditor.ts                # 卡牌编辑核心逻辑
│   └── useCrisisConfig.ts              # 危机配置逻辑
│
├── 📁 docs/                             # 文档目录
│   ├── ADMIN_GUIDE.md                   # 管理员指南
│   ├── AI_AGENT_GUIDE.md                # AI 智能体指南
│   ├── API_TROUBLESHOOTING.md           # API 故障排除
│   ├── MOBILE_DEVELOPMENT.md            # 移动端开发指南
│   ├── SUPABASE_QUICK_SETUP.md          # Supabase 快速设置
│   ├── SUPABASE_SETUP.md                # Supabase 详细设置
│   ├── CREATE_TABLE_STEP_BY_STEP.md    # 数据库表创建步骤
│   ├── create_table_simple.sql          # 简单建表 SQL
│   └── supabase_schema.sql              # Supabase 完整 Schema
│
├── 📁 test/                             # 测试配置
│   └── __mocks__/
│       └── styleMock.js                 # CSS Mock（Jest）
│
├── 📄 项目文档
│   ├── README.md                        # 项目主文档
│   ├── QUICKSTART.md                    # 快速开始指南
│   ├── API_CONFIG.md                    # API 配置文档
│   └── PROJECT_STRUCTURE.md             # 项目结构文档（本文件）
│
└── 📁 构建产物（不应提交）
    └── dist/                            # Vite 构建输出
```

---

## 📋 核心文件功能详解

### 1. **类型定义** (`types/`)

**核心数据结构**：

#### GameStats - 游戏四项指标（game.ts）
```typescript
{
  economy: number;      // 经济发展 (0-100)
  people: number;       // 民生福祉 (0-100)
  environment: number;  // 生态环境 (0-100)
  governance: number;   // 党建治理 (0-100)
}
```

#### Card - 卡牌数据模型（card.ts）
```typescript
{
  id: string;                    // 唯一标识（格式：card_${timestamp}_${random}）
  npcId: string;                 // 关联的NPC ID（从 storyNpcs 中选择）
  npcName?: string;              // NPC名称（可选覆盖，用于显示）
  text: string;                   // 卡牌对话文本（必填）
  options: {
    left: CardOption;             // 左滑选项
    right: CardOption;            // 右滑选项
  };
  tags?: string[];                // 标签数组（用于分类，如 ['自然灾害', '紧急事件']）
}
```

#### CardOption - 选项数据（card.ts）
```typescript
{
  text: string;                   // 选项文本（必填，如"立即组织抢险"）
  delta: Partial<GameStats>;      // 数值影响（如 {economy: +10, people: -5}）
  followUpCardId?: string;        // 后续卡ID（可选，创建后续卡时自动生成）
}
```

#### RandomPool - 随机池（card.ts）
```typescript
{
  type: 'random_pool';           // 类型标识（固定值）
  id: string;                     // 唯一标识
  count: number;                  // 抽取数量（必填，如 2）
  entries?: string[];             // 指定的事件ID列表（可选，为空则从 randomEventLibrary 随机抽取）
}
```

#### Stage - 阶段配置（card.ts）
```typescript
{
  id: string;                     // 唯一标识（格式：stage_1）
  title: string;                  // 阶段标题（如"第一年·破局篇"）
  description: string;            // 阶段描述（如"初到村任职，首要任务是建立威信"）
  cards: (Card | RandomPool)[];   // 卡牌列表（混合类型）
  kpi?: Partial<GameStats>;       // KPI目标值（如 {economy: 45, people: 50}）
  kpiEnabled?: Partial<Record<StatKey, boolean>>;  // 启用的KPI（如 {economy: true, people: true}）
}
```

#### CrisisConfig - 危机谈判配置（crisis.ts）
```typescript
{
  npcId: string;                   // 关联的危机NPC ID（从 crisisNpcs 中选择）
  npcName?: string;                // NPC名称（可自定义，覆盖默认值）
  npcRole?: string;                // NPC身份（可自定义，如"投资商"）
  npcAvatarUrl?: string;           // NPC头像URL（可自定义，支持文件上传）
  personality: string;              // 性格特征（文本输入，如"因撤资而愤怒，威胁要起诉村委会"）
  conflictReason: string;          // 冲突原因（文本输入，必填）
  judgeWeights?: {
    empathy: number;               // 共情度 (0-100)
    rationality: number;           // 实际性 (0-100)
    strategy: number;              // 策略性 (0-100)
    compliance: number;            // 合规性 (0-100)
    // 注意：四个权重总和应为 100%
  };
}
```

#### GameConfig - 完整游戏配置（config.ts）
```typescript
{
  stages: Stage[];                        // 阶段列表
  storyNpcs: StoryNpc[];                   // 剧情NPC资源库
  crisisNpcs: CrisisNpc[];                // 危机NPC资源库
  randomEventLibrary: Card[];              // 随机事件库
  crisisConfig: {
    [key in StatKey]: CrisisConfig;        // 四个指标的危机配置
  };
  npcs?: NpcAsset[];                      // 已废弃，使用 storyNpcs
}
```

#### StoryNpc - 剧情NPC（npc.ts）
```typescript
{
  id: string;                             // 唯一标识（如 "npc_secretary"）
  name: string;                           // NPC名称（如"李书记"）
  role: string;                           // NPC身份（如"村支书"）
  avatarUrl: string;                      // 头像URL
  description?: string;                    // 描述（可选）
}
```

---

### 2. **预设数据** (`constants.ts`)

**MOCK_STORY_NPCS**: 8个剧情NPC
- 李书记（村支书）
- 张大爷（养殖户）
- 小王（返乡青年）
- 赵总（投资商）
- 王奶奶（村民代表）
- 刘老师（小学教师）
- 老会计（村会计）
- 小记者（媒体记者）

**MOCK_CRISIS_NPCS**: 4个危机NPC（对应4个指标）

**MOCK_RANDOM_EVENTS**: 8个随机事件
- 自然灾害（暴雨抢险）
- 日常工作（会议、检查）
- 矛盾纠纷（宅基地、土地）
- 文化活动（节日活动）
- 媒体宣传（记者采访）
- 志愿者活动
- 基础设施维修

**DEMO_CONFIG**: 完整的示例配置
- 3个阶段（第一年、第二年、第三年）
- 每个阶段包含主线卡牌、后续卡牌、随机池
- 完整的危机配置（包含所有自定义字段）

---

## 📝 所有输入字段清单

### 卡牌编辑（Card Editor）

**位置**: `components/ContextPanel.tsx` → `OptionEditor.tsx`

| 字段 | 类型 | 必填 | 说明 | 输入位置 |
|------|------|------|------|----------|
| `text` | string | ✅ | 卡牌对话文本 | ContextPanel - 卡牌编辑器 |
| `npcId` | string | ✅ | 关联的NPC ID | ContextPanel - NPC选择下拉框 |
| `npcName` | string | ❌ | NPC名称（可选覆盖） | ContextPanel - NPC名称输入框 |
| `options.left.text` | string | ✅ | 左滑选项文本 | OptionEditor - 左选项文本输入 |
| `options.left.delta.economy` | number | ❌ | 左滑对经济的影响 | OptionEditor - 数值输入框 |
| `options.left.delta.people` | number | ❌ | 左滑对民生的影响 | OptionEditor - 数值输入框 |
| `options.left.delta.environment` | number | ❌ | 左滑对生态的影响 | OptionEditor - 数值输入框 |
| `options.left.delta.governance` | number | ❌ | 左滑对党建的影响 | OptionEditor - 数值输入框 |
| `options.right.text` | string | ✅ | 右滑选项文本 | OptionEditor - 右选项文本输入 |
| `options.right.delta.*` | number | ❌ | 右滑对各项指标的影响 | OptionEditor - 数值输入框 |
| `options.left.followUpCardId` | string | ❌ | 左滑后续卡ID | OptionEditor - "创建左后续卡"按钮 |
| `options.right.followUpCardId` | string | ❌ | 右滑后续卡ID | OptionEditor - "创建右后续卡"按钮 |
| `tags` | string[] | ❌ | 标签数组 | ContextPanel - 标签输入（可能未实现） |

---

### 随机池编辑（Random Pool Editor）

**位置**: `components/RandomPoolEditor.tsx`

| 字段 | 类型 | 必填 | 说明 | 输入位置 |
|------|------|------|------|----------|
| `count` | number | ✅ | 抽取数量 | RandomPoolEditor - 数字输入框 |
| `entries` | string[] | ❌ | 指定的事件ID列表 | RandomPoolEditor - 事件选择（可能未实现） |

---

### 阶段编辑（Stage Editor）

**位置**: `components/ContextPanel.tsx`（未选中卡牌时）

| 字段 | 类型 | 必填 | 说明 | 输入位置 |
|------|------|------|------|----------|
| `title` | string | ✅ | 阶段标题 | ContextPanel - 阶段编辑器 |
| `description` | string | ✅ | 阶段描述 | ContextPanel - 文本输入框 |
| `kpi.economy` | number | ❌ | 经济KPI目标值 | ContextPanel - 数字输入框 |
| `kpi.people` | number | ❌ | 民生KPI目标值 | ContextPanel - 数字输入框 |
| `kpi.environment` | number | ❌ | 生态KPI目标值 | ContextPanel - 数字输入框 |
| `kpi.governance` | number | ❌ | 党建KPI目标值 | ContextPanel - 数字输入框 |
| `kpiEnabled.economy` | boolean | ❌ | 是否启用经济KPI | ContextPanel - 复选框 |
| `kpiEnabled.people` | boolean | ❌ | 是否启用民生KPI | ContextPanel - 复选框 |
| `kpiEnabled.environment` | boolean | ❌ | 是否启用生态KPI | ContextPanel - 复选框 |
| `kpiEnabled.governance` | boolean | ❌ | 是否启用党建KPI | ContextPanel - 复选框 |

---

### 危机配置（Crisis Config）

**位置**: `components/CrisisConfigPage.tsx`

| 字段 | 类型 | 必填 | 说明 | 输入位置 |
|------|------|------|------|----------|
| `npcName` | string | ❌ | NPC名称（可自定义） | CrisisConfigPage - 姓名输入框 |
| `npcRole` | string | ❌ | NPC身份（可自定义） | CrisisConfigPage - 身份输入框 |
| `npcAvatarUrl` | string | ❌ | NPC头像URL | CrisisConfigPage - 头像上传按钮 |
| `personality` | string | ✅ | 性格特征 | CrisisConfigPage - 文本域 |
| `conflictReason` | string | ✅ | 冲突原因 | CrisisConfigPage - 文本域 |
| `judgeWeights.empathy` | number | ❌ | 共情度 (0-100) | CrisisConfigPage - 数字输入框 |
| `judgeWeights.rationality` | number | ❌ | 实际性 (0-100) | CrisisConfigPage - 数字输入框 |
| `judgeWeights.strategy` | number | ❌ | 策略性 (0-100) | CrisisConfigPage - 数字输入框 |
| `judgeWeights.compliance` | number | ❌ | 合规性 (0-100) | CrisisConfigPage - 数字输入框 |

**注意**: 四个权重总和应为 100%，但当前实现允许独立输入（不强制连动）

---

### NPC资源库（Story NPC）

**位置**: `components/AssetsDrawer.tsx` → `InlineNPCForm.tsx`

| 字段 | 类型 | 必填 | 说明 | 输入位置 |
|------|------|------|------|----------|
| `name` | string | ✅ | NPC名称 | InlineNPCForm - 名称输入框 |
| `role` | string | ✅ | NPC身份 | InlineNPCForm - 身份输入框 |
| `avatarUrl` | string | ✅ | 头像URL | InlineNPCForm - 头像上传 |
| `description` | string | ❌ | 描述 | InlineNPCForm - 描述文本域 |

---

### 随机事件库（Random Event）

**位置**: `components/AssetsDrawer.tsx`

| 字段 | 类型 | 必填 | 说明 | 输入位置 |
|------|------|------|------|----------|
| `text` | string | ✅ | 事件对话文本 | AssetsDrawer - 事件编辑器 |
| `npcId` | string | ✅ | 关联的NPC ID | AssetsDrawer - NPC选择 |
| `options.left.text` | string | ✅ | 左滑选项文本 | AssetsDrawer - 选项编辑器 |
| `options.left.delta.*` | number | ❌ | 左滑数值影响 | AssetsDrawer - 数值输入 |
| `options.right.text` | string | ✅ | 右滑选项文本 | AssetsDrawer - 选项编辑器 |
| `options.right.delta.*` | number | ❌ | 右滑数值影响 | AssetsDrawer - 数值输入 |
| `tags` | string[] | ❌ | 标签数组 | AssetsDrawer - 标签输入 |

---

### UGC投稿（UGC Submission）

**位置**: `components/UGCSubmission.tsx`

| 字段 | 类型 | 必填 | 说明 | 输入位置 |
|------|------|------|------|----------|
| `title` | string | ✅ | 案例标题 | UGCSubmission - 标题输入框 |
| `tags` | string[] | ❌ | 标签数组 | UGCSubmission - 标签输入 |
| `category` | StatKey | ✅ | 类别（economy/people/environment/governance） | UGCSubmission - 下拉选择 |
| `context_summary` | string | ✅ | 背景摘要 | UGCSubmission - 文本域 |
| `conflict_detail` | string | ✅ | 冲突详情 | UGCSubmission - 文本域 |
| `resolution_outcome` | string | ✅ | 解决方案和结果 | UGCSubmission - 文本域 |
| `expert_comment` | string | ❌ | 专家点评 | UGCSubmission - 文本域 |
| `original_text` | string | ❌ | 原始文本（AI提取时自动填充） | UGCSubmission - 文本域 |

---

## 🎯 当前状态与后续建议

- ✅ 目录重组完成：components 按功能域；types 拆分；utils 分组；services/ai 与 services/database；hooks 补齐。
- ✅ 命名规范：组件 PascalCase，工具/类型 camelCase，测试文件遵循 `[name].test.ts(x)`。
- ✅ 卡牌编辑体验：后续卡创建按钮已防重；选中卡添加时插入子树后，已有后续则跳转；顶层卡/随机池可上/下移动且子树随动；颜色分组（彩虹）、随机池灰色区分。
- ⚠️ 可优化项：
  - 长文 Tooltip（当前单行省略）。
  - 分组 Legend/高亮过滤（可选）。
  - `AIDock.tsx` 集成度、`tags` 字段全链路、随机池 entries 选择交互再打磨。
  - 性能：大列表虚拟滚动、按需代码分割、图片懒加载。

**最后更新**: 2025年

