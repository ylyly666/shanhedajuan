import React, { useState } from 'react';
import { GameConfig, Card, Stage, RandomPool, StatKey } from '@/types';
// @ts-ignore
import RandomPoolEditor from '@/components/library/RandomPoolEditor';
// @ts-ignore
import InlineNPCForm from '@/components/library/InlineNPCForm';
import OptionEditor from '@/components/cardEditor/OptionEditor';

interface ContextPanelProps {
  selectedCard: Card | null;
  selectedRandomPool: RandomPool | null;
  selectedStage: Stage | null;
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onCardUpdate: (card: Card) => void;
  onRandomPoolUpdate: (pool: RandomPool) => void;
  currentStage: Stage;
  activeStageId: string;
  onOpenRandomEventLibrary: () => void;
  onCreateFollowUp: (parentId: string, side: 'left' | 'right') => void;
  onDeleteCard?: (cardId: string) => void;
  onDeleteRandomPool?: (poolId: string) => void;
  onDeleteStage?: (stageId: string) => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
  selectedCard,
  selectedRandomPool,
  selectedStage,
  config,
  setConfig,
  onCardUpdate,
  onRandomPoolUpdate,
  currentStage,
  activeStageId,
  onOpenRandomEventLibrary,
  onCreateFollowUp,
  onDeleteCard,
  onDeleteRandomPool,
  onDeleteStage,
}) => {
  const [showInlineNPCForm, setShowInlineNPCForm] = useState(false);

  // 卡牌编辑器
  if (selectedCard) {
    return (
      <div className="w-80 min-w-[360px] glass border-l border-ink-light flex flex-col overflow-y-auto z-10 bg-paper">
        <div className="p-4 border-b border-ink-light flex justify-between items-center bg-paper/50">
          <h2 className="font-bold font-serif text-ink">卡牌属性</h2>
          {onDeleteCard && (
            <button
              onClick={() => {
                if (onDeleteCard && selectedCard) {
                  onDeleteCard(selectedCard.id);
                }
              }}
              className="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
              title="删除卡牌"
            >
              删除
            </button>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* NPC选择（带内联新建） */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink-medium uppercase font-serif">关联 NPC</label>
              <button
                onClick={() => setShowInlineNPCForm(true)}
                className="text-xs px-2 py-1 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/30 rounded-md font-bold transition"
              >
                + 新建
              </button>
            </div>
            {showInlineNPCForm ? (
              <InlineNPCForm
                config={config}
                setConfig={setConfig}
                onSave={(npc) => {
                  onCardUpdate({ ...selectedCard, npcId: npc.id });
                  setShowInlineNPCForm(false);
                }}
                onCancel={() => setShowInlineNPCForm(false)}
              />
            ) : (
              <select
                className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md"
                value={selectedCard.npcId}
                onChange={(e) => onCardUpdate({ ...selectedCard, npcId: e.target.value })}
              >
                {(config.storyNpcs || config.npcs || []).map((n: any) => (
                  <option key={n.id} value={n.id}>
                    {n.name} - {n.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 情境描述 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-ink-medium uppercase font-serif">情境描述</label>
            <textarea
              className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink text-sm min-h-[80px] rounded-md"
              value={selectedCard.text}
              onChange={(e) => onCardUpdate({ ...selectedCard, text: e.target.value })}
            />
          </div>

          <div className="h-px bg-ink-light my-4"></div>

          {/* 左滑选项 */}
          <OptionEditor
            label="👈 左滑选项"
            option={selectedCard.options.left}
            onChange={(opt) => onCardUpdate({ ...selectedCard, options: { ...selectedCard.options, left: opt } })}
            onCreateFollowUp={() => onCreateFollowUp(selectedCard.id, 'left')}
          />

          <div className="h-px bg-ink-light my-4"></div>

          {/* 右滑选项 */}
          <OptionEditor
            label="👉 右滑选项"
            option={selectedCard.options.right}
            onChange={(opt) => onCardUpdate({ ...selectedCard, options: { ...selectedCard.options, right: opt } })}
            onCreateFollowUp={() => onCreateFollowUp(selectedCard.id, 'right')}
          />
        </div>
      </div>
    );
  }

  // 随机池编辑器
  if (selectedRandomPool) {
    return (
      <div className="w-80 min-w-[360px] glass border-l border-ink-light flex flex-col overflow-y-auto z-10 bg-paper">
        <div className="p-4 border-b border-ink-light flex justify-between items-center bg-paper/50">
          <h2 className="font-bold font-serif text-ink">随机池配置</h2>
          {onDeleteRandomPool && (
            <button
              onClick={() => {
                if (onDeleteRandomPool && selectedRandomPool) {
                  onDeleteRandomPool(selectedRandomPool.id);
                }
              }}
              className="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
              title="删除随机池"
            >
              删除
            </button>
          )}
        </div>
        <RandomPoolEditor
          pool={selectedRandomPool}
          config={config}
          onUpdate={onRandomPoolUpdate}
          onOpenRandomEventLibrary={onOpenRandomEventLibrary}
        />
      </div>
    );
  }

  // 阶段编辑器
  if (selectedStage) {
    return <StageEditor stage={selectedStage} config={config} setConfig={setConfig} onDeleteStage={onDeleteStage} />;
  }

  // 默认空状态
  return (
    <div className="w-80 min-w-[360px] glass border-l border-ink-light flex flex-col overflow-y-auto z-10 bg-paper">
      <div className="p-4 border-b border-ink-light flex justify-between items-center bg-paper/50">
        <h2 className="font-bold font-serif text-ink">属性面板</h2>
      </div>
      <div className="p-8 text-center text-ink-medium text-sm">
        请选择卡牌、随机池或阶段进行编辑
      </div>
    </div>
  );
};

// StageEditor component (extracted from original Editor.tsx)
const StageEditor: React.FC<{
  stage: Stage;
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onDeleteStage?: (stageId: string) => void;
}> = ({ stage, config, setConfig, onDeleteStage }) => {
  const updateStage = (updates: Partial<Stage>) => {
    const newStages = config.stages.map((s) => (s.id === stage.id ? { ...s, ...updates } : s));
    setConfig({ ...config, stages: newStages });
  };

  const updateKPI = (stat: StatKey, value: number | null) => {
    const newKPI = { ...stage.kpi };
    if (value === null) {
      delete newKPI[stat];
    } else {
      newKPI[stat] = value;
    }
    updateStage({ kpi: newKPI });
  };

  const toggleKPIEnabled = (stat: StatKey) => {
    const newEnabled = { ...stage.kpiEnabled };
    newEnabled[stat] = !newEnabled[stat];
    updateStage({ kpiEnabled: newEnabled });
  };

  const statLabels: Record<StatKey, string> = {
    economy: '💰 经济发展',
    people: '👥 民生福祉',
    environment: '🌲 生态环境',
    governance: '🚩 乡风民俗',
  };

  return (
    <div className="w-80 min-w-[360px] glass border-l border-ink-light flex flex-col overflow-y-auto z-10 bg-paper">
      <div className="p-4 border-b border-ink-light flex justify-between items-center bg-paper/50">
        <h2 className="font-bold font-serif text-ink">阶段配置</h2>
        {onDeleteStage && (
          <button
            onClick={() => {
              if (onDeleteStage && stage) {
                onDeleteStage(stage.id);
              }
            }}
            className="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
            title="删除阶段"
          >
            删除
          </button>
        )}
      </div>
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-500 uppercase">阶段标题</label>
          <input
            type="text"
            className="w-full p-2 border border-stone-300 rounded"
            value={stage.title}
            onChange={(e) => updateStage({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-500 uppercase">阶段描述</label>
          <textarea
            className="w-full p-2 border border-stone-300 rounded text-sm"
            value={stage.description}
            onChange={(e) => updateStage({ description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="h-px bg-stone-200 my-4"></div>

        <div>
          <h3 className="text-sm font-bold text-stone-700 mb-3">📊 阶段考核 KPI 设置</h3>
          <p className="text-xs text-stone-500 mb-4">设置本阶段结束时需要达到的指标目标值。未达标将获得行政警告。</p>

          {(['economy', 'people', 'environment', 'governance'] as StatKey[]).map((stat) => (
            <div key={stat} className="mb-4 p-3 bg-stone-50 rounded border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={stage.kpiEnabled?.[stat] || false}
                    onChange={() => toggleKPIEnabled(stat)}
                    className="w-4 h-4"
                  />
                  <span>{statLabels[stat]}</span>
                </label>
              </div>
              {stage.kpiEnabled?.[stat] && (
                <div className="mt-2">
                  <label className="text-xs text-stone-500 mb-1 block">目标值 (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-stone-300 rounded text-sm"
                    value={stage.kpi?.[stat] || 50}
                    onChange={(e) => updateKPI(stat, parseInt(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextPanel;

