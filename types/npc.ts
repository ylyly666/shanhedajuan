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

// --- Npc Asset (deprecated, use StoryNpc) ---
export interface NpcAsset {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  defaultCrisisPrompt?: string; // Personality for negotiation
}


