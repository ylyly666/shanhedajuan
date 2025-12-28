/**
 * 完整的游戏循环组件 - 整合新项目的所有功能
 * 使用新项目的游戏逻辑，但适配目标项目的类型系统
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameIndicators } from './Dashboard';
import { CardDeck } from './CardDeck';
import { CrisisNegotiation } from './CrisisNegotiation';
import { GameMenu } from './GameMenu';
import { PhaseBriefing } from './PhaseBriefing';
import { GameReport } from './GameReport';
import { INITIAL_METRICS, PHASES, CARD_DATABASE, UICard, PhaseConfig } from './gameConstants';
import { MetricType, MetricDelta, metricToStatKey } from '@/utils/gameAdapter';
import { generateGameReport } from '@/services/gameGeminiService';
import { getImageByNpcId } from '@/utils/imageAssets';
import { convertGameConfigToGameFormat } from '@/utils/gameConfigConverter';

interface GameLoopEnhancedProps {
  config?: any | null; // null = 使用内部标准版，其他 = 使用用户配置
  onExit: () => void;
}

interface GameState {
  metrics: Record<MetricType, number>;
  currentPhase: number;
  stepCount: number;
  history: Array<{ cardId: string; choice: 'left' | 'right'; delta: MetricDelta }>;
  unlockedCards: string[];
  gameStatus: 'intro' | 'playing' | 'briefing' | 'crisis' | 'report' | 'gameover';
  crisisMetric: MetricType | null;
  negotiationAnger: number;
  negotiationTurn: number;
  cardQueue: string[];
}

export const GameLoopEnhanced: React.FC<GameLoopEnhancedProps> = ({ config, onExit }) => {
  // 判断使用哪个数据源：null = 内部标准版，其他 = 用户配置
  const useStandardGame = config === null;
  const userConfig = useStandardGame ? null : config;
  const [gameState, setGameState] = useState<GameState>({
    metrics: { ...INITIAL_METRICS },
    currentPhase: 0,
    stepCount: 0,
    history: [],
    unlockedCards: [],
    gameStatus: 'intro',
    crisisMetric: null,
    negotiationAnger: 0,
    negotiationTurn: 0,
    cardQueue: []
  });

  const [currentCard, setCurrentCard] = useState<UICard | null>(null);
  const [previewDelta, setPreviewDelta] = useState<Partial<Record<MetricType, number>> | null>(null);
  const [reportData, setReportData] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 转换用户配置为游戏格式（仅在非标准版时使用）
  const convertedGameData = useStandardGame 
    ? null 
    : (userConfig ? convertGameConfigToGameFormat(userConfig) : null);

  // 获取卡片数据库：标准版使用CARD_DATABASE，用户配置使用转换后的数据
  const cardDatabase = useStandardGame 
    ? CARD_DATABASE 
    : (convertedGameData?.cardDatabase || CARD_DATABASE);

  // 获取阶段配置：标准版使用PHASES，用户配置使用转换后的phases
  const phases = useStandardGame 
    ? PHASES 
    : (convertedGameData?.phases || PHASES);

  const getPhaseConfig = (phaseIndex: number): PhaseConfig => {
    if (phaseIndex >= 0 && phaseIndex < phases.length) {
      return phases[phaseIndex];
    }
    return phases[0] || PHASES[0]; // 默认第一阶段
  };

  const activePhase = getPhaseConfig(gameState.currentPhase);

  // 初始化阶段卡片队列
  useEffect(() => {
    if (gameState.gameStatus === 'intro') {
      const queue = [...activePhase.anchorCards];
      const pool = [...activePhase.randomPool];
      for (let i = 0; i < activePhase.randomCount; i++) {
        if (pool.length > 0) {
          const idx = Math.floor(Math.random() * pool.length);
          queue.push(pool.splice(idx, 1)[0]);
        }
      }
      setGameState(prev => ({ ...prev, cardQueue: queue }));
      const firstCard = cardDatabase[queue[0]];
      if (firstCard) {
        // 确保图片存在，如果不存在则使用getImageByNpcId
        const cardWithImage = {
          ...firstCard,
          image: firstCard.image || getImageByNpcId(firstCard.npcId)
        };
        setCurrentCard(cardWithImage);
      }
    }
  }, [gameState.currentPhase, gameState.gameStatus]);

  const handleSwipe = (direction: 'left' | 'right', delta: MetricDelta) => {
    if (!currentCard) return;

    const newUnlocked = [...new Set([...gameState.unlockedCards, currentCard.id])];
    const newMetrics = { ...gameState.metrics };
    let crisis: MetricType | null = null;

    (Object.keys(newMetrics) as MetricType[]).forEach(key => {
      const change = delta[key] || 0;
      newMetrics[key] = Math.max(0, Math.min(100, newMetrics[key] + change));
      if (newMetrics[key] <= 0) crisis = key;
    });

    const newHistory = [...gameState.history, { cardId: currentCard.id, choice: direction, delta }];
    const newStep = gameState.stepCount + 1;
    let newQueue = gameState.cardQueue.slice(1);

    // 处理后续卡片（如果有）
    const choice = currentCard.options[direction];
    // 注意：这里简化处理，实际应该检查followUpCardId

    setGameState(prev => ({
      ...prev,
      metrics: newMetrics,
      history: newHistory,
      stepCount: newStep,
      unlockedCards: newUnlocked,
      cardQueue: newQueue
    }));

    if (crisis) {
      setGameState(prev => ({ ...prev, metrics: newMetrics, gameStatus: 'crisis', crisisMetric: crisis }));
      return;
    }

    if (newQueue.length === 0) {
      setGameState(prev => ({ ...prev, metrics: newMetrics, gameStatus: 'briefing' }));
    } else {
      setTimeout(() => {
        const nextCard = cardDatabase[newQueue[0]];
        if (nextCard) {
          const cardWithImage = {
            ...nextCard,
            image: nextCard.image || getImageByNpcId(nextCard.npcId)
          };
          setCurrentCard(cardWithImage);
        }
      }, 50);
    }
  };

  const startReport = async (finalState: GameState) => {
    setGameState(prev => ({ ...prev, gameStatus: 'report' }));
    setLoadingReport(true);
    
    // 转换GameState为GameEngine的GameState格式（用于生成报告）
    try {
      // 这里需要适配类型，因为generateGameReport期望的是GameEngine的GameState
      // 暂时生成一个简单的报告
      const report = await generateGameReport({
        currentStats: {
          economy: finalState.metrics.economy,
          people: finalState.metrics.people,
          environment: finalState.metrics.environment,
          civility: finalState.metrics.culture // culture -> civility
        },
        currentStageIndex: finalState.currentPhase,
        cardQueue: [],
        history: [],
        isGameOver: true,
        gameResult: 'victory',
        crisisStat: null,
        negotiationTurns: 0
      });
      setReportData(report);
    } catch (error) {
      console.error('生成报告失败:', error);
      setReportData('## 报告生成失败\n\n由于系统错误，无法生成完整的游戏报告。');
    }
    setLoadingReport(false);
  };

  const handleBriefingComplete = (success: boolean) => {
    if (success) {
      if (gameState.currentPhase + 1 < PHASES.length) {
        setGameState(prev => ({ ...prev, currentPhase: prev.currentPhase + 1, gameStatus: 'intro' }));
      } else {
        startReport(gameState);
      }
    } else {
      const lowest = (Object.keys(gameState.metrics) as MetricType[]).reduce((a, b) => 
        gameState.metrics[a] < gameState.metrics[b] ? a : b
      );
      setGameState(prev => ({ ...prev, gameStatus: 'crisis', crisisMetric: lowest }));
    }
  };

  const handleCrisisResult = (success: boolean) => {
    if (success && gameState.crisisMetric) {
      const recoveredMetrics = { ...gameState.metrics, [gameState.crisisMetric]: 15 };
      setGameState(prev => ({ ...prev, metrics: recoveredMetrics, gameStatus: 'playing', crisisMetric: null }));
      if (gameState.cardQueue.length === 0) {
        setGameState(prev => ({ ...prev, metrics: recoveredMetrics, gameStatus: 'briefing' }));
      } else {
        const nextCard = cardDatabase[gameState.cardQueue[0]];
        if (nextCard) {
          const cardWithImage = {
            ...nextCard,
            image: nextCard.image || getImageByNpcId(nextCard.npcId)
          };
          setCurrentCard(cardWithImage);
        }
      }
    } else {
      startReport(gameState);
    }
  };

  // 构建卡片数据库用于GameMenu
  const buildCardDatabaseForMenu = () => {
    const db: Record<string, { npcId: string; npcName: string; image: string }> = {};
    Object.values(cardDatabase).forEach(card => {
      db[card.id] = {
        npcId: card.npcId,
        npcName: card.npcName,
        image: card.image || getImageByNpcId(card.npcId)
      };
    });
    return db;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gov-paper relative overflow-hidden">
      <AnimatePresence>
        {showMenu && (
          <GameMenu 
            onClose={() => setShowMenu(false)} 
            unlockedCards={gameState.unlockedCards}
            cardDatabase={buildCardDatabaseForMenu()}
          />
        )}
      </AnimatePresence>

      {/* Top Dashboard: 18% */}
      <GameIndicators metrics={gameState.metrics} previewDelta={previewDelta || {}} />
      
      {/* Central Stage: 70% */}
      <div className="h-[70%] w-full relative overflow-hidden bg-gov-paper">
        <AnimatePresence mode="wait">
          {gameState.gameStatus === 'playing' && currentCard && (
            <CardDeck 
              key={currentCard.id}
              card={currentCard} 
              onSwipe={handleSwipe} 
              onPreview={setPreviewDelta} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar: 12% */}
      <div className="h-[12%] bg-gov-gray text-gov-paper flex items-center justify-between px-6 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] border-t border-white/5">
        <div className="flex flex-col items-start min-w-[80px]">
           <span className="font-song text-lg font-bold text-white tracking-wider leading-none mb-1">马得福</span>
           <span className="font-typewriter text-lg text-white/40">{gameState.stepCount} 步</span>
        </div>
        <div className="flex-1 flex justify-center px-4 text-center">
           <span className="font-song text-[10px] opacity-50 leading-tight line-clamp-2 uppercase tracking-widest">
             {activePhase.title.split('：')[1] || activePhase.title}
           </span>
        </div>
        <div className="flex items-center justify-end min-w-[80px]">
          <button 
            onClick={() => setShowMenu(true)} 
            className="p-2 border border-white/20 rounded-xl active:bg-white/20 hover:bg-white/10 transition-all"
            title="菜单"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Global Overlays: Fixed Inset 0 */}
      <AnimatePresence>
        {/* 阶段介绍界面 - 全屏覆盖 */}
        {gameState.gameStatus === 'intro' && (
          <motion.div 
            key="intro-screen"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-gov-paper p-8 flex flex-col items-center justify-center text-center"
          >
            <div className="absolute inset-0 cloud-pattern opacity-10 pointer-events-none" />
            <div className="z-10 w-full space-y-6 max-w-md">
              <h1 className="text-2xl font-song font-bold text-gov-gray border-b-2 border-gov-gray/20 pb-4">{activePhase.title}</h1>
              <p className="font-fangsong text-lg leading-relaxed text-justify opacity-80">{activePhase.description}</p>
              <div className="bg-gov-gray/5 p-5 rounded-xl border border-gov-gray/10 w-full">
                <h3 className="font-song font-bold mb-3 text-sm opacity-60">本阶段考核目标 (KPI)</h3>
                {Object.entries(activePhase.kpi).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1 border-b border-gov-gray/5 last:border-0">
                    <span className="font-song text-sm">{{economy:'经济', people:'民生', environment:'生态', culture:'乡风'}[k]}</span>
                    <span className="font-typewriter text-lg">&gt; {v}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'playing' }))}
                className="bg-gov-gray text-gov-paper px-10 py-3 rounded-full font-song text-lg shadow-xl active:scale-95 transition-transform"
              >
                开始任期
              </button>
            </div>
          </motion.div>
        )}

        {/* 阶段政务考核界面 - 全屏覆盖 */}
        {gameState.gameStatus === 'briefing' && (
          <PhaseBriefing 
            key="briefing-screen"
            metrics={gameState.metrics} 
            kpi={activePhase.kpi} 
            onComplete={handleBriefingComplete} 
          />
        )}

        {gameState.gameStatus === 'crisis' && gameState.crisisMetric && (
          <CrisisNegotiation 
            key="crisis-overlay"
            metric={metricToStatKey(gameState.crisisMetric)} // 转换为StatKey
            onResult={handleCrisisResult} 
          />
        )}

        {gameState.gameStatus === 'report' && (
          <GameReport 
            key="report-overlay"
            report={reportData} 
            loading={loadingReport} 
            metrics={gameState.metrics}
            onRestart={onExit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
