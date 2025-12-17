// Supabase 客户端配置
// 注意：生产环境请从环境变量读取
import { StatKey } from '@/types';

export type CaseSource = 'official_report' | 'field_experience' | 'user_upload' | 'expert_contribution';

export interface KnowledgeBaseCase {
  id: string;
  title: string;
  tags: string[];
  category: StatKey;
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
  source: CaseSource;
  original_text?: string;
  status?: 'draft' | 'published' | 'archived';
  embedding?: number[];
}

// Supabase 配置（需要替换为实际配置）
declare const process: { env?: Record<string, string | undefined> };
const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : process.env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';

// 如果使用@supabase/supabase-js
// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 临时实现：使用 fetch API（若不安装 supabase-js）
export const supabaseRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase Error: ${response.status} - ${error}`);
  }

  return response.json();
};

// 保存案例到Supabase
export const saveCaseToSupabase = async (
  caseData: KnowledgeBaseCase,
  embedding?: number[]
): Promise<KnowledgeBaseCase> => {
  const payload: any = {
    title: caseData.title,
    tags: caseData.tags,
    category: caseData.category,
    context_summary: caseData.context_summary,
    conflict_detail: caseData.conflict_detail,
    resolution_outcome: caseData.resolution_outcome,
    expert_comment: caseData.expert_comment || null,
    source: caseData.source, // 已经是正确的CaseSource类型（英文值）
    original_text: caseData.original_text || null,
    status: caseData.status || 'draft',
  };

  // 如果有embedding，添加到payload
  if (embedding) {
    payload.embedding = embedding;
  }

  const result = await supabaseRequest('knowledge_base', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return result[0];
};

// 更新案例
export const updateCaseInSupabase = async (
  id: string,
  updates: Partial<KnowledgeBaseCase>,
  embedding?: number[]
): Promise<KnowledgeBaseCase> => {
  const payload: any = { ...updates };
  
  if (embedding) {
    payload.embedding = embedding;
  }

  const result = await supabaseRequest(`knowledge_base?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return result[0];
};

// 获取案例列表
export const getCasesFromSupabase = async (
  filters?: {
    category?: string;
    status?: string;
    source?: string;
    limit?: number;
  }
): Promise<KnowledgeBaseCase[]> => {
  let endpoint = 'knowledge_base?select=*&order=created_at.desc';
  
  if (filters) {
    const params: string[] = [];
    if (filters.category) params.push(`category=eq.${filters.category}`);
    if (filters.status) params.push(`status=eq.${filters.status}`);
    if (filters.source) params.push(`source=eq.${filters.source}`);
    if (filters.limit) params.push(`limit=${filters.limit}`);
    
    if (params.length > 0) {
      endpoint += '&' + params.join('&');
    }
  }

  return supabaseRequest(endpoint);
};

// 生成向量嵌入（调用OpenAI Embedding API或本地模型）
export const generateEmbedding = async (text: string): Promise<number[]> => {
  // 方案1：使用OpenAI Embedding API
  const OPENAI_API_KEY = env.VITE_OPENAI_API_KEY || '';
  const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';

  if (OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_EMBEDDING_MODEL,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('OpenAI Embedding Error:', error);
      throw error;
    }
  }

  // 方案2：使用本地模型或SilicoFlow API（如果支持）
  // 这里可以调用其他embedding服务

  // 方案3：使用 Supabase 的 pgvector 扩展（如果配置了本地模型）——需要在 Supabase 中配置 edge function

  // 如果没有配置 embedding 服务，返回空数组（允许保存不带向量的记录）
  console.warn('No embedding service configured. Saving case without embedding vector.');
  return [];
};

// 向量相似度搜索（RAG检索）
export const searchSimilarCases = async (
  queryText: string,
  options?: {
    category?: string;
    threshold?: number;
    limit?: number;
  }
): Promise<KnowledgeBaseCase[]> => {
  // 1. 生成查询文本的向量
  const queryEmbedding = await generateEmbedding(queryText);

  // 2. 调用 Supabase 的向量搜索函数
  const limit = options?.limit || 10;
  const category = options?.category || null;
  const threshold = options?.threshold || 0.7;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/match_knowledge_base`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_category: category,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Search Error: ${response.status}`);
  }

  return response.json();
};

