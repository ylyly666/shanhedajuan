import { StatKey } from './game';

export interface JudgeWeights {
  empathy: number; // 共情度：是否接纳了群众情绪？
  rationality: number; // 实际性：解决方案是否切合实际？
  strategy: number; // 策略性：是否有止损措施？是否有明确的时间节点承诺？
  compliance: number; // 合规性：是否违规？
}

export interface CrisisConfig {
  npcId: string;
  npcName?: string; // NPC名称（可自定义）
  npcRole?: string; // NPC身份（可自定义）
  npcAvatarUrl?: string; // NPC头像（可自定义）
  personality: string; // 性格特征
  conflictReason: string; // 冲突原因
  judgeWeights?: JudgeWeights;
}


