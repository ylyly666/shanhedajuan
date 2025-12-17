/**
 * 编辑器配置到游戏格式的转换工具
 * 这是一个纯函数工具，不修改编辑器代码
 */

import { GameConfig, Card, Stage, StoryNpc, CrisisNpc } from '@/types';
import { UICard, PhaseConfig } from '@/components/game/gameConstants';
import { MetricType, statKeyToMetric } from '@/utils/gameAdapter';
import { getImageByNpcId } from '@/utils/imageAssets';

/**
 * 将编辑器的 Card 转换为游戏的 UICard
 */
function convertCardToUICard(card: Card, npcMap: Map<string, StoryNpc>): UICard {
  const npc = npcMap.get(card.npcId);
  const npcName = card.npcName || npc?.name || '未知角色';
  const avatarUrl = npc?.avatarUrl || getImageByNpcId(card.npcId);

  // 转换 delta 格式：从 StatKey (governance) 转换为 MetricType (culture)
  const convertDelta = (delta: Partial<Record<string, number>>): Partial<Record<MetricType, number>> => {
    const result: Partial<Record<MetricType, number>> = {};
    Object.entries(delta).forEach(([key, value]) => {
      const metricType = statKeyToMetric(key as any);
      if (metricType) {
        result[metricType] = value;
      }
    });
    return result;
  };

  return {
    id: card.id,
    npcId: card.npcId,
    npcName: npcName,
    title: npc?.role || '',
    text: card.text,
    image: avatarUrl,
    options: {
      left: {
        text: card.options.left.text,
        delta: convertDelta(card.options.left.delta),
      },
      right: {
        text: card.options.right.text,
        delta: convertDelta(card.options.right.delta),
      },
    },
  };
}

/**
 * 将编辑器的 Stage 转换为游戏的 PhaseConfig
 */
function convertStageToPhaseConfig(
  stage: Stage,
  cardMap: Map<string, UICard>,
  randomEventLibrary: Card[],
  npcMap: Map<string, StoryNpc>
): PhaseConfig {
  const anchorCards: string[] = [];
  const randomPool: string[] = [];
  let randomCount = 0;

  // 遍历 stage.cards，区分固定卡片和随机池
  stage.cards.forEach((item) => {
    if ('type' in item && item.type === 'random_pool') {
      // 随机池
      if (item.entries && item.entries.length > 0) {
        // 使用指定的卡片ID
        randomPool.push(...item.entries);
      } else {
        // 从 randomEventLibrary 中随机抽取
        randomEventLibrary.forEach((card) => {
          if (!randomPool.includes(card.id)) {
            randomPool.push(card.id);
          }
        });
      }
      randomCount = item.count;
    } else {
      // 固定卡片
      const card = item as Card;
      anchorCards.push(card.id);
      
      // 如果卡片不在 cardMap 中，先转换并添加
      if (!cardMap.has(card.id)) {
        const uiCard = convertCardToUICard(card, npcMap);
        cardMap.set(card.id, uiCard);
      }
    }
  });

  // 转换 KPI：从 StatKey 转换为 MetricType
  const kpi: Partial<Record<MetricType, number>> = {};
  if (stage.kpi) {
    Object.entries(stage.kpi).forEach(([key, value]) => {
      const metricType = statKeyToMetric(key as any);
      if (metricType && value !== undefined) {
        kpi[metricType] = value;
      }
    });
  }

  return {
    id: anchorCards.length, // 使用阶段索引作为ID
    title: stage.title,
    description: stage.description,
    kpi: kpi,
    anchorCards: anchorCards,
    randomPool: randomPool,
    randomCount: randomCount,
  };
}

/**
 * 主转换函数：将编辑器配置转换为游戏格式
 */
export function convertGameConfigToGameFormat(config: GameConfig): {
  cardDatabase: Record<string, UICard>;
  phases: PhaseConfig[];
} {
  // 1. 构建 NPC 映射表
  const npcMap = new Map<string, StoryNpc>();
  (config.storyNpcs || config.npcs || []).forEach((npc) => {
    npcMap.set(npc.id, npc as StoryNpc);
  });

  // 2. 构建卡片数据库
  const cardMap = new Map<string, UICard>();

  // 转换所有固定卡片
  config.stages.forEach((stage) => {
    stage.cards.forEach((item) => {
      if (!('type' in item) || item.type !== 'random_pool') {
        const card = item as Card;
        if (!cardMap.has(card.id)) {
          const uiCard = convertCardToUICard(card, npcMap);
          cardMap.set(card.id, uiCard);
        }
      }
    });
  });

  // 转换随机事件库中的卡片
  (config.randomEventLibrary || []).forEach((card) => {
    if (!cardMap.has(card.id)) {
      const uiCard = convertCardToUICard(card, npcMap);
      cardMap.set(card.id, uiCard);
    }
  });

  // 3. 转换阶段配置
  const phases = config.stages.map((stage, index) =>
    convertStageToPhaseConfig(stage, cardMap, config.randomEventLibrary || [], npcMap)
  );

  // 4. 返回结果
  const cardDatabase: Record<string, UICard> = {};
  cardMap.forEach((card, id) => {
    cardDatabase[id] = card;
  });

  return {
    cardDatabase,
    phases,
  };
}

