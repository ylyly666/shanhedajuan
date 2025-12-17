import { Type } from "@google/genai";

// --- Core Game Metrics ---
export interface GameStats {
  economy: number;
  people: number;
  environment: number;
  governance: number;
}

export type StatKey = keyof GameStats;

// --- Card Data Model ---
export interface CardOption {
  text: string;
  delta: Partial<GameStats>;
  followUpCardId?: string; // ID of a card to insert immediately after
}

export interface Card {
  id: string;
  npcId: string; // References an NPC in the asset library
  npcName?: string; // Optional override
  text: string;
  options: {
    left: CardOption;
    right: CardOption;
  };
  tags?: string[];
}

export interface NpcAsset {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  defaultCrisisPrompt?: string; // Personality for negotiation
}

// --- Story NPC (for story cards) ---
export interface StoryNpc {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  description?: string;
}

// --- Crisis NPC (for crisis negotiation) ---
export interface CrisisNpc {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  personality: string;
  judgeWeights: {
    empathy: number; // 0-100
    rationality: number; // 0-100
    compliance: number; // 0-100
  };
}

// --- Editor Structure ---
export interface RandomPool {
  type: 'random_pool';
  id: string;
  count: number;
  entries?: string[]; // 可选：指定的事件 ID 列表（如果为空则从 randomEventLibrary 随机抽取）
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  cards: (Card | RandomPool)[];
  kpi?: Partial<GameStats>; // Target stats for this stage
  kpiEnabled?: Partial<Record<StatKey, boolean>>; // Which KPIs are checked
}

export interface CrisisConfig {
  npcId: string;
  npcName?: string; // NPC名称（可自定义）
  npcRole?: string; // NPC身份（可自定义）
  npcAvatarUrl?: string; // NPC头像（可自定义）
  personality: string; // 性格特征
  conflictReason: string; // 冲突原因
  judgeWeights?: {
    empathy: number; // 共情度：是否接纳了群众情绪？
    rationality: number; // 实际性：解决方案是否切合实际？
    strategy: number; // 策略性：是否有止损措施？是否有明确的时间节点承诺？
    compliance: number; // 合规性：是否违规？
  };
}

export interface GameConfig {
  stages: Stage[];
  npcs: NpcAsset[]; // Deprecated: use storyNpcs instead
  storyNpcs: StoryNpc[]; // NPCs for story cards
  crisisNpcs: CrisisNpc[]; // NPCs for crisis negotiation
  randomEventLibrary: Card[]; // Library of random event cards
  crisisConfig: {
    [key in StatKey]: CrisisConfig;
  };
}

// --- Runtime Game State ---
export interface GameState {
  currentStats: GameStats;
  currentStageIndex: number;
  cardQueue: Card[]; // The active deck
  history: { cardId: string; decision: 'left' | 'right'; statsBefore: GameStats }[];
  isGameOver: boolean;
  gameResult: 'ongoing' | 'victory' | 'failure' | 'crisis';
  crisisStat: StatKey | null;
  negotiationTurns: number; // Max 3
}

// --- AI Chat Types ---
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

// --- Resource Library Types ---
export interface PolicyDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  uploadDate: string;
  tags: string[];
  fileUrl?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  location: string;
  category: StatKey;
  content: string;
  uploadDate: string;
  author?: string;
  status: 'pending' | 'approved' | 'rejected';
  tags: string[];
}

export interface ResourceLibrary {
  policies: PolicyDocument[];
  cases: CaseStudy[];
}
