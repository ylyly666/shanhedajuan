import type { Card, RandomPool } from '@/types';
import { getFirstLevelIds, getFirstLevelItemIds, rebuildCardsFromFirstLevelOrder } from './cardTreeUtils';

const isCard = (item: any): item is Card => Boolean(item && 'options' in item);
const isRandomPool = (item: any): item is RandomPool => Boolean(item && 'type' in item && item.type === 'random_pool');

/**
 * 对第一层项（包�?Card �?RandomPool）做�?下移动，Card 整体带动其子树�?
 */
export const reorderFirstLevelStageCards = (
  stageCards: Array<Card | RandomPool>,
  targetId: string,
  direction: -1 | 1,
): Array<Card | RandomPool> => {
  // 获取第一层项 ID 列表（包�?Card �?RandomPool�?
  const firstLevelItemIds = getFirstLevelItemIds(stageCards);
  const idx = firstLevelItemIds.findIndex((id) => id === targetId);
  if (idx === -1) return stageCards;

  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= firstLevelItemIds.length) return stageCards;

  // 重新排序第一层项
  const reorderedFirst = [...firstLevelItemIds];
  const [moved] = reorderedFirst.splice(idx, 1);
  reorderedFirst.splice(swapIdx, 0, moved);

  // 分离 Card �?RandomPool
  const cardsOnly = stageCards.filter(isCard);
  const cardMap = new Map<string, Card>();
  cardsOnly.forEach((c) => cardMap.set(c.id, c));

  // 按照 reorderedFirst 的顺序重�?
  const result: Array<Card | RandomPool> = [];
  const processedCards = new Set<string>();
  
  // 创建所有项的映射以便快速查�?
  const allItemsMap = new Map<string, Card | RandomPool>();
  stageCards.forEach(item => {
    if ('id' in item) {
      allItemsMap.set(item.id, item);
    }
  });
  
  for (const itemId of reorderedFirst) {
    const item = allItemsMap.get(itemId);
    if (!item) {
      console.warn('[Reorder] Item not found:', itemId);
      continue;
    }
    
    if (isRandomPool(item)) {
      // RandomPool 直接添加
      result.push(item);
    } else if (isCard(item)) {
      // 添加 Card 及其完整子树（left-first 顺序�?
      const addCardAndSubtree = (card: Card) => {
        if (processedCards.has(card.id)) return;
        processedCards.add(card.id);
        result.push(card);
        
        const leftId = card.options.left?.followUpCardId;
        const rightId = card.options.right?.followUpCardId;
        
        if (leftId) {
          const leftCard = cardMap.get(leftId);
          if (leftCard) addCardAndSubtree(leftCard);
        }
        if (rightId) {
          const rightCard = cardMap.get(rightId);
          if (rightCard) addCardAndSubtree(rightCard);
        }
      };
      addCardAndSubtree(item);
    }
  }

  // 添加任何未处理的卡（防御性编程）
  cardsOnly.forEach(card => {
    if (!processedCards.has(card.id)) {
      console.warn('[Reorder] Unprocessed card found:', card.id);
      result.push(card);
    }
  });

  console.log('[Reorder]', { 
    targetId, 
    direction, 
    firstLevelItemIds, 
    reorderedFirst, 
    resultLength: result.length,
    resultIds: result.map(r => 'id' in r ? r.id : 'unknown')
  });
  return result;
};

