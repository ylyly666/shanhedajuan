import { GameConfig, GameState, GameStats, StatKey } from '@/types';
import { Card, RandomPool, Stage } from '@/types/card';
import { INITIAL_STATS } from '@/constants';

/**
 * 核心游戏引擎 - 纯逻辑层，无 UI 依赖
 * 可同时用于网页版和小程序版
 */
export class GameEngine {
  private config: GameConfig;
  private state: GameState;
  private onStateChange?: (state: GameState) => void;

  constructor(config: GameConfig, onStateChange?: (state: GameState) => void) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.state = this.initializeGame();
  }

  /**
   * 初始化游戏状态
   */
  private initializeGame(): GameState {
    const firstStage = this.config.stages[0];
    if (!firstStage) {
      throw new Error('配置中至少需要一个阶段');
    }

    // 构建初始卡牌队列（第一阶段的顶层卡牌）
    const cardQueue = this.buildInitialCardQueue(firstStage);

    return {
      currentStats: { ...INITIAL_STATS },
      currentStageIndex: 0,
      cardQueue,
      history: [],
      isGameOver: false,
      gameResult: 'ongoing',
      crisisStat: null,
      negotiationTurns: 0,
    };
  }

  /**
   * 构建初始卡牌队列（只包含第一层的卡牌，不包括后续卡）
   */
  private buildInitialCardQueue(stage: Stage): Card[] {
    const queue: Card[] = [];
    
    for (const item of stage.cards) {
      if ('type' in item && item.type === 'random_pool') {
        // 随机池：从库中抽取指定数量的事件
        const randomCards = this.drawRandomCards(item);
        queue.push(...randomCards);
      } else if ('id' in item && 'options' in item) {
        // 普通卡牌：只添加第一层
        queue.push(item as Card);
      }
    }

    return queue;
  }

  /**
   * 从随机池抽取卡牌
   */
  private drawRandomCards(pool: RandomPool): Card[] {
    const library = this.config.randomEventLibrary || [];
    const count = pool.count || 1;
    const selected: Card[] = [];

    // 如果指定了 entries，只从这些 ID 中选择
    const availableCards = pool.entries && pool.entries.length > 0
      ? library.filter(card => pool.entries!.includes(card.id))
      : library;

    if (availableCards.length === 0) {
      return [];
    }

    // 随机抽取（不重复）
    const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      selected.push(shuffled[i]);
    }

    return selected;
  }

  /**
   * 获取当前游戏状态
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * 获取当前卡牌
   */
  getCurrentCard(): Card | null {
    return this.state.cardQueue.length > 0 ? this.state.cardQueue[0] : null;
  }

  /**
   * 获取当前阶段
   */
  getCurrentStage(): Stage {
    return this.config.stages[this.state.currentStageIndex];
  }

  /**
   * 做出选择（左或右）
   */
  makeChoice(choice: 'left' | 'right'): void {
    const currentCard = this.getCurrentCard();
    if (!currentCard) {
      throw new Error('没有可用的卡牌');
    }

    const option = currentCard.options[choice];
    const statsBefore = { ...this.state.currentStats };

    // 更新统计数据
    this.applyDelta(option.delta);

    // 记录历史
    this.state.history.push({
      cardId: currentCard.id,
      decision: choice,
      statsBefore,
    });

    // 移除当前卡牌
    this.state.cardQueue.shift();

    // 如果有后续卡，插入到队列前面
    if (option.followUpCardId) {
      const followUpCard = this.findCardById(option.followUpCardId);
      if (followUpCard) {
        this.state.cardQueue.unshift(followUpCard);
      }
    }

    // 检查是否需要添加新卡牌（从当前阶段）
    this.processStageCards();

    // 检查游戏结束条件
    this.checkGameOver();

    // 通知状态变化
    this.notifyStateChange();
  }

  /**
   * 应用统计数据变化
   */
  private applyDelta(delta: Partial<GameStats>): void {
    for (const key in delta) {
      const statKey = key as StatKey;
      const change = delta[statKey] || 0;
      this.state.currentStats[statKey] = Math.max(
        0,
        Math.min(100, this.state.currentStats[statKey] + change)
      );
    }
  }

  /**
   * 根据 ID 查找卡牌
   */
  private findCardById(cardId: string): Card | null {
    for (const stage of this.config.stages) {
      for (const item of stage.cards) {
        if ('id' in item && item.id === cardId && 'options' in item) {
          return item as Card;
        }
      }
    }
    return null;
  }

  /**
   * 处理阶段卡牌（当队列为空时，从当前阶段继续抽取）
   */
  private processStageCards(): void {
    if (this.state.cardQueue.length > 0) {
      return; // 队列还有卡牌，不需要处理
    }

    const currentStage = this.getCurrentStage();
    const remainingCards = this.getRemainingStageCards(currentStage);

    if (remainingCards.length > 0) {
      // 还有未处理的卡牌，继续游戏
      this.state.cardQueue.push(...remainingCards);
    } else {
      // 当前阶段完成，检查是否可以进入下一阶段
      this.advanceToNextStage();
    }
  }

  /**
   * 获取阶段中剩余的卡牌（排除已处理的）
   */
  private getRemainingStageCards(stage: Stage): Card[] {
    const processedCardIds = new Set(this.state.history.map(h => h.cardId));
    const remaining: Card[] = [];

    for (const item of stage.cards) {
      if ('type' in item && item.type === 'random_pool') {
        // 随机池：如果还没处理过，抽取新卡
        const poolId = `pool_${item.id}`;
        if (!processedCardIds.has(poolId)) {
          const randomCards = this.drawRandomCards(item);
          remaining.push(...randomCards);
          processedCardIds.add(poolId);
        }
      } else if ('id' in item && 'options' in item) {
        const card = item as Card;
        // 只添加第一层卡牌（没有父卡牌的）
        if (!this.isFollowUpCard(card.id, stage)) {
          if (!processedCardIds.has(card.id)) {
            remaining.push(card);
          }
        }
      }
    }

    return remaining;
  }

  /**
   * 判断是否是后续卡
   */
  private isFollowUpCard(cardId: string, stage: Stage): boolean {
    for (const item of stage.cards) {
      if ('options' in item) {
        const card = item as Card;
        if (
          card.options.left.followUpCardId === cardId ||
          card.options.right.followUpCardId === cardId
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 进入下一阶段
   */
  private advanceToNextStage(): void {
    const currentStage = this.getCurrentStage();
    
    // 检查当前阶段 KPI
    const kpiResult = this.checkStageKPI(currentStage);
    
    if (!kpiResult.passed) {
      // KPI 未达标，触发危机
      this.triggerCrisis(kpiResult.failedStat);
      return;
    }

    // 进入下一阶段
    if (this.state.currentStageIndex < this.config.stages.length - 1) {
      this.state.currentStageIndex++;
      const nextStage = this.getCurrentStage();
      this.state.cardQueue = this.buildInitialCardQueue(nextStage);
    } else {
      // 所有阶段完成，游戏胜利
      this.state.isGameOver = true;
      this.state.gameResult = 'victory';
    }

    this.notifyStateChange();
  }

  /**
   * 检查阶段 KPI
   */
  private checkStageKPI(stage: Stage): { passed: boolean; failedStat?: StatKey } {
    if (!stage.kpi || !stage.kpiEnabled) {
      return { passed: true };
    }

    for (const key in stage.kpiEnabled) {
      const statKey = key as StatKey;
      if (stage.kpiEnabled[statKey] && stage.kpi[statKey] !== undefined) {
        const target = stage.kpi[statKey]!;
        const current = this.state.currentStats[statKey];
        if (current < target) {
          return { passed: false, failedStat: statKey };
        }
      }
    }

    return { passed: true };
  }

  /**
   * 触发危机
   */
  private triggerCrisis(stat: StatKey): void {
    this.state.isGameOver = false; // 危机不是游戏结束，而是进入谈判
    this.state.gameResult = 'crisis';
    this.state.crisisStat = stat;
    this.state.negotiationTurns = 0;
    this.notifyStateChange();
  }

  /**
   * 检查游戏结束条件
   */
  private checkGameOver(): void {
    // 检查是否有指标归零
    for (const key in this.state.currentStats) {
      const statKey = key as StatKey;
      if (this.state.currentStats[statKey] <= 0) {
        this.state.isGameOver = true;
        this.state.gameResult = 'failure';
        this.state.crisisStat = statKey;
        this.triggerCrisis(statKey);
        return;
      }
    }
  }

  /**
   * 提交谈判回复（危机谈判）
   */
  submitNegotiationReply(reply: string): { success: boolean; message: string; nextTurn?: number } {
    if (this.state.gameResult !== 'crisis' || !this.state.crisisStat) {
      throw new Error('当前不在危机谈判状态');
    }

    if (this.state.negotiationTurns >= 3) {
      return { success: false, message: '谈判回合已用完，游戏失败' };
    }

    this.state.negotiationTurns++;

    // TODO: 这里应该调用 AI 评估逻辑
    // 暂时使用简单规则：如果回复长度足够，有一定概率成功
    const crisisConfig = this.config.crisisConfig[this.state.crisisStat];
    const success = this.evaluateNegotiation(reply, crisisConfig);

    if (success) {
      // 谈判成功，恢复部分指标并继续游戏
      this.state.currentStats[this.state.crisisStat] = 30; // 恢复到 30
      this.state.gameResult = 'ongoing';
      this.state.crisisStat = null;
      this.state.negotiationTurns = 0;
      
      // 继续处理阶段
      this.processStageCards();
      
      return { success: true, message: '谈判成功！指标已恢复，继续游戏' };
    } else if (this.state.negotiationTurns >= 3) {
      // 三次都失败，游戏结束
      this.state.isGameOver = true;
      this.state.gameResult = 'failure';
      return { success: false, message: '谈判失败，游戏结束' };
    } else {
      return {
        success: false,
        message: `谈判未成功，还有 ${3 - this.state.negotiationTurns} 次机会`,
        nextTurn: this.state.negotiationTurns,
      };
    }
  }

  /**
   * 评估谈判回复（简化版，实际应该调用 AI）
   */
  private evaluateNegotiation(reply: string, crisisConfig: any): boolean {
    // 简单规则：回复长度和关键词检查
    if (reply.length < 20) {
      return false;
    }

    // 检查是否包含违规关键词
    const violationKeywords = ['转账', '贿赂', '威胁', '暴力'];
    if (violationKeywords.some(keyword => reply.includes(keyword))) {
      return false;
    }

    // 简单概率：60% 成功率
    return Math.random() > 0.4;
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * 重置游戏
   */
  reset(): void {
    this.state = this.initializeGame();
    this.notifyStateChange();
  }

  /**
   * 更新配置（用于编辑器实时预览）
   */
  updateConfig(newConfig: GameConfig): void {
    this.config = newConfig;
    // 如果当前阶段索引超出范围，重置到第一阶段
    if (this.state.currentStageIndex >= newConfig.stages.length) {
      this.state.currentStageIndex = 0;
      this.state.cardQueue = this.buildInitialCardQueue(newConfig.stages[0]);
    }
    this.notifyStateChange();
  }
}






