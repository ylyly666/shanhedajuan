# 文件清理分析报告

## 发现的重复文件

### 1. 组件重复文件（根目录 vs 子目录）
以下根目录文件是旧版本，应该删除，使用子目录中的新版本：

- ❌ `components/AIAgent.tsx` → ✅ 使用 `components/ai/AIAgent.tsx`
- ❌ `components/AIDock.tsx` → ✅ 使用 `components/ai/AIDock.tsx`
- ❌ `components/AdminCaseUpload.tsx` → ✅ 使用 `components/admin/AdminCaseUpload.tsx`
- ❌ `components/AdminReview.tsx` → ✅ 使用 `components/admin/AdminReview.tsx`
- ❌ `components/AssetsDrawer.tsx` → ✅ 使用 `components/library/AssetsDrawer.tsx`
- ❌ `components/ContextPanel.tsx` → ✅ 使用 `components/editor/ContextPanel.tsx`
- ❌ `components/GameEngine.tsx` → ✅ 使用 `components/game/GameEngine.tsx`（但可能已废弃）
- ❌ `components/InlineNPCForm.tsx` → ✅ 使用 `components/library/InlineNPCForm.tsx`
- ❌ `components/RandomPoolEditor.tsx` → ✅ 使用 `components/library/RandomPoolEditor.tsx`
- ❌ `components/ResourceLibrary.tsx` → ✅ 使用 `components/library/ResourceLibrary.tsx`
- ❌ `components/TimelineEditor.tsx` → ✅ 使用 `components/editor/TimelineEditor.tsx`
- ❌ `components/TopNav.tsx` → ✅ 使用 `components/shared/TopNav.tsx`
- ❌ `components/UGCSubmission.tsx` → ✅ 使用 `components/ugc/UGCSubmission.tsx`

### 2. 工具函数重复文件
- ❌ `utils/aiAgent.ts` → ✅ 使用 `services/ai/aiAgent.ts`
- ❌ `utils/aiMocks.ts` → ✅ 使用 `services/ai/aiMocks.ts`
- ❌ `utils/caseExtractor.ts` → ✅ 使用 `utils/file/caseExtractor.ts`
- ❌ `utils/fileParser.ts` → ✅ 使用 `utils/file/fileParser.ts`
- ❌ `utils/storage.ts` → ✅ 使用 `utils/storage/storage.ts`
- ❌ `utils/supabase.ts` → ✅ 使用 `services/database/supabase.ts`

### 3. 类型文件重复
- ❌ `types.ts` → ✅ 使用 `types/` 目录下的模块化类型文件
- ❌ `aiService.ts` (根目录) → ✅ 使用 `services/ai/aiService.ts`

### 4. 工具函数重复（cardEditor vs utils/card）
- ❌ `components/cardEditor/cardTreeUtils.ts` → ✅ 使用 `utils/card/cardTreeUtils.ts`
- ❌ `components/cardEditor/handleCreateFollowUp.ts` → ✅ 使用 `utils/card/handleCreateFollowUp.ts`
- ❌ `components/cardEditor/reorderFirstLevel.ts` → ✅ 使用 `utils/card/reorderFirstLevel.ts`

### 5. 构建产物（应该忽略）
- ❌ `dist/` 目录（已由 .gitignore 忽略）

## 需要保留的文件

### 核心文件
- ✅ `App.tsx` - 主应用入口
- ✅ `index.tsx` - React 入口
- ✅ `index.html` - HTML 模板
- ✅ `vite.config.ts` - Vite 配置
- ✅ `package.json` - 依赖配置
- ✅ `tsconfig.json` - TypeScript 配置
- ✅ `tailwind.config.ts` - Tailwind 配置

### 目录结构
- ✅ `components/` - 所有组件（使用子目录版本）
- ✅ `services/` - 服务层
- ✅ `utils/` - 工具函数（使用最新版本）
- ✅ `types/` - 类型定义（模块化）
- ✅ `hooks/` - React Hooks
- ✅ `core/` - 核心游戏引擎
- ✅ `public/` - 静态资源
- ✅ `docs/` - 文档

## 清理计划

1. 删除根目录下的重复组件文件
2. 删除旧版本的工具函数
3. 删除旧的类型文件
4. 检查并更新所有引用（如果有遗漏）

