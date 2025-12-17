import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, PanInfo } from 'framer-motion';
import { Card, GameConfig, GameStats, StatKey, CardOption } from '../types';
import { evaluateNegotiation, generateGameReport } from '../aiService';

interface GameEngineProps {
  config: GameConfig;
  onExit: () => void;
}

// 镂空图标组件（填充高度代表数值）
const StatIcon: React.FC<{ 
  statKey: StatKey; 
  value: number; 
  isAffected?: boolean; // 是否被当前拖动影响
}> = ({ statKey, value, isAffected }) => {
  const percentage = Math.max(0, Math.min(100, value));
  const fillHeight = `${percentage}%`;
  
  const iconConfig = {
    economy: { label: '经济', icon: '💰', color: '#B94047' },
    people: { label: '民生', icon: '👥', color: '#567C73' },
    environment: { label: '生态', icon: '🌲', color: '#567C73' },
    governance: { label: '乡风', icon: '🚩', color: '#B94047' },
  };
  
  const config = iconConfig[statKey];
  
  return (
    <div className="relative flex flex-col items-center">
      {/* 影响圆点提示 */}
      {isAffected && (
        <motion.div
          className="absolute -top-2 w-2 h-2 rounded-full bg-primary-red z-10"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* 镂空图标容器 */}
      <div className="relative w-16 h-16 border-2 border-ink rounded-md overflow-hidden bg-paper">
        {/* 填充部分 */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: fillHeight,
            backgroundColor: config.color,
            opacity: 0.6,
          }}
          initial={{ height: '0%' }}
          animate={{ height: fillHeight }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* 图标（始终显示，在填充上方） */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl z-10">
          {config.icon}
        </div>
      </div>
      
      {/* 标签 */}
      <div className="text-xs text-ink-medium mt-1 font-serif">{config.label}</div>
    </div>
  );
};

// 任期显示组件
const TermDisplay: React.FC<{ year: number; season: number }> = ({ year, season }) => {
  const seasons = ['春', '夏', '秋', '冬'];
  const seasonName = seasons[season % 4];
  
  return (
    <div className="text-center text-ink-medium font-serif">
      任期：第{year}年·{seasonName}
    </div>
  );
};

const GameEngine: React.FC<GameEngineProps> = ({ config, onExit }) => {
  // --- State ---
  const [stats, setStats] = useState<GameStats>({ economy: 50, people: 50, environment: 50, governance: 50 });
  const [deck, setDeck] = useState<Card[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [warnings, setWarnings] = useState(0);
  
  // 任期状态
  const [year, setYear] = useState(1);
  const [season, setSeason] = useState(0); // 0=春, 1=夏, 2=秋, 3=冬
  
  // Crisis State
  const [crisisMode, setCrisisMode] = useState<{ active: boolean; stat: StatKey | null; turns: number; log: any[]; dailyChances: number }>({
    active: false, stat: null, turns: 0, log: [], dailyChances: 3
  });
  const [negotiationLoading, setNegotiationLoading] = useState(false);
  const [negotiationInput, setNegotiationInput] = useState('');

  // Report State
  const [gameOver, setGameOver] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // 卡牌动画状态
  const [isDealing, setIsDealing] = useState(false); // 是否正在发牌
  const [isFlipping, setIsFlipping] = useState(false); // 是否正在翻面
  const [cardFlipped, setCardFlipped] = useState(false); // 当前卡牌是否已翻面
  const [affectedStats, setAffectedStats] = useState<StatKey[]>([]); // 当前拖动影响的数值
  const [showTutorial, setShowTutorial] = useState(true); // 是否显示操作提示
  const [tutorialStep, setTutorialStep] = useState(0); // 提示步骤（0=左滑，1=右滑，2=完成）
  
  // 拖动状态
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);
  const scale = useSpring(useTransform(x, [-300, 0, 300], [0.8, 1, 0.8]), { stiffness: 300, damping: 30 });

  // Init
  useEffect(() => {
    console.log('GameEngine: Initializing with config', config);
    
    if (!config || !config.stages || config.stages.length === 0) {
      console.error('GameEngine: No stages found in config', config);
      setCurrentCard(null);
      return;
    }
    
    const firstStage = config.stages[0];
    console.log('GameEngine: First stage', firstStage);
    
    if (!firstStage.cards || firstStage.cards.length === 0) {
      console.error('GameEngine: No cards found in first stage', firstStage);
      setCurrentCard(null);
      return;
    }
    
    const initialCards = firstStage.cards.filter(c => 'id' in c) as Card[];
    console.log('GameEngine: Filtered cards', initialCards);
    
    if (initialCards.length === 0) {
      console.error('GameEngine: No valid cards found after filtering', firstStage.cards);
      setCurrentCard(null);
      return;
    }
    
    setDeck(initialCards);
    setCurrentCardIndex(0);
    setCurrentCard(initialCards[0]);
    console.log('GameEngine: Set current card', initialCards[0]);
    
    // 开局发牌动画
    setIsDealing(true);
    setTimeout(() => {
      setIsDealing(false);
      // 发牌完成后，开始翻面动画
      setTimeout(() => {
        setIsFlipping(true);
        setTimeout(() => {
          setIsFlipping(false);
          setCardFlipped(true);
          
          // 翻面完成后，开始操作提示动画
          setTimeout(() => {
            startTutorial();
          }, 500);
        }, 500); // 翻面动画时长
      }, 300);
    }, 800); // 发牌动画时长
  }, [config]);

  // 操作提示动画（修复：不在函数内部调用 hooks，使用 animate 函数）
  const startTutorial = () => {
    // 第一步：模拟左滑
    setTutorialStep(0);
    
    setTimeout(() => {
      // 使用 animate 函数实现动画（而不是 useSpring hook）
      const animateTo = (target: number, duration: number = 500): Promise<void> => {
        return new Promise((resolve) => {
          const start = x.get();
          const distance = target - start;
          const startTime = Date.now();
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // 使用 easeOut 缓动函数
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + distance * eased;
            x.set(current);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          
          requestAnimationFrame(animate);
        });
      };
      
      // 左滑动画
      animateTo(-150, 500).then(() => {
        // 回位
        return animateTo(0, 500);
      }).then(() => {
        // 第二步：模拟右滑
        setTutorialStep(1);
        return animateTo(150, 500);
      }).then(() => {
        // 回位
        return animateTo(0, 500);
      }).then(() => {
        // 完成提示
        setTutorialStep(2);
        setTimeout(() => {
          setShowTutorial(false);
        }, 2000);
      });
    }, 1000);
  };

  // 重置拖动状态
  useEffect(() => {
    x.set(0);
    setAffectedStats([]);
  }, [currentCardIndex, x]);

  // 获取当前卡牌（使用 state 中的 currentCard，确保与 deck 同步）
  const npc = currentCard ? (config.storyNpcs || config.npcs || []).find((n: any) => n.id === currentCard.npcId) : null;

  // --- Core Mechanics ---
  const handleChoice = (direction: 'left' | 'right') => {
    if (!currentCard) return;

    const option = currentCard.options[direction];
    const newStats = { ...stats };
    let triggeredCrisisStat: StatKey | null = null;

    (Object.keys(newStats) as StatKey[]).forEach(key => {
      if (option.delta[key]) {
        newStats[key] = Math.min(100, Math.max(0, newStats[key] + (option.delta[key] || 0)));
        if (newStats[key] <= 0) triggeredCrisisStat = key;
      }
    });

    setStats(newStats);
    setHistory([...history, { cardId: currentCard.id, decision: direction, statsBefore: stats }]);

    // 更新任期（每3张卡牌一个季度）
    const totalCards = history.length + 1;
    const newSeason = Math.floor(totalCards / 3) % 4;
    const newYear = Math.floor(totalCards / 12) + 1;
    setSeason(newSeason);
    setYear(newYear);

    if (triggeredCrisisStat) {
      triggerCrisis(triggeredCrisisStat);
      return;
    }

    // 下一张卡牌
    advanceToNextCard(option.followUpCardId);
  };

  const advanceToNextCard = (injectCardId?: string) => {
    // 当前卡牌消失动画
    setTimeout(() => {
      // 如果有后续卡牌需要插入，先插入到deck中
      if (injectCardId) {
        const followUpCard = config.stages[currentStageIndex].cards.find(
          (c) => 'id' in c && c.id === injectCardId
        ) as Card | undefined;
        
        if (followUpCard) {
          // 在当前卡牌后插入后续卡牌
          const newDeck = [...deck];
          const insertIndex = currentCardIndex + 1;
          newDeck.splice(insertIndex, 0, followUpCard);
          setDeck(newDeck);
          
          // 显示后续卡牌
          setCardFlipped(false);
          setIsFlipping(true);
          setCurrentCardIndex(insertIndex);
          setCurrentCard(followUpCard);
          
          setTimeout(() => {
            setIsFlipping(false);
            setCardFlipped(true);
          }, 500);
          return;
        }
      }
      
      // 正常推进到下一张卡牌
      if (currentCardIndex < deck.length - 1) {
        // 下一张卡牌翻面
        const nextIndex = currentCardIndex + 1;
        setCardFlipped(false);
        setIsFlipping(true);
        setCurrentCardIndex(nextIndex);
        setCurrentCard(deck[nextIndex]);
        
        setTimeout(() => {
          setIsFlipping(false);
          setCardFlipped(true);
        }, 500);
      } else {
        // 阶段完成
        checkStageKPI();
      }
    }, 300);
  };

  const checkStageKPI = () => {
    const stage = config.stages[currentStageIndex];
    const failed = Object.entries(stage.kpi || {}).some(([key, threshold]) => stats[key as StatKey] < threshold);
    
    if (failed) {
      setWarnings(prev => prev + 1);
      if (warnings + 1 >= 3) {
        setGameOver(true);
        generateFinalReport();
        return;
      }
    }
    
    // 进入下一阶段
    if (currentStageIndex < config.stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
      const nextStageCards = config.stages[currentStageIndex + 1].cards.filter(c => 'id' in c) as Card[];
      setDeck(nextStageCards);
      setCurrentCardIndex(0);
      if (nextStageCards.length > 0) {
        setCurrentCard(nextStageCards[0]);
      }
      setCardFlipped(false);
      
      // 新阶段发牌动画
      setIsDealing(true);
      setTimeout(() => {
        setIsDealing(false);
        setTimeout(() => {
          setIsFlipping(true);
          setTimeout(() => {
            setIsFlipping(false);
            setCardFlipped(true);
          }, 500);
        }, 300);
      }, 800);
    } else {
      finishGame();
    }
  };

  const triggerCrisis = (stat: StatKey) => {
    if (crisisMode.dailyChances <= 0) {
      setGameOver(true);
      generateFinalReport();
      return;
    }
    setCrisisMode({
      active: true,
      stat,
      turns: 3,
      log: [{ role: 'npc', text: config.crisisConfig[stat]?.personality || '发生紧急情况！' }],
      dailyChances: crisisMode.dailyChances - 1,
    });
  };

  const handleNegotiationSubmit = async (text: string) => {
    if (!text.trim() || negotiationLoading || !crisisMode.stat) return;

    setNegotiationLoading(true);
    const newLog = [...crisisMode.log, { role: 'user', text }];
    setCrisisMode(prev => ({ ...prev, log: newLog }));

    const result = await evaluateNegotiation(
      newLog,
      config.crisisConfig[crisisMode.stat]?.personality || '',
      crisisMode.stat,
      config.crisisConfig[crisisMode.stat]?.judgeWeights
    );

    setCrisisMode(prev => ({ ...prev, log: [...prev.log, { role: 'npc', text: result.npcResponse }] }));

    if (result.success) {
      const newStats = { ...stats };
      newStats[crisisMode.stat] = 10;
      setStats(newStats);
      setTimeout(() => {
        setCrisisMode({ active: false, stat: null, turns: 0, log: [], dailyChances: crisisMode.dailyChances });
        advanceToNextCard();
      }, 1500);
    } else if (crisisMode.turns <= 1) {
      setGameOver(true);
      generateFinalReport();
    } else {
      if (text !== "(Start Negotiation)") {
        setCrisisMode(prev => ({ ...prev, turns: prev.turns - 1 }));
      }
    }

    setNegotiationInput('');
    setNegotiationLoading(false);
  };

  const finishGame = () => {
    setGameOver(true);
    generateFinalReport();
  };

  const generateFinalReport = async () => {
    setGeneratingReport(true);
    const report = await generateGameReport(stats, history);
    setReportMarkdown(report);
    setGeneratingReport(false);
  };

  // 处理拖动
  const handleDrag = (_: any, info: PanInfo) => {
    const direction = info.offset.x > 0 ? 'right' : 'left';
    const option = currentCard?.options[direction];
    
    // 计算受影响的数值
    if (option) {
      const affected: StatKey[] = [];
      (Object.keys(option.delta) as StatKey[]).forEach(key => {
        if (option.delta[key] !== undefined && option.delta[key] !== 0) {
          affected.push(key);
        }
      });
      setAffectedStats(affected);
    }
  };

  // 处理拖动结束
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      handleChoice(direction);
    } else {
      x.set(0);
      setAffectedStats([]);
    }
  };

  // --- Renders ---
  if (gameOver) {
    return (
      <div className="h-full overflow-y-auto bg-paper p-6 flex flex-col items-center">
        <h1 className="text-3xl font-serif text-ink mb-6 font-bold border-b-2 border-primary-red pb-2">乡村振兴治理报告</h1>
        
        {generatingReport ? (
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary-red border-t-transparent rounded-full animate-spin"></div>
            <p className="text-ink-medium">正在生成您的执政复盘报告...</p>
          </div>
        ) : (
          <div className="prose prose-ink w-full max-w-2xl bg-white/80 backdrop-blur-md p-8 shadow-paper-lg rounded-md border border-ink-light glass">
            <div className="mb-6 grid grid-cols-2 gap-4 text-center">
              {Object.entries(stats).map(([k, v]) => (
                <div key={k} className="bg-paper p-3 rounded-md border border-ink-light">
                  <div className="text-xs uppercase text-ink-medium font-serif">{k}</div>
                  <div className={`text-xl font-bold ${v <= 0 ? 'text-primary-red' : 'text-ink'}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="whitespace-pre-wrap font-serif text-ink leading-relaxed">
              {reportMarkdown}
            </div>
            <button onClick={onExit} className="mt-8 w-full bg-primary-red text-white py-3 hover:bg-[#A0353C] transition font-bold rounded-md shadow-paper">
              返回首页
            </button>
          </div>
        )}
      </div>
    );
  }

  if (crisisMode.active) {
    const npc = config.npcs.find(n => n.id === config.crisisConfig[crisisMode.stat!]?.npcId);
    return (
      <div className="h-full bg-gradient-to-br from-primary-red/20 to-primary-red/10 flex flex-col p-4 relative overflow-hidden">
        <div className="mountain-bg opacity-20"></div>
        
        <div className="z-10 text-center mb-4">
          <h2 className="text-primary-red font-bold tracking-widest animate-pulse font-serif">⚠️ 紧急危机 ⚠️</h2>
          <p className="text-ink-medium text-sm mt-1">
            {crisisMode.stat === 'economy' && '💰 经济发展'}
            {crisisMode.stat === 'people' && '👥 民生福祉'}
            {crisisMode.stat === 'environment' && '🌲 生态环境'}
            {crisisMode.stat === 'governance' && '🚩 乡风民俗'}
            指标归零引发群体事件
          </p>
          <p className="text-primary-red text-xs mt-1">剩余谈判机会: {crisisMode.turns}/3 | 今日剩余次数: {crisisMode.dailyChances}/3</p>
        </div>

        <div className="z-10 flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-primary-red overflow-hidden shadow-paper-lg">
            <img src={npc?.avatarUrl} className="w-full h-full object-cover" alt="NPC" />
          </div>
          <div className="mt-2 bg-ink/80 backdrop-blur-sm px-4 py-1 rounded-md text-white font-bold">{npc?.name} ({npc?.role})</div>
        </div>

        <div className="z-10 flex-1 bg-white/20 backdrop-blur-md rounded-md p-4 overflow-y-auto mb-4 border border-ink-light glass">
          {crisisMode.log.filter(m => m.text !== "(Start Negotiation)").map((msg, idx) => (
            <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-2 rounded-md text-sm max-w-[85%] ${
                msg.role === 'user' 
                ? 'bg-primary-red text-white rounded-tr-none' 
                : 'bg-white/60 text-ink rounded-tl-none'
              }`}>
                {msg.text}
              </span>
            </div>
          ))}
          {negotiationLoading && <div className="text-ink-medium text-xs animate-pulse">对方正在输入...</div>}
        </div>

        <div className="z-10 flex gap-2">
          <input 
            value={negotiationInput}
            onChange={(e) => setNegotiationInput(e.target.value)}
            placeholder="输入回应 (注意安抚情绪与合规)..."
            className="flex-1 bg-white/40 backdrop-blur-sm border-b-2 border-ink-light rounded-md px-3 py-2 text-ink placeholder-ink-medium focus:outline-none focus:border-primary-red"
            onKeyDown={(e) => e.key === 'Enter' && !negotiationLoading && handleNegotiationSubmit(negotiationInput)}
          />
          <button 
            onClick={() => handleNegotiationSubmit(negotiationInput)}
            disabled={negotiationLoading || !negotiationInput.trim()}
            className="bg-primary-red hover:bg-[#A0353C] text-white px-4 rounded-md font-bold disabled:opacity-50 shadow-paper"
          >
            发送
          </button>
        </div>
      </div>
    );
  }

  // --- Main Card Game UI ---
  
  // 如果没有卡牌，显示提示
  if (!currentCard || deck.length === 0) {
    return (
      <div className="h-full bg-paper flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-serif font-bold text-ink mb-2">暂无卡牌</h2>
          <p className="text-ink-medium mb-6">
            {config.stages && config.stages.length === 0 
              ? '请在创作者工坊中添加阶段和卡牌'
              : '当前阶段没有可用的卡牌'}
          </p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-primary-red text-white rounded-md hover:bg-[#A0353C] transition font-bold shadow-paper"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-paper flex flex-col relative overflow-hidden">
      {/* 水墨山水背景 */}
      <div className="mountain-bg"></div>

      {/* Top Bar: Stats */}
      <div className="glass shadow-paper p-4 z-10 flex justify-center items-center gap-8 border-b border-ink-light">
        <StatIcon statKey="economy" value={stats.economy} isAffected={affectedStats.includes('economy')} />
        <StatIcon statKey="people" value={stats.people} isAffected={affectedStats.includes('people')} />
        <StatIcon statKey="environment" value={stats.environment} isAffected={affectedStats.includes('environment')} />
        <StatIcon statKey="governance" value={stats.governance} isAffected={affectedStats.includes('governance')} />
        
        {/* 退出按钮 */}
        <button
          onClick={onExit}
          className="ml-auto px-4 py-2 bg-ink-light hover:bg-ink-medium text-ink rounded-md transition-all font-bold text-sm shadow-paper"
        >
          ✕ 退出
        </button>
      </div>

      {/* Main Stage: Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* 牌堆（静置在左侧） */}
        {deck.length > currentCardIndex + 1 && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 z-0">
            <div className="w-32 h-48 bg-ink/20 rounded-md border-2 border-ink-light shadow-paper-lg transform rotate-12"></div>
            <div className="w-32 h-48 bg-ink/30 rounded-md border-2 border-ink-light shadow-paper-lg transform -rotate-6 -mt-44"></div>
            <div className="w-32 h-48 bg-ink/40 rounded-md border-2 border-ink-light shadow-paper-lg transform rotate-3 -mt-44"></div>
          </div>
        )}

        {/* 当前卡牌 */}
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="w-full max-w-sm bg-white rounded-md shadow-paper-lg overflow-hidden border border-ink-light flex flex-col h-[70vh] touch-none select-none cursor-grab active:cursor-grabbing relative"
              initial={isDealing ? { x: -500, opacity: 0 } : isFlipping ? { rotateY: 180, opacity: 0 } : { opacity: 0, y: 50 }}
              animate={isDealing ? { x: 0, opacity: 1 } : isFlipping ? { rotateY: 0, opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ x: Math.abs(x.get()) > 0 ? (x.get() > 0 ? 500 : -500) : 0, opacity: 0, rotate: x.get() > 0 ? 30 : -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ 
                x, rotate, opacity, scale,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* 拖动时显示的选项文本 - 整个顶部统一背景，根据拖动方向显示对应选项 */}
              {(() => {
                const dragX = x.get();
                const absDragX = Math.abs(dragX);
                
                if (absDragX > 30) {
                  return (
                    <motion.div
                      className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-ink/90 backdrop-blur-sm border-b border-ink-light"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {dragX < 0 ? (
                        // 左滑：显示左选项，整个顶部区域，文字靠右对齐
                        <div className="text-sm font-bold text-white text-right font-serif">
                          {currentCard.options.left.text}
                        </div>
                      ) : (
                        // 右滑：显示右选项，整个顶部区域，文字靠左对齐
                        <div className="text-sm font-bold text-white text-left font-serif">
                          {currentCard.options.right.text}
                        </div>
                      )}
                    </motion.div>
                  );
                }
                return null;
              })()}

              {/* 操作提示 - 不遮挡卡牌，在卡牌外部显示 */}
              {showTutorial && cardFlipped && (
                <motion.div
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-30"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-white/95 rounded-md p-4 shadow-paper-lg border border-ink-light text-center min-w-[200px]">
                    {tutorialStep === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="text-3xl mb-2">👈</div>
                        <div className="text-ink font-bold text-sm font-serif">向左滑动查看选项</div>
                      </motion.div>
                    )}
                    {tutorialStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="text-3xl mb-2">👉</div>
                        <div className="text-ink font-bold text-sm font-serif">向右滑动查看选项</div>
                      </motion.div>
                    )}
                    {tutorialStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="text-3xl mb-2">✨</div>
                        <div className="text-ink font-bold text-sm font-serif">拖动到边缘确认选择</div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 卡牌内容 */}
              {cardFlipped ? (
                <>
                  {/* 人物肖像（上方） */}
                  <div className="h-64 bg-gradient-to-br from-ink-light to-ink-medium relative overflow-hidden flex items-center justify-center">
                    <img 
                      src={npc?.avatarUrl} 
                      className="w-full h-full object-cover opacity-90" 
                      alt={npc?.name}
                      style={{ filter: 'grayscale(20%) contrast(1.1)' }} // 简约绘画风格
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent"></div>
                    
                    {/* 名字/职业（叠加在肖像下方） */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/80 to-transparent text-center">
                      <div className="text-white font-bold text-lg font-serif drop-shadow-lg">{npc?.name || currentCard.npcName}</div>
                      <div className="text-white/90 text-sm mt-1 drop-shadow-md">{npc?.role}</div>
                    </div>
                  </div>

                  {/* 剧情文本（下方） */}
                  <div className="flex-1 p-6 flex items-center justify-center bg-white relative overflow-y-auto">
                    <div className="text-ink text-base leading-relaxed font-serif text-center">
                      {currentCard.text}
                    </div>
                  </div>
                </>
              ) : (
                // 卡牌背面（翻面前）
                <div className="h-full bg-ink flex items-center justify-center">
                  <div className="text-white text-4xl">⛰️</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: Term Display */}
      <div className="glass border-t border-ink-light p-4 z-10">
        <TermDisplay year={year} season={season} />
      </div>
    </div>
  );
};

export default GameEngine;
