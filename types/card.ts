import { GameStats } from './game';

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
  kpiEnabled?: Partial<Record<import('./game').StatKey, boolean>>; // Which KPIs are checked
}






