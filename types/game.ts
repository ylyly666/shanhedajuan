import { Card, Stage } from './card';
import { CrisisConfig } from './crisis';
import { CrisisNpc, NpcAsset, StoryNpc } from './npc';

// --- Core Game Metrics ---
export interface GameStats {
  economy: number;
  people: number;
  environment: number;
  governance: number;
}

export type StatKey = keyof GameStats;

// --- Game Config ---
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

