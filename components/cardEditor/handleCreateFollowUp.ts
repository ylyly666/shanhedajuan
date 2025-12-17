import type { Dispatch, SetStateAction } from 'react';
import { GameConfig, Card, Stage } from '@/types';
import { findInsertIndexForSide, FollowUpSide } from '@/utils/card/cardTreeUtils';

export interface HandleCreateFollowUpParams {
  config: GameConfig;
  activeStageId: string;
  parentId: string;
  side: FollowUpSide;
  setConfig: Dispatch<SetStateAction<GameConfig>>;
  setExpandedCards: Dispatch<SetStateAction<Set<string>>>;
  setSelectedCardId: (id: string | null) => void;
  overrides?: Partial<Card>;
}

const isCard = (item: any): item is Card => Boolean(item && 'options' in item);

const buildNewCard = (params: HandleCreateFollowUpParams, newId: string): Card => {
  const { overrides, config } = params;
  const defaultOption = { text: '选项', delta: {} };

  const base: Card = {
    id: newId,
    npcId: overrides?.npcId || (config.storyNpcs || config.npcs || [])[0]?.id || 'npc_default',
    text: overrides?.text || '后续事件描述...',
    options: {
      left: { ...defaultOption, ...(overrides?.options?.left || {}) },
      right: { ...defaultOption, ...(overrides?.options?.right || {}) },
    },
    tags: overrides?.tags,
  };
  return { ...base, ...(overrides || {}), options: base.options };
};

export const generateFollowUpId = () => `card_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

/**
 * 原子创建后续卡：计算插入点、更新父引用、写入 config，并同步展开/选中状态。
 */
export const handleCreateFollowUp = (params: HandleCreateFollowUpParams) => {
  const {
    activeStageId,
    parentId,
    side,
    setConfig,
    setExpandedCards,
    setSelectedCardId,
    overrides,
  } = params;

  try {
    const newId = generateFollowUpId();
    let insertIndexForLog = -1;

    let computedConfig: GameConfig | null = null;
    setConfig((prev) => {
      const stageIndex = prev.stages.findIndex((s) => s.id === activeStageId);
      if (stageIndex === -1) {
        console.error('handleCreateFollowUp: active stage not found', { activeStageId });
        computedConfig = prev;
        return prev;
      }

      const stage = prev.stages[stageIndex] as Stage;
      const cardsOnly = stage.cards.filter(isCard);
      const parentCard = cardsOnly.find((c) => c.id === parentId);

      if (!parentCard) {
        console.error('handleCreateFollowUp: parent card not found', { parentId });
        computedConfig = prev;
        return prev;
      }

      const insertIndexInCards = findInsertIndexForSide(cardsOnly, parentId, side);

      const cardStageIndices: number[] = [];
      stage.cards.forEach((item, idx) => {
        if (isCard(item)) cardStageIndices.push(idx);
      });

      const insertIndexInStage =
        insertIndexInCards < cardStageIndices.length ? cardStageIndices[insertIndexInCards] : stage.cards.length;
      insertIndexForLog = insertIndexInStage;

      const newCard = buildNewCard(params, newId);

      const updatedParent: Card = {
        ...parentCard,
        options: {
          ...parentCard.options,
          [side]: {
            ...parentCard.options[side],
            followUpCardId: newId,
          },
        },
      };

      const newStageCards = [...stage.cards];
      newStageCards.splice(insertIndexInStage, 0, newCard);

      const parentIndexInStage = newStageCards.findIndex((item) => isCard(item) && item.id === parentId);
      if (parentIndexInStage >= 0) {
        newStageCards[parentIndexInStage] = updatedParent;
      }

      const newStages = prev.stages.map((s, idx) =>
        idx === stageIndex ? { ...s, cards: newStageCards } : s
      );
      const newConfig = { ...prev, stages: newStages };
      computedConfig = newConfig;
      return newConfig;
    });

    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });
    setSelectedCardId(newId);
    console.log('Created follow-up', newId, 'insertIndex', insertIndexForLog);
  } catch (error) {
    console.error('handleCreateFollowUp: failed to create follow-up', error);
  }
};

