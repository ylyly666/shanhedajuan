import React, { useState } from 'react';
import { GameConfig, StatKey, CrisisConfig } from '@/types';
import { Save, UserPlus, RefreshCcw, ArrowRightCircle } from 'lucide-react';

interface CrisisConfigPageProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onBack: () => void;
}

const CrisisConfigPage: React.FC<CrisisConfigPageProps> = ({ config, setConfig, onBack }) => {
  // 默认选中第一个
  const [activeStat, setActiveStat] = useState<StatKey>('economy');

  const statLabels: Record<StatKey, string> = {
    economy: '💰 经济发展',
    people: '👥 民生福祉',
    environment: '🌲 生态环保',
    governance: '🚩 乡风民俗',
  };
  const judgeLabels: Record<string, string> = {
    empathy: '共情度',
    rationality: '实际性',
    strategy: '策略性',
    compliance: '合规度',
  };

  // 更新当前选中指标的配置
  const updateActiveCrisisConfig = (updates: Partial<CrisisConfig>) => {
    setConfig(prev => ({
      ...prev,
      crisisConfig: {
        ...prev.crisisConfig,
        [activeStat]: { ...prev.crisisConfig[activeStat], ...updates },
      },
    }));
  };

  // 核心逻辑：从右侧模板库“应用”到中间
  const applyTemplate = (npc: any) => {
    updateActiveCrisisConfig({
      npcId: npc.id, // 如果需要关联ID
      npcName: npc.name,
      npcRole: npc.role,
      npcAvatarUrl: npc.avatarUrl,
      personality: npc.personality,
      judgeWeights: npc.judgeWeights,
    });
    // 可以加个Toast提示
    console.log(`已将模板 ${npc.name} 应用于 ${statLabels[activeStat]}`);
  };

  // 核心逻辑：将当前中间的配置“保存”为新模板
  const saveAsTemplate = () => {
    const currentCrisis = config.crisisConfig[activeStat];
    if (!currentCrisis.npcName || !currentCrisis.personality) {
      alert("请先完善NPC信息再保存为模板");
      return;
    }

    const newTemplate = {
      id: `npc_tpl_${Date.now()}`,
      name: currentCrisis.npcName,
      role: currentCrisis.npcRole || '未知身份',
      avatarUrl: currentCrisis.npcAvatarUrl || 'https://picsum.photos/seed/npc/200/200',
      personality: currentCrisis.personality,
      judgeWeights: currentCrisis.judgeWeights || { empathy: 25, rationality: 25, strategy: 25, compliance: 25 },
    };

    setConfig(prev => ({
      ...prev,
      crisisNpcs: [...(prev.crisisNpcs || []), newTemplate],
    }));
    alert(`已将 "${newTemplate.name}" 保存到右侧模板库`);
  };

  const updateJudgeWeights = (field: string, value: number) => {
    const currentWeights = config.crisisConfig[activeStat].judgeWeights || { empathy: 25, rationality: 25, strategy: 25, compliance: 25 };
    updateActiveCrisisConfig({
      judgeWeights: { ...currentWeights, [field]: Math.max(0, Math.min(100, value)) }
    });
  };

  // 获取当前正在编辑的数据
  const activeCrisis = config.crisisConfig[activeStat];
  const activeWeights = activeCrisis.judgeWeights || { empathy: 25, rationality: 25, strategy: 25, compliance: 25 };
  const totalWeight = (['empathy', 'rationality', 'strategy', 'compliance'] as const)
    .map(k => activeWeights[k] || 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-1 overflow-hidden bg-paper h-screen">
      
      {/* 1. 左侧导航 (保持不变) */}
      <div className="w-64 border-r border-ink-light bg-white flex-shrink-0 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-ink mb-2">危机配置</h2>
          <p className="text-xs text-ink-medium leading-relaxed">
            请为四个关键指标分别配置对应的“危机NPC”。当指标归零时，该NPC将作为谈判对手出场。
          </p>
          <div className="mt-3 space-y-2 text-[11px] text-ink-medium leading-relaxed">
            <p className="font-bold text-ink">判分维度说明：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>共情度：是否接纳群众情绪；打官腔/大道理扣分。</li>
              <li>实际性：方案是否可落地；空头承诺、画大饼扣分。</li>
              <li>策略性：是否有止损与时间节点；诚恳且有方案加分。</li>
              <li>合规度：是否违规；私下转账、暴力威胁直接失败。</li>
            </ul>
          </div>
        </div>
        
        {/* 指标切换器：做成类似Tab的列表，清晰展示当前在编辑谁 */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-ink-medium uppercase">选择要配置的指标</label>
          {(['economy', 'people', 'environment', 'governance'] as StatKey[]).map(stat => (
            <button
              key={stat}
              onClick={() => setActiveStat(stat)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
                activeStat === stat
                  ? 'bg-primary-red text-white border-primary-red shadow-md transform scale-105'
                  : 'bg-white border-ink-light text-ink hover:bg-ink-light/10'
              }`}
            >
              <span className="font-bold">{statLabels[stat]}</span>
              {activeStat === stat && <ArrowRightCircle size={16} />}
            </button>
          ))}
        </div>

        <button onClick={onBack} className="mt-auto px-4 py-2 border border-ink text-ink rounded-md hover:bg-ink-light/10 text-sm">
          🔙 返回流程编排
        </button>
      </div>

      {/* 2. 中间：主舞台 (只显示当前选中的那一个，专注编辑) */}
      <div className="flex-1 overflow-y-auto bg-ink-light/5 p-8 flex flex-col items-center">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-paper border border-ink-light overflow-hidden flex flex-col min-h-[600px]">
          
          {/* 顶部栏：当前正在编辑谁 + 操作按钮 */}
          <div className="px-8 py-5 border-b border-ink-light bg-white sticky top-0 z-10 flex justify-between items-center">
            <div>
              <div className="text-xs text-ink-medium uppercase tracking-wider">Currently Editing</div>
              <h2 className="text-2xl font-black text-ink font-serif">{statLabels[activeStat]}</h2>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={saveAsTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-ink-light/20 text-ink rounded-lg hover:bg-ink-light/40 transition-colors text-sm font-bold"
                title="将当前NPC配置保存到右侧库"
              >
                <Save size={16} /> 存为模板
              </button>
            </div>
          </div>

          {/* 编辑区域 */}
          <div className="p-8 space-y-8 flex-1">
            
            {/* 上半部分：头像与基本信息 */}
            <div className="flex gap-8">
              {/* 头像上传 */}
              <div className="flex-shrink-0 group relative w-32 h-32 rounded-full bg-ink-light/10 cursor-pointer overflow-hidden border-4 border-white shadow-sm hover:shadow-md transition-all">
                <img
                  src={activeCrisis.npcAvatarUrl || 'https://picsum.photos/seed/npc_default/200/200'}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">更换头像</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={e => {
                     const file = e.target.files?.[0];
                     if(file) {
                       const reader = new FileReader();
                       reader.onload = () => updateActiveCrisisConfig({ npcAvatarUrl: reader.result as string });
                       reader.readAsDataURL(file);
                     }
                  }}
                />
              </div>

              {/* 姓名与身份 */}
              <div className="flex-1 space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-medium uppercase">NPC 姓名</label>
                    <input
                      value={activeCrisis.npcName || ''}
                      onChange={e => updateActiveCrisisConfig({ npcName: e.target.value })}
                      className="w-full text-xl font-bold border-b-2 border-ink-light bg-transparent focus:border-primary-red focus:outline-none px-1 py-1 transition-colors"
                      placeholder="例如：王大爷"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-ink-medium uppercase">身份 / 职业</label>
                    <input
                      value={activeCrisis.npcRole || ''}
                      onChange={e => updateActiveCrisisConfig({ npcRole: e.target.value })}
                      className="w-full text-lg border-b-2 border-ink-light bg-transparent focus:border-primary-red focus:outline-none px-1 py-1 transition-colors"
                      placeholder="例如：退休工人"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-medium uppercase">性格与冲突描述</label>
                  <textarea
                    value={activeCrisis.personality || ''}
                    onChange={e => updateActiveCrisisConfig({ personality: e.target.value })}
                    className="w-full h-24 p-3 rounded-md bg-ink-light/10 border-transparent focus:bg-white focus:border-primary-red focus:ring-0 text-sm leading-relaxed resize-none transition-all"
                    placeholder="请描述这个NPC的性格特征，以及他为什么在这个指标归零时出现？（例如：因为养老金发不出来，所以非常愤怒，性格固执，软硬不吃...）"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-ink-light/50" />

            {/* 下半部分：AI 权重配置 */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="font-bold text-ink flex items-center gap-2">
                  <span>⚖️ AI 判分权重配置</span>
                </h3>
                <span className={`text-sm font-mono font-bold ${totalWeight === 100 ? 'text-accent-green' : 'text-primary-red'}`}>
                  当前总和: {totalWeight}% {totalWeight !== 100 && '(需等于100%)'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-paper p-6 rounded-xl border border-ink-light">
                {(['empathy', 'rationality', 'strategy', 'compliance'] as const).map(key => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-ink">{judgeLabels[key]}</span>
                      <span className="text-ink-medium">{activeWeights[key]}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeWeights[key]}
                      onChange={e => updateJudgeWeights(key, parseInt(e.target.value))}
                      className="w-full h-2 bg-ink-light rounded-lg appearance-none cursor-pointer accent-primary-red"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 右侧：资源库 (仅展示，点击应用) */}
      <div className="w-72 border-l border-ink-light bg-white flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-ink-light bg-ink-light/5">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <UserPlus size={18} />
            <span>模板库</span>
          </h3>
          <p className="text-xs text-ink-medium mt-1">
            点击下方模板，将直接覆盖 <strong className="text-primary-red">{statLabels[activeStat]}</strong> 的配置。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {(config.crisisNpcs || []).length === 0 && (
            <div className="text-center py-10 text-ink-medium text-xs">
              <p>暂无模板</p>
              <p className="mt-2">请在中间配置好NPC后<br/>点击“存为模板”</p>
            </div>
          )}

          {(config.crisisNpcs || []).map((npc) => (
            <button
              key={npc.id}
              onClick={() => applyTemplate(npc)}
              className="w-full text-left p-3 rounded-lg border border-ink-light hover:border-primary-red hover:shadow-md transition-all bg-white group relative"
            >
              <div className="flex items-center gap-3">
                <img
                  src={(npc as any).avatarUrl}
                  className="w-10 h-10 rounded-full object-cover border border-ink-light"
                  alt={npc.name}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink truncate group-hover:text-primary-red transition-colors">{npc.name}</div>
                  <div className="text-xs text-ink-medium truncate">{npc.role}</div>
                </div>
              </div>
              {/* Hover时显示应用提示 */}
              <div className="absolute inset-0 bg-primary-red/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-end pr-3">
                <span className="text-xs font-bold text-primary-red bg-white px-2 py-1 rounded shadow-sm">应用</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrisisConfigPage;