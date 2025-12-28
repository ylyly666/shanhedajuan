// --- AI Chat Types ---
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

// --- AI Extracted Case Types ---
import { StatKey } from './game';

export interface AIExtractedCase {
  title: string;
  tags: string[];
  category: StatKey;
  author_display?: string; // 上传者/来源身份（如"政府/基层干部"）
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
}






