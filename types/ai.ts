// --- AI Chat Types ---
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}


