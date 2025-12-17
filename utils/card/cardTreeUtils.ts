import { Card, RandomPool } from '@/types';

export type FollowUpSide = 'left' | 'right';

const getChildId = (card: Card | undefined, side: FollowUpSide): string | undefined => {
  const followUp = card?.options?.[side]?.followUpCardId;
  return followUp ?? undefined;
};

/**
 * 收集某卡牌子树的渲染顺序（左 -> 右），不包含根节点本身�?
 * 用于计算插入点或重建子树序列�?
 */
export const collectSubtreeInOrder = (startId: string | undefined, allCards: Card[]): string[] => {
  if (!startId) return [];
  const cardMap = new Map<string, Card>();
  allCards.forEach(card => {
    if (card?.id && !cardMap.has(card.id)) {
      cardMap.set(card.id, card);
    }
  });

  const visited = new Set<string>([startId]);
  const ordered: string[] = [];

  const traverse = (id: string | undefined) => {
    if (!id || visited.has(id)) return;
    const node = cardMap.get(id);
    if (!node) return;
    visited.add(id);
    ordered.push(id);
    traverse(getChildId(node, 'left'));
    traverse(getChildId(node, 'right'));
  };

  const startCard = cardMap.get(startId);
  if (!startCard) return [];

  traverse(getChildId(startCard, 'left'));
  traverse(getChildId(startCard, 'right'));
  return ordered;
};

/**
 * 计算创建后续卡时的插入索引�?
 * - side === 'left': 插入在父卡之后、已存在的左子树末尾�?
 * - side === 'right': 插入在父卡之后、左子树 + 右子树末尾（保持左优先）�?
 */
export const findInsertIndexForSide = (
  stageCards: Card[],
  parentId: string,
  side: FollowUpSide,
): number => {
  const parentIndex = stageCards.findIndex(card => card.id === parentId);
  if (parentIndex === -1) return stageCards.length;
  const parent = stageCards[parentIndex];

  const leftRoot = getChildId(parent, 'left');
  const rightRoot = getChildId(parent, 'right');

  const leftSubtree = leftRoot ? [leftRoot, ...collectSubtreeInOrder(leftRoot, stageCards)] : [];
  const rightSubtree = rightRoot ? [rightRoot, ...collectSubtreeInOrder(rightRoot, stageCards)] : [];

  if (side === 'left') {
    return parentIndex + 1 + leftSubtree.length;
  }
  return parentIndex + 1 + leftSubtree.length + rightSubtree.length;
};

/**
 * 找到所有第一层（没有父节点指向）的卡�?id，顺序与 stage.cards 中出现顺序一致�?
 * 注意：RandomPool 被视为第一层项，但此函数只返回 Card �?ID�?
 */
export const getFirstLevelIds = (stageCards: Card[]): string[] => {
  const referenced = new Set<string>();
  stageCards.forEach(card => {
    const left = getChildId(card, 'left');
    const right = getChildId(card, 'right');
    if (left) referenced.add(left);
    if (right) referenced.add(right);
  });

  const firstLevel: string[] = [];
  const seen = new Set<string>();

  stageCards.forEach(card => {
    if (!referenced.has(card.id) && !seen.has(card.id)) {
      firstLevel.push(card.id);
      seen.add(card.id);
    }
  });
  return firstLevel;
};

/**
 * 获取第一层项（包�?Card �?RandomPool）的 ID 列表，顺序与 stage.cards 中出现顺序一致�?
 */
export const getFirstLevelItemIds = (stageCards: Array<Card | RandomPool>): string[] => {
  const cardsOnly = stageCards.filter((c): c is Card => 'options' in c);
  const referenced = new Set<string>();
  cardsOnly.forEach(card => {
    const left = getChildId(card, 'left');
    const right = getChildId(card, 'right');
    if (left) referenced.add(left);
    if (right) referenced.add(right);
  });

  const firstLevel: string[] = [];
  const seen = new Set<string>();

  stageCards.forEach(item => {
    const itemId = 'id' in item ? item.id : '';
    if (!itemId) return;
    
    // RandomPool 总是第一�?
    if ('type' in item && item.type === 'random_pool') {
      if (!seen.has(itemId)) {
        firstLevel.push(itemId);
        seen.add(itemId);
      }
    } else if ('options' in item) {
      // Card：如果没有被引用，则是第一�?
      if (!referenced.has(itemId) && !seen.has(itemId)) {
        firstLevel.push(itemId);
        seen.add(itemId);
      }
    }
  });
  return firstLevel;
};

/**
 * 根据第一层顺序重建完�?cards（父 -> 左子�?-> 右子树）�?
 * 未被遍历到的卡（游离节点）会被顺序追加，避免数据丢失�?
 */
export const rebuildCardsFromFirstLevelOrder = (
  firstLevelIds: string[],
  cardMap: Map<string, Card>,
): Card[] => {
  const ordered: Card[] = [];
  const visited = new Set<string>();

  const traverse = (id: string | undefined) => {
    if (!id || visited.has(id)) return;
    const node = cardMap.get(id);
    if (!node) return;
    visited.add(id);
    ordered.push(node);
    traverse(getChildId(node, 'left'));
    traverse(getChildId(node, 'right'));
  };

  firstLevelIds.forEach(id => traverse(id));

  // 兜底处理未被包含的节点（例如数据异常或重�?id 场景�?
  cardMap.forEach((_card, id) => {
    if (!visited.has(id)) {
      traverse(id);
    }
  });

  return ordered;
};

/**
 * 返回指定卡牌的直接父节点 id（若无父则为 null）�?
 */
export const getParentId = (cardId: string, stageCards: Card[]): string | null => {
  for (const card of stageCards) {
    const left = getChildId(card, 'left');
    const right = getChildId(card, 'right');
    if (left === cardId || right === cardId) {
      return card.id;
    }
  }
  return null;
};

/**
 * 颜色池：使用 HSL 生成可辨识的颜色，每 36° 分配一个色�?
 * 保证对比度与可读性（saturation 70%, lightness 60%�?
 */
// 更接近彩虹渐变的色阶，色相每 36°，适度提升饱和度/亮度以便区分
export const GROUP_COLORS = [
  'hsl(0, 70%, 58%)',    // 红
  'hsl(36, 70%, 58%)',   // 橙
  'hsl(72, 70%, 58%)',   // 黄绿
  'hsl(108, 70%, 58%)',  // 绿
  'hsl(144, 70%, 58%)',  // 青绿
  'hsl(180, 70%, 58%)',  // 青
  'hsl(216, 70%, 58%)',  // 天蓝
  'hsl(252, 70%, 58%)',  // 蓝紫
  'hsl(288, 70%, 58%)',  // 紫
  'hsl(324, 70%, 58%)',  // 洋红
];

/**
 * 根据 first-level parent ID 和索引获取颜�?
 * @param parentId first-level parent �?ID
 * @param index first-level parent 在列表中的索�?
 * @returns HSL 颜色字符�?
 */
export const getColorForParent = (parentId: string, index: number): string => {
  return GROUP_COLORS[index % GROUP_COLORS.length];
};

/**
 * 构建 first-level parent 到所有后代的映射
 * @param stageCards 所有卡�?
 * @returns Map<firstLevelParentId, Set<descendantIds>>
 */
export const buildParentDescendantMap = (stageCards: Card[]): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();
  const firstLevelIds = getFirstLevelIds(stageCards);
  const cardMap = new Map(stageCards.map(c => [c.id, c]));

  firstLevelIds.forEach(firstLevelId => {
    const descendants = new Set<string>([firstLevelId]); // 包含自身
    const traverse = (id: string) => {
      const card = cardMap.get(id);
      if (!card) return;
      const left = getChildId(card, 'left');
      const right = getChildId(card, 'right');
      if (left) {
        descendants.add(left);
        traverse(left);
      }
      if (right) {
        descendants.add(right);
        traverse(right);
      }
    };
    traverse(firstLevelId);
    map.set(firstLevelId, descendants);
  });

  return map;
};

/**
 * 获取卡牌所属的 first-level parent ID
 * @param cardId 卡牌 ID
 * @param stageCards 所有卡�?
 * @returns first-level parent ID，如果本身就�?first-level 则返回自�?ID
 */
export const getFirstLevelParentId = (cardId: string, stageCards: Card[]): string | null => {
  const firstLevelIds = getFirstLevelIds(stageCards);
  if (firstLevelIds.includes(cardId)) {
    return cardId; // 本身就是 first-level
  }

  // 递归向上查找 first-level parent
  let currentId: string | null = cardId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) break; // 防止循环
    visited.add(currentId);

    if (firstLevelIds.includes(currentId)) {
      return currentId;
    }

    currentId = getParentId(currentId, stageCards);
  }

  return null;
};

