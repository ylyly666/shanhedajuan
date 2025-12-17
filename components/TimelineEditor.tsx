import React, { useState, useEffect, useMemo } from 'react';
import { GameConfig, Card, Stage, RandomPool } from '@/types';
import { parseFile } from '@/utils/file/fileParser';
import { saveGameConfig } from '@/utils/storage/storage';
import { DEMO_CONFIG } from '@/constants';
import AssetsDrawer from '@/components/library/AssetsDrawer';
import ContextPanel from './ContextPanel';
import { handleCreateFollowUp as handleCreateFollowUpController } from '@/utils/card/handleCreateFollowUp';
import CardListController from '@/components/cardEditor/CardListController';
import { reorderFirstLevelStageCards } from '@/utils/card/reorderFirstLevel';
import { getFirstLevelParentId, collectSubtreeInOrder } from '@/utils/card/cardTreeUtils';

interface TimelineEditorProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  activeStageId: string;
  setActiveStageId: (id: string) => void;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({
  config,
  setConfig,
  activeStageId,
  setActiveStageId,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedRandomPool, setSelectedRandomPool] = useState<RandomPool | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showRandomEventLibraryPanel, setShowRandomEventLibraryPanel] = useState(false);

  const currentStage = config.stages?.find(s => s.id === activeStageId);
  const currentCard = currentStage?.cards?.find(c => 'id' in c && c.id === selectedCardId) as Card | undefined;

  // 切换卡牌展开/收起
  const toggleCardExpand = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) newSet.delete(cardId);
      else newSet.add(cardId);
      return newSet;
    });
  };

  // 递归收集所有后续卡牌 ID
  const collectAllFollowUpIds = (
    cardId: string,
    allCards: Array<Card | RandomPool>
  ): Set<string> => {
    const followUpIds = new Set<string>();
    const card = allCards.find(c => 'id' in c && c.id === cardId) as Card | undefined;

    if (!card || !('options' in card)) return followUpIds;

    const collectRecursive = (id: string) => {
      const currentCard = allCards.find(c => 'id' in c && c.id === id) as Card | undefined;
      if (!currentCard || !('options' in currentCard)) return;

      if (currentCard.options?.left?.followUpCardId) {
        followUpIds.add(currentCard.options.left.followUpCardId);
        collectRecursive(currentCard.options.left.followUpCardId);
      }
      if (currentCard.options?.right?.followUpCardId) {
        followUpIds.add(currentCard.options.right.followUpCardId);
        collectRecursive(currentCard.options.right.followUpCardId);
      }
    };

    collectRecursive(cardId);
    return followUpIds;
  };

  // 加载示例树（使用 DEMO_CONFIG 中的完整示例数据）
  const handleResetToDemo = () => {
    if (!currentStage) return;

    // 从 DEMO_CONFIG 中获取对应阶段的示例数据
    // 优先匹配当前阶段ID，如果找不到则使用第一个阶段的数据
    const demoStage = DEMO_CONFIG.stages.find((s: Stage) => s.id === currentStage.id) || DEMO_CONFIG.stages[0];
    
    if (!demoStage || !demoStage.cards || demoStage.cards.length === 0) {
      console.warn('[TimelineEditor] No demo data found for stage', currentStage.id);
      return;
    }

    // 使用示例阶段的完整卡牌数据（包括随机池）
    const sample: Array<Card | RandomPool> = [...demoStage.cards];

    const newStages = config.stages.map(stage =>
      stage.id === activeStageId ? { ...stage, cards: sample } : stage
    );

    setConfig({ ...config, stages: newStages });

    // 展开所有卡牌
    const allIds = sample
      .filter(i => 'id' in i)
      .map(i => (i as any).id);

    setExpandedCards(new Set(allIds));
    
    console.log('[TimelineEditor] Loaded demo tree for stage', currentStage.id, 'with', sample.length, 'items');
  };

  // 创建后续卡（原子写入）
  const handleCreateFollowUp = (
    parentId: string,
    side: 'left' | 'right',
    overrides?: Partial<Card>
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

    const newStages = config.stages.map(stage => {
      if (stage.id !== activeStageId) return stage;
      return {
        ...stage,
        cards: stage.cards.map(c =>
          'id' in c && c.id === newCard.id ? newCard : c
        )
      };
    });

    setConfig({ ...config, stages: newStages });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!currentStage) return;

    if (!confirm('确定要删除这张卡牌吗？如果该卡牌有后续关联卡，也会一并删除。')) {
      return;
    }

    const idsToDelete = new Set<string>([cardId]);

    const collectFollowUps = (id: string) => {
      const card = currentStage.cards.find(c => 'id' in c && c.id === id) as Card | undefined;
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

    // 清理引用
    const newCards = currentStage.cards
      .filter(c => {
        if ('id' in c && idsToDelete.has(c.id)) return false;
        return true;
      })
      .map(c => {
        if ('options' in c) {
          const card = c as Card;
          const newCard = { ...card };

          if (newCard.options.left.followUpCardId &&
              idsToDelete.has(newCard.options.left.followUpCardId)) {
            newCard.options.left = {
              ...newCard.options.left,
              followUpCardId: undefined
            };
          }

          if (newCard.options.right.followUpCardId &&
              idsToDelete.has(newCard.options.right.followUpCardId)) {
            newCard.options.right = {
              ...newCard.options.right,
              followUpCardId: undefined
            };
          }

          return newCard;
        }
        return c;
      });

    const newStages = config.stages.map(stage =>
      stage.id !== activeStageId ? stage : { ...stage, cards: newCards }
    );

    setConfig({ ...config, stages: newStages });

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
        right: { text: '选项B', delta: {} }
      }
    };

    let insertIndex = currentStage.cards.length;
    let parentIdForExpansion: string | null = null;

    if (selectedCardId) {
      const selectedIndex = currentStage.cards.findIndex(c => 'id' in c && c.id === selectedCardId);
      if (selectedIndex === -1) {
        // 如果选中的卡不在当前 stage，回退到追加
        insertIndex = currentStage.cards.length;
      } else {
        // 收集选中卡的所有后续卡（不包含自身）
        const followUpIds = collectAllFollowUpIds(selectedCardId, currentStage.cards);
        const subtreeLength = followUpIds.size;
        
        // 插入位置：选中卡之后 + 子树长度（不包含自身，所以 +1 是选中卡本身的位置）
        insertIndex = selectedIndex + 1 + subtreeLength;
        
        // 确定父节点用于展开（如果选中的卡是 first-level，则展开它；否则展开其 first-level parent）
        const cardsOnly = currentStage.cards.filter(c => 'id' in c && 'options' in c) as Card[];
        const firstLevelParentId = getFirstLevelParentId(selectedCardId, cardsOnly);
        parentIdForExpansion = firstLevelParentId || selectedCardId;
      }
    }

    // 插入新卡
    const newCards = [...currentStage.cards];
    newCards.splice(insertIndex, 0, newCard);

    const newStages = config.stages.map(stage =>
      stage.id !== activeStageId
        ? stage
        : { ...stage, cards: newCards }
    );

    console.log('[Editor] addCard id=', newCard.id, 'index=', insertIndex);
    setConfig({ ...config, stages: newStages });
    setSelectedCardId(newCard.id);
    
    // 展开父节点，使新卡可见
    if (parentIdForExpansion) {
      setExpandedCards(prev => new Set([...prev, parentIdForExpansion!]));
    }
    
    // 滚动到新卡（延迟执行以确保 DOM 已更新）
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
      entries: []
    };

    setConfig(prevConfig => {
      const newStages = prevConfig.stages.map(stage =>
        stage.id !== activeStageId
          ? stage
          : { ...stage, cards: [...stage.cards, newPool] }
      );
      return { ...prevConfig, stages: newStages };
    });
    setSelectedRandomPool(newPool);
    setSelectedCardId(null);
    console.log('[Editor] Created random pool', newPool.id);
  };

  const handleAddStage = () => {
    const newStage: Stage = {
      id: `stage_${Date.now()}`,
      title: `新阶段 ${config.stages.length + 1}`,
      description: '',
      cards: []
    };
    setConfig({ ...config, stages: [...config.stages, newStage] });
    setActiveStageId(newStage.id);
  };

  const handleDeleteStage = (stageId: string) => {
    if (config.stages.length <= 1) {
      alert('至少需要保留一个阶段！');
      return;
    }

    if (!confirm(`确定要删除阶段 "${config.stages.find(s => s.id === stageId)?.title}" 吗？该阶段的所有卡牌将被永久删除。`)) {
      return;
    }

    const newStages = config.stages.filter(s => s.id !== stageId);
    setConfig({ ...config, stages: newStages });

    // 如果删除的是当前阶段，切换到第一个阶段
    if (stageId === activeStageId) {
      if (newStages.length > 0) {
        setActiveStageId(newStages[0].id);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const text = await parseFile(file);
    } catch (error: any) {
      alert(`文件解析失败: ${error.message}`);
    }
  };

  const handleTextPaste = (text: string) => {};

  const handleRandomPoolUpdate = (pool: RandomPool) => {
    if (!currentStage) return;

    console.log('[Editor] Update random pool', pool.id, 'count:', pool.count);
    setConfig(prev => {
      const newStages = prev.stages.map(stage => {
        if (stage.id !== activeStageId) return stage;

        return {
          ...stage,
          cards: stage.cards.map(c =>
            'type' in c && c.type === 'random_pool' && c.id === pool.id
              ? pool
              : c
          )
        };
      });

      return { ...prev, stages: newStages };
    });
    
    // 更新选中的 random pool 状态
    setSelectedRandomPool(pool);
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

  // 自动保存配置（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      saveGameConfig(config);
    }, 1000);
    return () => clearTimeout(timer);
  }, [config]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Assets Drawer - 固定在左侧，始终显示 */}
      <AssetsDrawer
        config={config}
        setConfig={setConfig}
        isOpen={true}
        onToggle={() => {}}
        onFileUpload={handleFileUpload}
        onTextPaste={handleTextPaste}
        activeStageId={activeStageId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-paper">
        {/* Timeline Header - 改进的标签页风格 */}
        <div className="h-16 bg-white/50 border-b-2 border-ink-light flex items-end px-6 overflow-x-auto">
          <div className="flex items-center gap-1 h-full">
            {config.stages && config.stages.length > 0 ? (
              <>
                {config.stages.map((stage, index) => (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStageId(stage.id)}
                    className={`
                      relative px-6 py-3 text-sm font-bold whitespace-nowrap transition-all
                      rounded-t-lg
                      ${
                        activeStageId === stage.id
                          ? 'bg-paper text-primary-red shadow-sm -mb-px'
                          : 'text-ink-medium hover:text-ink hover:bg-white/60'
                      }
                    `}
                    style={{
                      borderBottom: activeStageId === stage.id ? '3px solid #DC2626' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-60 font-normal">#{index + 1}</span>
                      <span>{stage.title}</span>
                      {stage.kpi && Object.keys(stage.kpi).length > 0 && (
                        <span className="ml-1 w-2 h-2 bg-accent-green rounded-full" title="已设置KPI"></span>
                      )}
                    </div>
                  </button>
                ))}
                {/* 添加阶段按钮 */}
                <button
                  onClick={handleAddStage}
                  className="ml-2 px-4 py-3 text-ink-medium hover:text-ink hover:bg-white/60 rounded-t-lg transition-all text-sm font-bold"
                  title="添加新阶段"
                >
                  + 添加阶段
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4 h-full">
                <div className="text-ink-medium text-sm">暂无阶段</div>
                <button
                  onClick={handleAddStage}
                  className="px-4 py-2 bg-primary-red text-white rounded-md text-sm font-bold hover:bg-primary-red/90 transition-colors"
                  title="添加第一个阶段"
                >
                  + 创建第一个阶段
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 卡牌列表和属性面板 - 水平布局 */}
        <div className="flex-1 flex min-w-0 overflow-hidden">
          {/* 卡牌树 + 排序控制 */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
              <CardListController
                stageCards={currentStage?.cards || []}
                config={config}
                activeStageId={activeStageId}
                setConfig={setConfig}
                expandedCards={expandedCards}
                toggleCardExpand={toggleCardExpand}
                selectedCardId={selectedCardId}
                selectedRandomPool={selectedRandomPool}
                onSelectCard={id => {
                  if (id) {
                    setSelectedCardId(id);
                    setSelectedRandomPool(null);
                  }
                }}
                onSelectRandomPool={(pool) => {
                  setSelectedRandomPool(pool);
                  setSelectedCardId(null);
                }}
                onDeleteCard={handleDeleteCard}
                onMoveFirstLevel={(itemId, direction) => {
                  if (!currentStage) return;
                  console.log('[Editor] Move first-level', itemId, direction);
                  const newCards = reorderFirstLevelStageCards(currentStage.cards, itemId, direction);
                  console.log('[Editor] New cards length', newCards.length, 'old length', currentStage.cards.length);
                  console.log('[Editor] New cards IDs', newCards.map(c => 'id' in c ? c.id : (c as any).type));
                  setConfig(prev => {
                    const newStages = prev.stages.map(stage =>
                      stage.id !== activeStageId ? { ...stage, cards: newCards } : stage
                    );
                    return { ...prev, stages: newStages };
                  });
                }}
              />
            </div>
            
            {/* 操作按钮工具栏 */}
            <div className="border-t border-ink-light bg-white/50 px-8 py-4 flex items-center gap-3">
              <button
                onClick={handleAddCard}
                disabled={!currentStage}
                className={`
                  px-4 py-2 rounded-md text-sm font-bold transition-all
                  ${currentStage
                    ? 'bg-primary-red text-white hover:bg-primary-red/90 shadow-sm hover:shadow-md'
                    : 'bg-ink-light/30 text-ink-medium cursor-not-allowed opacity-50'
                  }
                `}
                aria-label="添加卡牌"
                title="添加一张新卡牌到当前阶段"
              >
                ➕ 添加卡牌
              </button>
              
              <button
                onClick={handleAddRandomPool}
                disabled={!currentStage}
                className={`
                  px-4 py-2 rounded-md text-sm font-bold transition-all
                  ${currentStage
                    ? 'bg-accent-green text-white hover:bg-accent-green/90 shadow-sm hover:shadow-md'
                    : 'bg-ink-light/30 text-ink-medium cursor-not-allowed opacity-50'
                  }
                `}
                aria-label="添加随机池"
                title="添加一个随机池到当前阶段"
              >
                🎲 添加随机池
              </button>
              
              <button
                onClick={handleResetToDemo}
                disabled={!currentStage}
                className={`
                  px-4 py-2 rounded-md text-sm font-bold transition-all
                  ${currentStage
                    ? 'bg-ink-medium text-white hover:bg-ink-medium/90 shadow-sm hover:shadow-md'
                    : 'bg-ink-light/30 text-ink-medium cursor-not-allowed opacity-50'
                  }
                `}
                aria-label="加载示例"
                title="重置当前阶段为示例树（所有卡牌将被替换）"
              >
                📋 加载示例
              </button>
            </div>
          </div>

          {/* Context Panel */}
          <ContextPanel
            selectedCard={currentCard || null}
            selectedRandomPool={selectedRandomPool}
            selectedStage={currentStage || null}
            config={config}
            setConfig={setConfig}
            onCardUpdate={handleCardUpdate}
            onRandomPoolUpdate={handleRandomPoolUpdate}
            currentStage={currentStage!}
            activeStageId={activeStageId}
            onOpenRandomEventLibrary={() => {
              setShowRandomEventLibraryPanel(true);
            }}
            onCreateFollowUp={handleCreateFollowUp}
            onDeleteCard={handleDeleteCard}
            onDeleteRandomPool={(poolId) => {
              if (!currentStage) return;
              if (!confirm('确定要删除这个随机池吗？')) return;
              const newCards = currentStage.cards.filter(c => !('type' in c && c.type === 'random_pool' && c.id === poolId));
              setConfig(prev => ({
                ...prev,
                stages: prev.stages.map(s =>
                  s.id === activeStageId ? { ...s, cards: newCards } : s
                )
              }));
              if (selectedRandomPool?.id === poolId) {
                setSelectedRandomPool(null);
              }
            }}
            onDeleteStage={handleDeleteStage}
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineEditor;

