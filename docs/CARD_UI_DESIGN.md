# 卡牌编辑界面 UI 设计文档

## 📐 核心 UI 组件文件

### 1. **CardNode.tsx** - 单张卡牌的完整 UI

**位置**: `components/cardEditor/CardNode.tsx`

**核心常量**:
```typescript
const INDENT_PER_LEVEL = 32; // 每一层的缩进像素
const CONNECTOR_OFFSET = 16; // 连接线起始偏移
```

**UI 元素结构**:

#### 1.1 颜色条（左侧）
```typescript
{groupColor && (
  <div
    className="absolute top-0 bottom-0 w-1.5 rounded-sm pointer-events-none"
    style={{ 
      background: groupColor, 
      left: depth === 0 ? -8 : -INDENT_PER_LEVEL / 2  // depth 0: -8px, depth > 0: -16px
    }}
  >
    {/* 小圆点（连接点） */}
    <div
      className="absolute w-1.5 h-1.5 rounded-full top-1/2 -translate-y-1/2 left-0 pointer-events-none"
      style={{ background: groupColor }}
    />
  </div>
)}
```

**样式说明**:
- 宽度: `1.5` (6px)
- 位置: 绝对定位，左侧边缘
- 颜色: 来自 `groupColor` prop（HSL格式）
- 小圆点: 在颜色条中间，作为连接点

#### 1.2 背景色和边框（depth > 0）
```typescript
const backgroundTint = depth > 0 && groupColor ? toAlpha(groupColor, 0.08) : undefined;
const borderTint = depth > 0 && groupColor ? toAlpha(groupColor, 0.18) : undefined;

style={{
  background: backgroundTint || 'white',
  borderColor: borderTint || 'var(--ink-light, #E5E7EB)',
}}
```

**样式说明**:
- depth 0: 白色背景，默认边框
- depth > 0: 浅色背景（groupColor 透明度 8%），浅色边框（groupColor 透明度 18%）

#### 1.3 缩进
```typescript
style={{
  marginLeft: depth === 0 ? 0 : indent,  // depth * 32px
  paddingLeft: depth > 0 ? 14 : 0,       // depth > 0 时额外 padding
}}
```

**缩进规则**:
- depth 0: 无缩进（marginLeft: 0）
- depth 1: 缩进 32px
- depth 2: 缩进 64px
- depth 3: 缩进 96px
- ...以此类推

#### 1.4 展开/折叠三角按钮
```typescript
<button
  className="w-6 h-6 rounded-full border border-ink-light flex items-center justify-center text-xs bg-white"
  onClick={(e) => {
    e.stopPropagation();
    onToggle(card.id);
  }}
  aria-label={isExpanded ? '折叠' : '展开'}
>
  {hasChildren ? (isExpanded ? '−' : '+') : ''}
</button>
```

**样式说明**:
- 尺寸: `w-6 h-6` (24px × 24px)
- 形状: 圆形（rounded-full）
- 显示: 有子节点时显示 `+` 或 `−`，无子节点时为空

#### 1.5 分支徽章（右上角）
```typescript
const BranchBadge: React.FC<{ branch?: 'left' | 'right' }> = ({ branch }) => {
  if (!branch) return null;
  const label = branch === 'left' ? '◀' : '▶';
  return (
    <span className="absolute top-2 right-2 px-1 py-0.5 text-[10px] font-bold rounded bg-accent-green/15 text-accent-green border border-accent-green/30">
      {label}
    </span>
  );
};
```

**样式说明**:
- 位置: 绝对定位，右上角（top-2 right-2）
- 背景: 绿色半透明（bg-accent-green/15）
- 边框: 绿色半透明（border-accent-green/30）
- 文字: 绿色（text-accent-green）
- 图标: `◀` 表示左分支，`▶` 表示右分支

#### 1.6 上移/下移按钮（仅 depth 0）
```typescript
const MoveButtons: React.FC<{...}> = ({ depth, onMoveUp, onMoveDown, canMoveUp, canMoveDown, id }) => {
  if (depth !== 0) return null;
  return (
    <div className="absolute right-2 top-2 flex flex-col gap-1">
      <button className="w-6 h-6 rounded text-[10px] ...">
        ▲
      </button>
      <button className="w-6 h-6 rounded text-[10px] ...">
        ▼
      </button>
    </div>
  );
};
```

**样式说明**:
- 位置: 绝对定位，右上角（right-2 top-2）
- 尺寸: `w-6 h-6` (24px × 24px)
- 状态: 禁用时半透明（opacity-50），可用时 hover 效果

#### 1.7 连接线（左侧垂直线）
```typescript
{hasChildren && (
  <div
    className="absolute left-0 top-1 bottom-1 border-l border-ink-light/60 pointer-events-none"
    style={{ marginLeft: connectorOffset }}  // depth > 0 时 16px
  />
)}
```

**样式说明**:
- 位置: 绝对定位，左侧
- 样式: 1px 左边框，浅灰色（border-ink-light/60）
- 显示: 仅当有子节点时显示

#### 1.8 卡牌内容
```typescript
<div className="flex-1 space-y-1">
  <div className="flex items-center gap-2">
    <span className="text-xs px-2 py-0.5 rounded bg-ink-light/50 text-ink">#{card.id}</span>
    {npcName && <span className="text-xs text-ink-medium">{npcName}</span>}
  </div>
  <div className="text-sm font-bold text-ink">{card.text}</div>
  <div className="text-xs text-ink-medium">
    左：{card.options.left.text || '—'} ｜ 右：{card.options.right.text || '—'}
  </div>
</div>
```

**内容显示**:
- 第一行: 卡牌ID（灰色背景标签）+ NPC名称
- 第二行: 卡牌对话文本（粗体）
- 第三行: 左右选项预览（小字）

---

### 2. **颜色系统** - GROUP_COLORS

**位置**: `utils/card/cardTreeUtils.ts`

```typescript
export const GROUP_COLORS = [
  'hsl(0, 45%, 55%)',    // 红色系
  'hsl(180, 45%, 55%)',  // 青色系
  'hsl(60, 45%, 55%)',   // 黄色系
  'hsl(240, 45%, 55%)',  // 蓝色系
  'hsl(120, 45%, 55%)',  // 绿色系
  'hsl(300, 45%, 55%)',  // 紫色系
  'hsl(30, 45%, 55%)',   // 橙色系
  'hsl(210, 45%, 55%)',  // 天蓝色系
  'hsl(270, 45%, 55%)',  // 紫红色系
  'hsl(150, 45%, 55%)',  // 青绿色系
];
```

**颜色分配逻辑**:
```typescript
export const getColorForParent = (parentId: string, index: number): string => {
  return GROUP_COLORS[index % GROUP_COLORS.length];
};
```

**使用方式**:
- 第一层卡牌（depth 0）根据其在 `firstLevelIds` 中的索引分配颜色
- 所有子节点继承其第一层父卡的颜色
- 颜色用于：
  1. 左侧颜色条（6px宽）
  2. 背景色（depth > 0，透明度 8%）
  3. 边框色（depth > 0，透明度 18%）

---

### 3. **CardTree.tsx** - 递归渲染树结构

**位置**: `components/cardEditor/CardTree.tsx`

**渲染逻辑**:
```typescript
const renderNode = (id: string, currentDepth: number, currentBranch?: 'left' | 'right') => {
  const card = map.get(id);
  if (!card) return null;

  const hasLeft = Boolean(card.options.left.followUpCardId);
  const hasRight = Boolean(card.options.right.followUpCardId);
  const isExpanded = expanded.has(id);

  return (
    <React.Fragment key={id}>
      <CardNode
        card={card}
        depth={currentDepth}
        isExpanded={isExpanded}
        hasChildren={hasLeft || hasRight}
        branch={currentBranch}
        parentId={getParentId(id, cards)}
        onToggle={onToggle}
        onSelect={onSelect}
        selected={selected}
        firstLevelParentId={cardParentMap?.get(id) || null}
        groupColor={parentColorMap?.get(cardParentMap?.get(id) || id) || undefined}
        npcName={npcMap?.get(card.npcId)}
        // ... 其他 props
      />
      {isExpanded && (
        <>
          {hasLeft && renderNode(card.options.left.followUpCardId!, currentDepth + 1, 'left')}
          {hasRight && renderNode(card.options.right.followUpCardId!, currentDepth + 1, 'right')}
        </>
      )}
    </React.Fragment>
  );
};
```

**渲染顺序**: 左优先（left-first）
- 先渲染父节点
- 然后递归渲染左子树
- 最后递归渲染右子树

---

### 4. **CardListController.tsx** - 第一层列表控制器

**位置**: `components/cardEditor/CardListController.tsx`

**颜色映射计算**:
```typescript
const parentColorMap = useMemo(() => {
  const map = new Map<string, string>();
  firstLevelIds.forEach((parentId, index) => {
    map.set(parentId, getColorForParent(parentId, index));
  });
  return map;
}, [firstLevelIds]);
```

**NPC 名称映射**:
```typescript
const npcMap = useMemo(() => {
  const map = new Map<string, string>();
  const allNpcs = [...(config.storyNpcs || []), ...(config.npcs || [])];
  allNpcs.forEach(npc => {
    if (npc.id && 'name' in npc) {
      map.set(npc.id, npc.name);
    }
  });
  return map;
}, [config.storyNpcs, config.npcs]);
```

---

## 🎨 完整 UI 样式总结

### 卡牌容器样式
```typescript
className="relative p-3 border rounded-lg hover:shadow-md transition-all"
style={{
  marginLeft: depth === 0 ? 0 : indent,        // 缩进
  paddingLeft: depth > 0 ? 14 : 0,            // 额外 padding
  background: backgroundTint || 'white',       // 背景色
  borderColor: borderTint || 'var(--ink-light)', // 边框色
}}
```

### 选中状态
```typescript
className={selected === card.id ? 'ring-2 ring-primary-red/30 border-primary-red' : ''}
```
- 选中时: 红色边框 + 红色 ring（2px，30% 透明度）

### 颜色条样式
- 宽度: `w-1.5` (6px)
- 位置: `absolute top-0 bottom-0`
- 左侧偏移: depth 0 为 -8px，depth > 0 为 -16px
- 小圆点: 1.5px × 1.5px，居中

### 展开三角样式
- 尺寸: `w-6 h-6` (24px × 24px)
- 形状: 圆形（rounded-full）
- 边框: `border border-ink-light`
- 背景: `bg-white`
- 文字: `text-xs`，显示 `+` 或 `−`

### 分支徽章样式
- 位置: `absolute top-2 right-2`
- 背景: `bg-accent-green/15`（绿色 15% 透明度）
- 边框: `border-accent-green/30`（绿色 30% 透明度）
- 文字: `text-accent-green`，`text-[10px]`

### 上移/下移按钮样式
- 尺寸: `w-6 h-6` (24px × 24px)
- 位置: `absolute right-2 top-2`
- 可用状态: `bg-ink-light/50 hover:bg-ink-light/70`
- 禁用状态: `bg-ink-light/20 cursor-not-allowed`

---

## 📊 视觉层次结构

```
第一层卡牌 (depth 0)
├─ 无缩进 (marginLeft: 0)
├─ 白色背景
├─ 左侧颜色条 (-8px)
├─ 上移/下移按钮（右上角）
└─ 子节点 (depth 1)
    ├─ 缩进 32px
    ├─ 浅色背景（groupColor 8% 透明度）
    ├─ 浅色边框（groupColor 18% 透明度）
    ├─ 左侧颜色条 (-16px，继承父颜色）
    ├─ 分支徽章（◀ 或 ▶）
    ├─ 左侧连接线（16px 偏移）
    └─ 子节点 (depth 2)
        ├─ 缩进 64px
        └─ ...（递归）
```

---

## 🔧 关键工具函数

### toAlpha() - HSL 透明度转换
```typescript
const toAlpha = (hslColor?: string, alpha = 0.08) => {
  if (!hslColor) return undefined;
  // 将 hsl(h, s, l) 转换为 hsla(h, s, l, a)
  return hslColor.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
};
```

**用途**:
- 将 HSL 颜色转换为 HSLA（带透明度）
- 用于背景色（alpha: 0.08）和边框色（alpha: 0.18）

---

## ✅ UI 特性清单

- ✅ 每层缩进 32px（depth 0 无缩进）
- ✅ 左侧颜色条（6px宽，继承第一层父卡颜色）
- ✅ 背景色区分（depth > 0 有浅色背景）
- ✅ 边框色区分（depth > 0 有浅色边框）
- ✅ 展开/折叠三角（圆形按钮，显示 +/−）
- ✅ 分支徽章（右上角，显示 ◀/▶）
- ✅ 上移/下移按钮（仅 depth 0，右上角）
- ✅ 连接线（左侧垂直线，仅当有子节点时）
- ✅ NPC 名称显示（替代 card.id）
- ✅ 选中状态（红色边框 + ring）
- ✅ Hover 效果（shadow-md）

---

**最后更新**: 2024年12月


