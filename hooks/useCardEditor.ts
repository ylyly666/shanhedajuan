import { useMemo, useState } from 'react';
import { Card, GameConfig, RandomPool, Stage } from '@/types';
import { DEMO_CONFIG } from '@/constants';
import { handleCreateFollowUp as handleCreateFollowUpController } from '@/utils/card/handleCreateFollowUp';
import { reorderFirstLevelStageCards } from '@/utils/card/reorderFirstLevel';
import { getFirstLevelParentId } from '@/utils/card/cardTreeUtils';

interface UseCardEditorParams {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  activeStageId: string;
  setActiveStageId: (id: string) => void;
}

export const useCardEditor = ({
  config,
  setConfig,
  activeStageId,
  setActiveStageId,
}: UseCardEditorParams) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedRandomPool, setSelectedRandomPool] = useState<RandomPool | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const currentStage = useMemo(
    () => config.stages?.find((s) => s.id === activeStageId),
    [config.stages, activeStageId],
  );

  const currentCard = useMemo(() => {
    if (!currentStage || !selectedCardId) return undefined;
    return currentStage.cards.find((c) => 'id' in c && c.id === selectedCardId) as Card | undefined;
  }, [currentStage, selectedCardId]);

  const toggleCardExpand = (cardId: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const collectAllFollowUpIds = (cardId: string, allCards: Array<Card | RandomPool>): Set<string> => {
    const followUpIds = new Set<string>();
    const card = allCards.find((c) => 'id' in c && c.id === cardId) as Card | undefined;
    if (!card || !('options' in card)) return followUpIds;

    const collectRecursive = (id: string) => {
      const current = allCards.find((c) => 'id' in c && c.id === id) as Card | undefined;
      if (!current || !('options' in current)) return;

      if (current.options?.left?.followUpCardId) {
        followUpIds.add(current.options.left.followUpCardId);
        collectRecursive(current.options.left.followUpCardId);
      }
      if (current.options?.right?.followUpCardId) {
        followUpIds.add(current.options.right.followUpCardId);
        collectRecursive(current.options.right.followUpCardId);
      }
    };

    collectRecursive(cardId);
    return followUpIds;
  };

  const handleResetToDemo = () => {
    if (!currentStage) return;

    const demoStage =
      DEMO_CONFIG.stages.find((s: Stage) => s.id === currentStage.id) || DEMO_CONFIG.stages[0];
    if (!demoStage || !demoStage.cards?.length) {
      console.warn('[TimelineEditor] No demo data found for stage', currentStage.id);
      return;
    }

    const sample: Array<Card | RandomPool> = [...demoStage.cards];
    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === activeStageId ? { ...stage, cards: sample } : stage,
      ),
    }));

    const allIds = sample.filter((i) => 'id' in i).map((i) => (i as any).id);
    setExpandedCards(new Set(allIds));
  };

  const handleCreateFollowUp = (
    parentId: string,
    side: 'left' | 'right',
    overrides?: Partial<Card>,
  ) => {
    handleCreateFollowUpController({
      config,
      setConfig,
      activeStageId,
      parentId,
      side,
      setExpandedCards,
      setSelectedCardId,
      overrides,
    });
  };

  const handleCardUpdate = (newCard: Card) => {
    if (!currentStage) return;
    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) => {
        if (stage.id !== activeStageId) return stage;
        return {
          ...stage,
          cards: stage.cards.map((c) => ('id' in c && c.id === newCard.id ? newCard : c)),
        };
      }),
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    if (!currentStage) return;
    if (!confirm('确定要删除这张卡牌吗？如果该卡牌有后续关联卡，也会一并删除。')) {
      return;
    }

    const idsToDelete = new Set<string>([cardId]);

    const collectFollowUps = (id: string) => {
      const card = currentStage.cards.find((c) => 'id' in c && c.id === id) as Card | undefined;
      if (card?.options?.left?.followUpCardId) {
        idsToDelete.add(card.options.left.followUpCardId);
        collectFollowUps(card.options.left.followUpCardId);
      }
      if (card?.options?.right?.followUpCardId) {
        idsToDelete.add(card.options.right.followUpCardId);
        collectFollowUps(card.options.right.followUpCardId);
      }
    };
    collectFollowUps(cardId);

    const newCards = currentStage.cards
      .filter((c) => !('id' in c && idsToDelete.has((c as Card).id)))
      .map((c) => {
        if ('options' in c) {
          const card = c as Card;
          const updated = { ...card };

          if (updated.options.left.followUpCardId && idsToDelete.has(updated.options.left.followUpCardId)) {
            updated.options.left = { ...updated.options.left, followUpCardId: undefined };
          }
          if (
            updated.options.right.followUpCardId &&
            idsToDelete.has(updated.options.right.followUpCardId)
          ) {
            updated.options.right = { ...updated.options.right, followUpCardId: undefined };
          }
          return updated;
        }
        return c;
      });

    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id !== activeStageId ? stage : { ...stage, cards: newCards },
      ),
    }));

    if (selectedCardId === cardId) setSelectedCardId(null);
  };

  const handleAddCard = () => {
    if (!currentStage) return;

    const newCard: Card = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      npcId: (config.storyNpcs || config.npcs || [])[0]?.id || 'npc_secretary',
      text: '请输入新的事件内容...',
      options: {
        left: { text: '选项A', delta: {} },
        right: { text: '选项B', delta: {} },
      },
    };

    let insertIndex = currentStage.cards.length;
    let parentIdForExpansion: string | null = null;

    if (selectedCardId) {
      const selectedIndex = currentStage.cards.findIndex((c) => 'id' in c && c.id === selectedCardId);
      if (selectedIndex !== -1) {
        const followUpIds = collectAllFollowUpIds(selectedCardId, currentStage.cards);
        const subtreeLength = followUpIds.size;
        insertIndex = selectedIndex + 1 + subtreeLength;

        const cardsOnly = currentStage.cards.filter((c) => 'id' in c && 'options' in c) as Card[];
        const firstLevelParentId = getFirstLevelParentId(selectedCardId, cardsOnly);
        parentIdForExpansion = firstLevelParentId || selectedCardId;
      }
    }

    const newCards = [...currentStage.cards];
    newCards.splice(insertIndex, 0, newCard);

    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id !== activeStageId ? stage : { ...stage, cards: newCards },
      ),
    }));

    setSelectedCardId(newCard.id);
    if (parentIdForExpansion) {
      setExpandedCards((prev) => new Set([...prev, parentIdForExpansion!]));
    }
    setTimeout(() => {
      document.getElementById(`card-node-${newCard.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleAddRandomPool = () => {
    if (!currentStage) return;
    const newPool: RandomPool = {
      type: 'random_pool',
      id: `pool_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      count: 1,
      entries: [],
    };

    setConfig((prevConfig) => ({
      ...prevConfig,
      stages: prevConfig.stages.map((stage) =>
        stage.id !== activeStageId ? stage : { ...stage, cards: [...stage.cards, newPool] },
      ),
    }));
    setSelectedRandomPool(newPool);
    setSelectedCardId(null);
  };

  const handleRandomPoolUpdate = (pool: RandomPool) => {
    if (!currentStage) return;
    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) => {
        if (stage.id !== activeStageId) return stage;
        return {
          ...stage,
          cards: stage.cards.map((c) =>
            'type' in c && c.type === 'random_pool' && c.id === pool.id ? pool : c,
          ),
        };
      }),
    }));
    setSelectedRandomPool(pool);
  };

  const handleAddStage = () => {
    const newStage: Stage = {
      id: `stage_${Date.now()}`,
      title: `新阶段 ${config.stages.length + 1}`,
      description: '',
      cards: [],
    };
    setConfig({ ...config, stages: [...config.stages, newStage] });
    setActiveStageId(newStage.id);
  };

  const handleDeleteStage = (stageId: string) => {
    if (config.stages.length <= 1) {
      alert('至少需要保留一个阶段！');
      return;
    }
    if (!confirm(`确定要删除阶段 "${config.stages.find((s) => s.id === stageId)?.title}" 吗？该阶段的所有卡牌将被永久删除。`)) {
      return;
    }
    const newStages = config.stages.filter((s) => s.id !== stageId);
    setConfig({ ...config, stages: newStages });
    if (stageId === activeStageId && newStages.length > 0) {
      setActiveStageId(newStages[0].id);
    }
  };

  const handleItemClick = (item: Card | RandomPool) => {
    if ('type' in item && item.type === 'random_pool') {
      setSelectedRandomPool(item);
      setSelectedCardId(null);
    } else {
      setSelectedCardId(item.id);
      setSelectedRandomPool(null);
    }
  };

  const handleMoveFirstLevel = (itemId: string, direction: -1 | 1) => {
    if (!currentStage) return;
    const newCards = reorderFirstLevelStageCards(currentStage.cards, itemId, direction);
    setConfig((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id !== activeStageId ? stage : { ...stage, cards: newCards },
      ),
    }));
  };

  return {
    currentStage,
    currentCard,
    selectedCardId,
    setSelectedCardId,
    selectedRandomPool,
    setSelectedRandomPool,
    expandedCards,
    setExpandedCards,
    toggleCardExpand,
    handleResetToDemo,
    handleCreateFollowUp,
    handleCardUpdate,
    handleDeleteCard,
    handleAddCard,
    handleAddRandomPool,
    handleRandomPoolUpdate,
    handleAddStage,
    handleDeleteStage,
    handleItemClick,
    handleMoveFirstLevel,
  };
};



