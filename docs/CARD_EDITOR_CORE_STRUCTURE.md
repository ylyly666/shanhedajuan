# 卡牌编辑界面核心代码结构（最后一版可运行版本）

## 📁 核心文件位置

### 主编辑器组件
- **`components/editor/TimelineEditor.tsx`** - 流程编排主界面
  - 管理卡牌树状态（selectedCardId, expandedCards）
  - 处理卡牌创建、删除、拖拽排序
  - 集成资源库和属性面板

- **`components/editor/ContextPanel.tsx`** - 右侧属性面板
  - 显示卡牌/随机池/阶段编辑器
  - 调用 OptionEditor 编辑选项
  - 处理后续卡创建和更新

- **`components/editor/Editor.tsx`** - 编辑器路由组件
  - 切换"流程编排"和"危机设置"视图
  - 管理 activeStageId 和 currentView

- **`components/editor/CrisisConfigPage.tsx`** - 危机谈判配置页面

### 卡牌树渲染组件
- **`components/cardEditor/CardListController.tsx`** - 第一层卡牌列表控制器
  - 实现拖拽排序（react-beautiful-dnd）
  - 管理第一层卡牌和随机池的渲染
  - 处理颜色分组和NPC名称映射

- **`components/cardEditor/CardTree.tsx`** - 递归渲染卡牌树
  - 左优先（left-first）渲染顺序
  - 传递展开/折叠、选择、移动等回调

- **`components/cardEditor/CardNode.tsx`** - 单个卡牌节点UI
  - 显示缩进、展开三角、分支徽章
  - 显示颜色条、NPC名称
  - 上移/下移按钮（仅depth=0）

- **`components/cardEditor/OptionEditor.tsx`** - 选项编辑器
  - 编辑选项文本和数值影响
  - "创建后续卡"按钮

### 工具函数（已移动到 utils/card/）
- **`utils/card/cardTreeUtils.ts`** - 卡牌树工具函数
  - `collectSubtreeInOrder()` - 收集子树ID（左优先）
  - `findInsertIndexForSide()` - 计算插入位置
  - `getFirstLevelIds()` - 获取第一层卡牌ID
  - `getFirstLevelItemIds()` - 获取第一层项目ID（包含RandomPool）
  - `rebuildCardsFromFirstLevelOrder()` - 重建卡牌数组
  - `getParentId()` - 获取父卡ID
  - `getFirstLevelParentId()` - 获取第一层父卡ID
  - `getColorForParent()` - 获取颜色（用于分组）

- **`utils/card/handleCreateFollowUp.ts`** - 创建后续卡逻辑
  - `handleCreateFollowUp()` - 原子写入，自动展开和选择

- **`utils/card/reorderFirstLevel.ts`** - 第一层重排序逻辑
  - `reorderFirstLevelStageCards()` - 上移/下移第一层项

### 资源库组件
- **`components/library/AssetsDrawer.tsx`** - 左侧资源库抽屉
- **`components/library/RandomPoolEditor.tsx`** - 随机池编辑器
- **`components/library/InlineNPCForm.tsx`** - 内联NPC创建表单

### 共享组件
- **`components/shared/TopNav.tsx`** - 顶部导航栏

---

## 🔗 关键导入路径（使用 @/ 别名）

### TimelineEditor.tsx 的关键导入
```typescript
import { GameConfig, Card, Stage, RandomPool } from '@/types';
import { parseFile } from '@/utils/file/fileParser';
import { saveGameConfig } from '@/utils/storage/storage';
import { DEMO_CONFIG } from '@/constants';
import AssetsDrawer from '../library/AssetsDrawer';
import ContextPanel from './ContextPanel';
import { handleCreateFollowUp as handleCreateFollowUpController } from '@/utils/card/handleCreateFollowUp';
import CardListController from '../cardEditor/CardListController';
import { reorderFirstLevelStageCards } from '@/utils/card/reorderFirstLevel';
import { getFirstLevelParentId, collectSubtreeInOrder } from '@/utils/card/cardTreeUtils';
```

### CardListController.tsx 的关键导入
```typescript
import type { Card, GameConfig, RandomPool } from '@/types';
import { getFirstLevelIds, getFirstLevelItemIds, rebuildCardsFromFirstLevelOrder, getFirstLevelParentId, getColorForParent } from '@/utils/card/cardTreeUtils';
import CardTree from './CardTree';
```

### ContextPanel.tsx 的关键导入
```typescript
import { GameConfig, Card, Stage, RandomPool, StatKey } from '@/types';
import RandomPoolEditor from '../library/RandomPoolEditor';
import InlineNPCForm from '../library/InlineNPCForm';
import OptionEditor from '../cardEditor/OptionEditor';
```

---

## 🎯 核心功能流程

### 1. 创建后续卡流程
```
用户点击"创建左/右后续卡"按钮
  ↓
ContextPanel → onCreateFollowUp(parentId, side)
  ↓
TimelineEditor → handleCreateFollowUp()
  ↓
utils/card/handleCreateFollowUp.ts → handleCreateFollowUpController()
  ↓
- 使用 findInsertIndexForSide() 计算插入位置
- 生成新卡ID（card_${timestamp}_${random}）
- 在 cards 数组中插入新卡
- 更新父卡的 options[side].followUpCardId
- 原子写入 setConfig()
- 自动展开父卡 setExpandedCards()
- 自动选择新卡 setSelectedCardId()
```

### 2. 拖拽排序流程
```
用户拖拽第一层卡牌
  ↓
CardListController → handleDragEnd()
  ↓
- 使用 getFirstLevelItemIds() 获取第一层列表
- 使用 rebuildCardsFromFirstLevelOrder() 重建数组
- 原子写入 setConfig()
```

### 3. 上移/下移流程
```
用户点击上移/下移按钮（depth=0）
  ↓
CardNode → onMoveUp/onMoveDown()
  ↓
CardListController → onMoveFirstLevel()
  ↓
TimelineEditor → reorderFirstLevelStageCards()
  ↓
utils/card/reorderFirstLevel.ts → reorderFirstLevelStageCards()
  ↓
- 使用 getFirstLevelItemIds() 获取第一层列表
- 移动目标项的位置
- 使用 rebuildCardsFromFirstLevelOrder() 重建数组
- 原子写入 setConfig()
```

---

## 📝 关键数据结构

### Card（卡牌）
```typescript
{
  id: string;                    // 唯一标识
  npcId: string;                 // 关联的NPC ID
  npcName?: string;              // NPC名称（可选覆盖）
  text: string;                   // 卡牌对话文本
  options: {
    left: {
      text: string;              // 左滑选项文本
      delta: Partial<GameStats>; // 数值影响
      followUpCardId?: string;   // 左滑后续卡ID
    };
    right: {
      text: string;              // 右滑选项文本
      delta: Partial<GameStats>; // 数值影响
      followUpCardId?: string;   // 右滑后续卡ID
    };
  };
  tags?: string[];                // 标签数组
}
```

### RandomPool（随机池）
```typescript
{
  type: 'random_pool';
  id: string;
  count: number;                  // 抽取数量
  entries?: string[];             // 指定的事件ID列表（可选）
}
```

### Stage（阶段）
```typescript
{
  id: string;
  title: string;                  // 阶段标题
  description: string;            // 阶段描述
  cards: (Card | RandomPool)[];   // 卡牌列表（混合类型）
  kpi?: Partial<GameStats>;       // KPI目标值
  kpiEnabled?: Partial<Record<StatKey, boolean>>;  // 启用的KPI
}
```

---

## 🎨 UI特性

### 视觉元素
1. **缩进**：每层32px（depth 0无缩进）
2. **展开三角**：所有有子节点的卡牌显示（包括depth 0）
3. **分支徽章**：⬅️ 左 / ➡️ 右（显示在卡牌右上角）
4. **颜色条**：左侧6px宽的颜色条（用于视觉分组）
5. **背景色**：depth > 0的卡牌有浅色背景
6. **NPC名称**：显示NPC名称而不是card.id（如果有npcMap）

### 交互功能
1. **拖拽排序**：仅第一层卡牌可拖拽（react-beautiful-dnd）
2. **上移/下移**：第一层卡牌显示上移/下移按钮
3. **展开/折叠**：点击三角展开/折叠子树
4. **选择卡牌**：点击卡牌选中，右侧显示属性面板
5. **创建后续卡**：在OptionEditor中点击"创建左/右后续卡"按钮

---

## ⚙️ 配置要求

### 路径别名（vite.config.ts 和 tsconfig.json）
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, '.'),
  }
}
```

### 类型导入
所有类型从 `@/types` 导入（types/index.ts 统一导出）

---

## ✅ 验证清单

确保以下功能正常工作：
1. ✅ 创建左/右后续卡
2. ✅ 拖拽第一层卡牌排序
3. ✅ 上移/下移第一层卡牌
4. ✅ 展开/折叠卡牌树
5. ✅ 选择卡牌显示属性面板
6. ✅ 编辑卡牌属性（文本、NPC、选项、数值影响）
7. ✅ 删除卡牌（包括子树）
8. ✅ 添加随机池
9. ✅ 加载示例数据

---

**最后更新**: 2024年12月


