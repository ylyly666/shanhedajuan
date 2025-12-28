import { StatKey } from './game';
import { Stage, Card } from './card';
import { StoryNpc, CrisisNpc, NpcAsset } from './npc';
import { CrisisConfig } from './crisis';

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






