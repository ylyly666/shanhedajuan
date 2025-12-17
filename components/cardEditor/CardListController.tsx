import React, { useMemo, useRef } from 'react';
import type { Card, GameConfig, RandomPool } from '@/types';
import {
  getFirstLevelIds,
  getFirstLevelItemIds,
  rebuildCardsFromFirstLevelOrder,
  getFirstLevelParentId,
  getColorForParent,
} from '@/utils/card/cardTreeUtils';
import CardTree from './CardTree';

const isCard = (item: any): item is Card => Boolean(item && 'options' in item);

interface Props {
  stageCards: Array<Card | RandomPool>;
  config: GameConfig;
  activeStageId: string;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  expandedCards: Set<string>;
  toggleCardExpand: (id: string) => void;
  selectedCardId: string | null;
  selectedRandomPool: RandomPool | null;
  onSelectCard: (id: string) => void;
  onSelectRandomPool?: (pool: RandomPool) => void;
  onDeleteCard?: (id: string) => void;
  onMoveFirstLevel?: (itemId: string, direction: -1 | 1) => void;
}

const CardListController: React.FC<Props> = ({
  stageCards,
  config,
  activeStageId,
  setConfig,
  expandedCards,
  toggleCardExpand,
  selectedCardId,
  selectedRandomPool,
  onSelectCard,
  onSelectRandomPool,
  onDeleteCard,
  onMoveFirstLevel,
}) => {
  const cardsOnly = stageCards.filter(isCard);
  const firstLevelIds = useMemo(() => getFirstLevelIds(cardsOnly), [cardsOnly]);
  const firstLevelItemIds = useMemo(() => getFirstLevelItemIds(stageCards), [stageCards]);
  const cardMap = useMemo(() => new Map(cardsOnly.map((c) => [c.id, c])), [cardsOnly]);
  const containerRef = useRef<HTMLDivElement>(null);

  const parentColorMap = useMemo(() => {
    const map = new Map<string, string>();
    firstLevelIds.forEach((parentId, index) => {
      map.set(parentId, getColorForParent(parentId, index));
    });
    return map;
  }, [firstLevelIds]);

  const cardParentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    cardsOnly.forEach((card) => {
      const firstLevelParentId = getFirstLevelParentId(card.id, cardsOnly);
      map.set(card.id, firstLevelParentId);
    });
    return map;
  }, [cardsOnly]);

  const npcMap = useMemo(() => {
    const map = new Map<string, string>();
    const allNpcs = [...(config.storyNpcs || []), ...(config.npcs || [])];
    allNpcs.forEach((npc) => {
      if (npc.id && 'name' in npc) {
        map.set(npc.id, npc.name);
      }
    });
    return map;
  }, [config.storyNpcs, config.npcs]);

  const npcAvatarMap = useMemo(() => {
    const map = new Map<string, string>();
    const allNpcs = [...(config.storyNpcs || []), ...(config.npcs || [])];
    allNpcs.forEach((npc) => {
      if (npc.id && 'avatarUrl' in npc && npc.avatarUrl) {
        map.set(npc.id, npc.avatarUrl);
      }
    });
    return map;
  }, [config.storyNpcs, config.npcs]);

  const handleMove = (itemId: string, direction: -1 | 1) => {
    if (!onMoveFirstLevel) return;
    onMoveFirstLevel(itemId, direction);
  };

  if (!stageCards.length) {
    return (
      <div className="text-center py-16 text-ink-medium">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-lg font-serif mb-2">当前阶段暂无卡牌</p>
        <p className="text-sm mb-4">点击下方"添加卡牌"按钮开始创建</p>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="space-y-2" data-testid="card-list-controller">
        {firstLevelItemIds.map((itemId, index) => {
          const item = stageCards.find((c) => 'id' in c && c.id === itemId);
          if (!item) return null;

          if (!isCard(item)) {
            const pool = item as RandomPool;
            const canMoveUp = index > 0;
            const canMoveDown = index < firstLevelItemIds.length - 1;
            return (
              <div
                key={pool.id}
                className={`
                  relative p-3 border rounded mb-2 cursor-pointer transition-all
                  bg-stone-200/90 border-stone-500 text-stone-900
                  ${
                    selectedCardId === null && selectedRandomPool?.id === pool.id
                      ? 'ring-2 ring-primary-red/30 border-primary-red'
                      : 'hover:shadow-md'
                  }
                `}
                onClick={() => onSelectRandomPool && onSelectRandomPool(pool)}
                role="button"
                tabIndex={0}
                aria-label={`随机池: ${pool.id}`}
              >
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-stone-600 rounded-l pointer-events-none"
                  style={{ left: -8 }}
                />

                <div className="pr-12 flex items-center gap-3 min-h-[46px]">
                  <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-400 shrink-0">
                    🎲 随机池
                  </span>
                  <span className="text-sm text-stone-800 truncate">
                    抽取 {pool.count} 张随机事件
                  </span>
                </div>
                {onMoveFirstLevel && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canMoveUp) handleMove(pool.id, -1);
                      }}
                      disabled={!canMoveUp}
                      className={`
                        w-6 h-6 flex items-center justify-center rounded text-[10px] transition-all leading-none
                        ${
                          canMoveUp
                            ? 'bg-ink-light/50 hover:bg-ink-light/70 text-ink cursor-pointer'
                            : 'bg-ink-light/20 text-ink-medium cursor-not-allowed'
                        }
                      `}
                      title="上移"
                      aria-label="上移"
                    >
                      ▲
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canMoveDown) handleMove(pool.id, 1);
                      }}
                      disabled={!canMoveDown}
                      className={`
                        w-6 h-6 flex items-center justify-center rounded text-[10px] transition-all leading-none
                        ${
                          canMoveDown
                            ? 'bg-ink-light/50 hover:bg-ink-light/70 text-ink cursor-pointer'
                            : 'bg-ink-light/20 text-ink-medium cursor-not-allowed'
                        }
                      `}
                      title="下移"
                      aria-label="下移"
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>
            );
          }

          const card = cardMap.get(itemId);
          if (!card) return null;

          const canMoveUp = index > 0;
          const canMoveDown = index < firstLevelItemIds.length - 1;

          return (
            <div key={card.id} className="relative">
              <CardTree
                startId={card.id}
                npcAvatarMap={npcAvatarMap}
                cards={cardsOnly}
                depth={0}
                expanded={expandedCards}
                onToggle={toggleCardExpand}
                onSelect={onSelectCard}
                selected={selectedCardId}
                parentColorMap={parentColorMap}
                cardParentMap={cardParentMap}
                onMoveUp={canMoveUp ? () => handleMove(card.id, -1) : undefined}
                onMoveDown={canMoveDown ? () => handleMove(card.id, 1) : undefined}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                npcMap={npcMap}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardListController;

