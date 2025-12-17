import React, { useState, useEffect, useRef } from 'react';
import { GameConfig, StatKey, GameState } from '@/types';
import { GameEngine as CoreGameEngine } from '@/core/GameEngine';

interface GameEngineProps {
  config: GameConfig;
  onExit: () => void;
}

const StatBadge: React.FC<{ 
  label: string; 
  value: number; 
  icon: string;
  target?: number;
  isWarning?: boolean;
}> = ({ label, value, icon, target, isWarning }) => {
  const percentage = Math.max(0, Math.min(100, value));
  const hasTarget = target !== undefined;
  const isBelowTarget = hasTarget && value < target;

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-md shadow-sm transition-all
      ${isWarning || isBelowTarget ? 'bg-red-50 border-red-200' : 'bg-white/80 border border-ink-light'}
    `}>
      <span className="text-lg">{icon}</span>
      <div className="flex-1 flex flex-col leading-tight">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-medium">{label}</span>
          <span className={`text-sm font-bold ${isWarning || isBelowTarget ? 'text-red-600' : 'text-ink'}`}>
            {value}
            {hasTarget && (
              <span className="text-xs text-ink-medium ml-1">/ {target}</span>
            )}
          </span>
        </div>
        {hasTarget && (
          <div className="mt-1 h-1 bg-ink-light/20 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isBelowTarget ? 'bg-red-400' : 'bg-accent-green'}`}
              style={{ width: `${Math.min(100, (value / target) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const GameEngine: React.FC<GameEngineProps> = ({ config, onExit }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [negotiationReply, setNegotiationReply] = useState('');
  const engineRef = useRef<CoreGameEngine | null>(null);

  // 初始化游戏引擎
  useEffect(() => {
    const engine = new CoreGameEngine(config, (state) => {
      setGameState(state);
    });
    engineRef.current = engine;
    setGameState(engine.getState());

    return () => {
      engineRef.current = null;
    };
  }, [config]);

  // 处理选择
  const handleChoice = (choice: 'left' | 'right') => {
    if (!engineRef.current || !gameState) return;
    
    try {
      engineRef.current.makeChoice(choice);
    } catch (error) {
      console.error('选择失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 处理谈判提交
  const handleNegotiationSubmit = () => {
    if (!engineRef.current || !negotiationReply.trim()) return;

    const result = engineRef.current.submitNegotiationReply(negotiationReply);
    alert(result.message);
    
    if (result.success || result.nextTurn === undefined) {
      setNegotiationReply('');
    }
  };

  // 重置游戏
  const handleReset = () => {
    if (!engineRef.current) return;
    if (confirm('确定要重新开始游戏吗？当前进度将丢失。')) {
      engineRef.current.reset();
    }
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <div className="text-ink-medium">正在加载游戏...</div>
        </div>
      </div>
    );
  }

  const currentCard = engineRef.current?.getCurrentCard();
  const currentStage = engineRef.current?.getCurrentStage();
  const stats = gameState.currentStats;

  // 获取当前阶段的 KPI 目标
  const getKPI = (stat: StatKey) => {
    return currentStage?.kpi?.[stat];
  };

  // 检查是否在危机谈判状态
  const isCrisisMode = gameState.gameResult === 'crisis' && gameState.crisisStat;

  // 获取危机 NPC 信息
  const crisisNPC = isCrisisMode && gameState.crisisStat
    ? config.crisisConfig[gameState.crisisStat]
    : null;

  // 获取当前卡牌的 NPC 信息
  const currentNPC = currentCard
    ? config.storyNpcs?.find(npc => npc.id === currentCard.npcId) || 
      config.npcs?.find(npc => npc.id === currentCard.npcId)
    : null;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* 顶部状态栏 */}
      <div className="bg-white/90 backdrop-blur-sm border-b-2 border-ink-light px-4 py-3 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⛰️</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-ink">山河答卷</span>
              {currentStage && (
                <span className="text-xs text-ink-medium">{currentStage.title}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-bold text-ink-medium hover:text-ink border border-ink-light rounded-md hover:bg-ink-light/10 transition-colors"
            >
              🔄 重置
            </button>
            <button
              onClick={onExit}
              className="px-3 py-1.5 text-xs font-bold text-white bg-primary-red rounded-md hover:bg-primary-red/90 transition-colors"
            >
              退出
            </button>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatBadge 
            label="经济发展" 
            value={stats.economy} 
            icon="💰" 
            target={getKPI('economy')}
            isWarning={stats.economy <= 0}
          />
          <StatBadge 
            label="民生福祉" 
            value={stats.people} 
            icon="👥" 
            target={getKPI('people')}
            isWarning={stats.people <= 0}
          />
          <StatBadge 
            label="生态环保" 
            value={stats.environment} 
            icon="🌲" 
            target={getKPI('environment')}
            isWarning={stats.environment <= 0}
          />
          <StatBadge 
            label="乡风民俗" 
            value={stats.governance} 
            icon="🚩" 
            target={getKPI('governance')}
            isWarning={stats.governance <= 0}
          />
        </div>
      </div>

      {/* 主游戏区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {gameState.isGameOver ? (
          // 游戏结束画面
          <div className="max-w-2xl mx-auto">
            <div className={`
              bg-white rounded-xl shadow-paper-lg p-8 text-center
              ${gameState.gameResult === 'victory' ? 'border-2 border-accent-green' : 'border-2 border-primary-red'}
            `}>
              <div className="text-6xl mb-4">
                {gameState.gameResult === 'victory' ? '🎉' : '💔'}
              </div>
              <h2 className="text-2xl font-bold text-ink mb-4 font-serif">
                {gameState.gameResult === 'victory' ? '恭喜完成！' : '游戏结束'}
              </h2>
              <p className="text-ink-medium mb-6">
                {gameState.gameResult === 'victory' 
                  ? '您成功完成了所有阶段的挑战！' 
                  : '很遗憾，游戏未能完成。'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-primary-red text-white rounded-md font-bold hover:bg-primary-red/90 transition-colors"
                >
                  重新开始
                </button>
                <button
                  onClick={onExit}
                  className="px-6 py-3 bg-ink-light text-ink rounded-md font-bold hover:bg-ink-light/80 transition-colors"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        ) : isCrisisMode && crisisNPC ? (
          // 危机谈判模式
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-paper-lg p-6 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={crisisNPC.npcAvatarUrl || 'https://picsum.photos/seed/npc/200/200'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-red"
                  alt={crisisNPC.npcName}
                />
                <div>
                  <h3 className="text-lg font-bold text-ink">{crisisNPC.npcName}</h3>
                  <p className="text-sm text-ink-medium">{crisisNPC.npcRole}</p>
                </div>
              </div>
              <div className="bg-red-50 border-l-4 border-primary-red p-4 mb-4">
                <p className="text-sm text-ink leading-relaxed">
                  <strong className="text-primary-red">⚠️ 危机触发：</strong>
                  {crisisNPC.conflictReason}
                </p>
                <p className="text-xs text-ink-medium mt-2">
                  {crisisNPC.personality}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-ink mb-2">
                  您的回复（剩余 {3 - gameState.negotiationTurns} 次机会）：
                </label>
                <textarea
                  value={negotiationReply}
                  onChange={(e) => setNegotiationReply(e.target.value)}
                  className="w-full h-32 p-3 border border-ink-light rounded-md focus:outline-none focus:border-primary-red resize-none"
                  placeholder="请输入您的谈判回复..."
                />
              </div>
              <button
                onClick={handleNegotiationSubmit}
                disabled={!negotiationReply.trim()}
                className="w-full px-6 py-3 bg-primary-red text-white rounded-md font-bold hover:bg-primary-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交回复
              </button>
            </div>
          </div>
        ) : currentCard ? (
          // 正常卡牌模式
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-paper-lg overflow-hidden">
              {/* NPC 信息 */}
              {currentNPC && (
                <div className="bg-ink-light/10 px-6 py-4 border-b border-ink-light flex items-center gap-4">
                  <img
                    src={currentNPC.avatarUrl}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    alt={currentNPC.name}
                  />
                  <div>
                    <div className="font-bold text-ink">{currentCard.npcName || currentNPC.name}</div>
                    <div className="text-xs text-ink-medium">{currentCard.npcName ? currentNPC.role : currentNPC.role}</div>
                  </div>
                </div>
              )}

              {/* 卡牌内容 */}
              <div className="p-6">
                <p className="text-ink leading-relaxed mb-6 text-base whitespace-pre-wrap">
                  {currentCard.text}
                </p>

                {/* 标签 */}
                {currentCard.tags && currentCard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentCard.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-ink-light/20 text-xs text-ink-medium rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 选项按钮 */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleChoice('left')}
                    className="px-6 py-4 bg-accent-green text-white rounded-lg font-bold hover:bg-accent-green/90 transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    {currentCard.options.left.text}
                  </button>
                  <button
                    onClick={() => handleChoice('right')}
                    className="px-6 py-4 bg-primary-red text-white rounded-lg font-bold hover:bg-primary-red/90 transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    {currentCard.options.right.text}
                  </button>
                </div>

                {/* 选项影响预览 */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-ink-light/5 p-3 rounded">
                    <div className="font-bold text-ink-medium mb-1">选项A影响：</div>
                    {Object.entries(currentCard.options.left.delta).map(([key, value]) => {
                      const numValue = value as number;
                      return (
                        <div key={key} className={numValue > 0 ? 'text-accent-green' : 'text-primary-red'}>
                          {key === 'economy' && '💰'} {key === 'people' && '👥'} {key === 'environment' && '🌲'} {key === 'governance' && '🚩'}
                          {' '}{numValue > 0 ? '+' : ''}{numValue}
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-ink-light/5 p-3 rounded">
                    <div className="font-bold text-ink-medium mb-1">选项B影响：</div>
                    {Object.entries(currentCard.options.right.delta).map(([key, value]) => {
                      const numValue = value as number;
                      return (
                        <div key={key} className={numValue > 0 ? 'text-accent-green' : 'text-primary-red'}>
                          {key === 'economy' && '💰'} {key === 'people' && '👥'} {key === 'environment' && '🌲'} {key === 'governance' && '🚩'}
                          {' '}{numValue > 0 ? '+' : ''}{numValue}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 历史记录提示 */}
            {gameState.history.length > 0 && (
              <div className="mt-4 text-center text-xs text-ink-medium">
                已做出 {gameState.history.length} 个决策
              </div>
            )}
          </div>
        ) : (
          // 无卡牌状态
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-ink-medium">当前阶段暂无可用卡牌</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameEngine;

