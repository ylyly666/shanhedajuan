/**
 * AI Mock Functions
 * TODO: 用真实大模型替换这些函数
 * 
 * 这些函数用于模拟AI生成和判分功能，在真实环境中应替换为实际的大模型API调用
 */

import { Card, StatKey } from '@/types';

/**
 * 从文档文本生成卡牌草稿
 * TODO: 用真实大模型替换
 * 输入：{docText: string}
 * 输出：CardDraft[]
 * 
 * 预期真实API格式：
 * POST /api/ai/generate-cards
 * Body: { docText: string, context?: GameConfig }
 * Response: { cards: CardDraft[] }
 */
export interface CardDraft {
  id: string;
  npcId: string;
  text: string;
  options: {
    left: { text: string; delta: Partial<Record<StatKey, number>> };
    right: { text: string; delta: Partial<Record<StatKey, number>> };
  };
  tags?: string[];
  confidence?: number; // 0-1，AI生成的可信度
}

export async function generateCardsFromDocMock(docText: string): Promise<CardDraft[]> {
  // Mock: 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock: 简单规则提取
  const lines = docText.split('\n').filter(l => l.trim().length > 10);
  const cards: CardDraft[] = [];

  // 提取关键词生成示例卡牌
  const keywords = {
    economy: ['经济', '收入', '投资', '资金', '项目', '产业'],
    environment: ['环境', '污染', '生态', '绿色', '环保', '水源'],
    people: ['民生', '村民', '群众', '福利', '就业', '生活'],
    governance: ['治理', '管理', '制度', '规范', '监督', '问责'],
  };

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const hasEconomy = keywords.economy.some(k => line.includes(k));
    const hasEnvironment = keywords.environment.some(k => line.includes(k));
    const hasPeople = keywords.people.some(k => line.includes(k));
    const hasGovernance = keywords.governance.some(k => line.includes(k));

    cards.push({
      id: `draft_${Date.now()}_${i}`,
      npcId: 'npc_secretary', // 默认NPC
      text: line.substring(0, 100) + (line.length > 100 ? '...' : ''),
      options: {
        left: {
          text: '保守方案',
          delta: {
            ...(hasEconomy ? { economy: -10 } : {}),
            ...(hasEnvironment ? { environment: 15 } : {}),
            ...(hasPeople ? { people: 5 } : {}),
            ...(hasGovernance ? { governance: 10 } : {})
          }
        },
        right: {
          text: '激进方案',
          delta: {
            ...(hasEconomy ? { economy: 20 } : {}),
            ...(hasEnvironment ? { environment: -20 } : {}),
            ...(hasPeople ? { people: -5 } : {}),
            ...(hasGovernance ? { governance: -5 } : {})
          }
        }
      },
      tags: ['AI生成'],
      confidence: 0.7 + Math.random() * 0.2
    });
  }

  return cards;
}

/**
 * 谈判判分器（Mock）
 * TODO: 用真实大模型替换
 * 输入：{ playerInput: string, npcPersonality: string, judgeWeights: { empathy, rationality, compliance } }
 * 输出：{ empathy: number, rationality: number, strategy: number, compliance: number, angerChange: number }
 * 
 * 预期真实API格式：
 * POST /api/ai/judge-negotiation
 * Body: { 
 *   playerInput: string,
 *   npcPersonality: string,
 *   judgeWeights: { empathy: number, rationality: number, compliance: number },
 *   context?: { currentStats: GameStats, history: Card[] }
 * }
 * Response: { scores: {...}, angerChange: number, reasoning?: string }
 */
export interface NegotiationJudgeResult {
  empathy: number; // 0-100
  rationality: number; // 0-100
  strategy: number; // 0-100
  compliance: number; // 0-100
  angerChange: number; // -100 to +100，负数表示怒气降低
  reasoning?: string; // AI判分理由（可选）
}

export interface NegotiationJudgeInput {
  playerInput: string;
  npcPersonality: string;
  judgeWeights: {
    empathy: number;
    rationality: number;
    compliance: number;
  };
}

export async function judgeNegotiationMock(input: NegotiationJudgeInput): Promise<NegotiationJudgeResult> {
  // Mock: 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  const { playerInput, npcPersonality, judgeWeights } = input;
  const text = playerInput.toLowerCase();

  // Mock: 简单规则判定
  const empathyKeywords = ['理解', '同情', '关心', '帮助', '支持', '体谅', '照顾'];
  const rationalityKeywords = ['分析', '考虑', '评估', '权衡', '方案', '计划', '策略'];
  const complianceKeywords = ['规定', '政策', '法律', '制度', '规范', '程序', '合规'];
  const negativeKeywords = ['不行', '不能', '拒绝', '反对', '抗议', '投诉', '起诉'];

  let empathy = 50;
  let rationality = 50;
  let strategy = 50;
  let compliance = 50;

  // 计算各项得分
  empathyKeywords.forEach(kw => {
    if (text.includes(kw)) empathy += 10;
  });
  rationalityKeywords.forEach(kw => {
    if (text.includes(kw)) rationality += 10;
  });
  complianceKeywords.forEach(kw => {
    if (text.includes(kw)) compliance += 10;
  });
  negativeKeywords.forEach(kw => {
    if (text.includes(kw)) {
      empathy -= 15;
      rationality -= 10;
    }
  });

  // 根据权重计算综合得分
  const weightedScore = 
    (empathy * judgeWeights.empathy / 100) +
    (rationality * judgeWeights.rationality / 100) +
    (compliance * judgeWeights.compliance / 100);

  // 计算怒气变化（综合得分越高，怒气降低越多）
  const angerChange = Math.max(-100, Math.min(100, (weightedScore - 50) * 2));

  // 策略性得分（基于输入长度和关键词多样性）
  strategy = Math.min(100, 40 + (text.length / 10) + (empathyKeywords.filter(kw => text.includes(kw)).length * 5));

  return {
    empathy: Math.max(0, Math.min(100, empathy)),
    rationality: Math.max(0, Math.min(100, rationality)),
    strategy: Math.max(0, Math.min(100, strategy)),
    compliance: Math.max(0, Math.min(100, compliance)),
    angerChange,
    reasoning: `基于输入文本分析：共情度${empathy}，理性度${rationality}，合规度${compliance}，策略度${strategy}。`
  };
}

