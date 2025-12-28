// Supabase 客户端配置
// 注意：生产环境请从环境变量读取
import { StatKey } from '@/types';

export type CaseSource = 'official_report' | 'field_experience' | 'user_upload' | 'expert_contribution';

export interface KnowledgeBaseCase {
  id: string;
  title: string;
  tags: string[];
  category: StatKey;
  author_display?: string; // 上传者/来源身份（如"政府/基层干部"），用于展示
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
  source: CaseSource;
  original_text?: string;
  status?: 'draft' | 'published' | 'archived';
  embedding?: number[];
}

// Supabase 配置
// Vite环境变量：必须以VITE_开头才能在客户端访问
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 调试信息（开发环境）
if (import.meta.env.DEV) {
  console.log('[Supabase Config]', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY,
    urlPrefix: SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : '未配置',
    keyPrefix: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : '未配置',
    fullUrl: SUPABASE_URL, // 开发环境显示完整URL用于调试
  });
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Supabase] ⚠️ 未检测到Supabase配置，将使用Mock数据');
    console.warn('[Supabase] 请在 .env.local 文件中配置：');
    console.warn('[Supabase]   VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.warn('[Supabase]   VITE_SUPABASE_ANON_KEY=your-anon-key');
  } else {
    console.log('[Supabase] ✅ 检测到Supabase配置，将连接真实数据库');
  }
}

// 尝试使用官方Supabase客户端（如果已安装）
let supabaseClient: any = null;
let useOfficialClient = false;
let clientInitAttempted = false;

// 检查是否可以使用官方客户端
const initSupabaseClient = async () => {
  if (clientInitAttempted) return;
  clientInitAttempted = true;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return; // 没有配置，不需要初始化
  }
  
  try {
    // 动态导入，如果未安装则使用fetch API
    // @ts-ignore - 动态导入，可能未安装
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    useOfficialClient = true;
    console.log('[Supabase] ✅ 使用官方客户端库（已处理CORS）');
  } catch (e: any) {
    if (e.code === 'MODULE_NOT_FOUND' || e.message?.includes('Cannot find module')) {
      console.warn('[Supabase] ⚠️ 未安装@supabase/supabase-js，使用fetch API（可能遇到CORS问题）');
      console.warn('[Supabase] 💡 建议运行: npm install @supabase/supabase-js');
    } else {
      console.warn('[Supabase] 客户端初始化失败:', e.message);
    }
  }
};

// 使用 fetch API 的实现（兜底方案）
export const supabaseRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase未配置：请检查VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY\n\n请在项目根目录的.env.local文件中添加：\nVITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key');
  }

  // 尝试初始化官方客户端（如果还没初始化）
  await initSupabaseClient();
  
  // 如果使用官方客户端
  if (useOfficialClient && supabaseClient) {
    try {
      const method = (options.method || 'GET').toUpperCase();
      const tableName = endpoint.split('?')[0];
      
      if (method === 'GET') {
        const query = supabaseClient.from(tableName).select('*');
        // 解析查询参数
        const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
        urlParams.forEach((value, key) => {
          if (key === 'select') {
            // select已在from中处理
          } else if (key.startsWith('order')) {
            const [_, column, direction] = value.split('.');
            query.order(column, { ascending: direction !== 'desc' });
          } else if (key.includes('eq.')) {
            const [column, val] = key.split('eq.');
            query.eq(column, val);
          } else if (key === 'limit') {
            query.limit(parseInt(value));
          }
        });
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } else if (method === 'POST') {
        const body = JSON.parse(options.body as string);
        const { data, error } = await supabaseClient.from(tableName).insert(body).select();
        if (error) throw error;
        return data || [];
      } else if (method === 'PATCH') {
        const body = JSON.parse(options.body as string);
        const id = endpoint.match(/id=eq\.([^&]+)/)?.[1];
        if (!id) throw new Error('PATCH请求需要指定id');
        const { data, error } = await supabaseClient.from(tableName).update(body).eq('id', id).select();
        if (error) throw error;
        return data || [];
      }
    } catch (error: any) {
      console.warn('[Supabase] 官方客户端调用失败，回退到fetch API:', error);
      useOfficialClient = false; // 标记为失败，下次不再尝试
      // 继续使用fetch API
    }
  }

  // 使用fetch API（兜底方案）
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  
  if (import.meta.env.DEV) {
    console.log('[Supabase Request]', options.method || 'GET', url);
  }

  try {
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
      const errorText = await response.text();
      let errorMessage = `Supabase Error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += ` - ${errorJson.message || errorJson.error || errorJson.hint || errorText}`;
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      // 提供更详细的错误信息
      if (response.status === 0 || errorText.includes('Failed to fetch')) {
        errorMessage = `网络连接失败\n\n可能的原因：\n1. Supabase URL配置错误（当前: ${SUPABASE_URL.substring(0, 40)}...）\n2. 网络连接问题\n3. CORS跨域问题（建议安装@supabase/supabase-js）\n4. Supabase服务暂时不可用\n\n解决方案：\n- 检查.env.local文件中的VITE_SUPABASE_URL是否正确\n- 运行: npm install @supabase/supabase-js\n- 检查网络连接`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error: any) {
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new Error(`网络连接失败\n\n请检查：\n1. Supabase URL是否正确（当前: ${SUPABASE_URL}）\n2. 网络连接是否正常\n3. 是否存在CORS问题（建议安装@supabase/supabase-js: npm install @supabase/supabase-js）\n\n详细错误: ${error.message}`);
    }
    throw error;
  }
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
    author_display: caseData.author_display || null,
    context_summary: caseData.context_summary,
    conflict_detail: caseData.conflict_detail,
    resolution_outcome: caseData.resolution_outcome,
    expert_comment: caseData.expert_comment || null,
    source: caseData.source, // 已经是正确的CaseSource类型（英文值）
    original_text: caseData.original_text || null,
    status: caseData.status || 'draft',
  };

  // 如果有embedding且不是空数组，添加到payload
  if (embedding && Array.isArray(embedding) && embedding.length > 0) {
    payload.embedding = embedding;
  }

  try {
    const result = await supabaseRequest('knowledge_base', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return result[0];
  } catch (error: any) {
    // 如果错误是因为 author_display 列不存在（schema cache未更新），则降级处理
    if (error.message && error.message.includes("Could not find the 'author_display' column")) {
      console.warn('[Supabase] author_display列不存在，降级处理：移除该字段后重试');
      // 移除 author_display 字段后重试
      const fallbackPayload = { ...payload };
      delete fallbackPayload.author_display;
      
      const result = await supabaseRequest('knowledge_base', {
        method: 'POST',
        body: JSON.stringify(fallbackPayload),
      });
      return result[0];
    }
    // 如果错误是因为 expert_comment 列不存在，也降级处理
    if (error.message && error.message.includes("Could not find the 'expert_comment' column")) {
      console.warn('[Supabase] expert_comment列不存在，降级处理：移除该字段后重试');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.expert_comment;
      
      const result = await supabaseRequest('knowledge_base', {
        method: 'POST',
        body: JSON.stringify(fallbackPayload),
      });
      return result[0];
    }
    // 其他错误直接抛出
    throw error;
  }
};

// 更新案例
export const updateCaseInSupabase = async (
  id: string,
  updates: Partial<KnowledgeBaseCase>,
  embedding?: number[]
): Promise<KnowledgeBaseCase> => {
  const payload: any = { ...updates };
  
  // 只有当embedding是有效数组时才添加
  if (embedding && Array.isArray(embedding) && embedding.length > 0) {
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
  // 检查Supabase配置
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Supabase] 未配置，使用Mock数据');
    return getMockCases(filters);
  }

  try {
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

    console.log('[Supabase] 请求案例列表:', endpoint);
    const result = await supabaseRequest(endpoint);
    console.log('[Supabase] 获取到', result.length, '个案例');
    return result;
  } catch (error: any) {
    console.error('[Supabase] 连接失败:', error);
    console.warn('[Supabase] 使用Mock数据作为兜底');
    return getMockCases(filters);
  }
};

// Mock数据获取函数
const getMockCases = async (
  filters?: {
    category?: string;
    status?: string;
    source?: string;
    limit?: number;
  }
): Promise<KnowledgeBaseCase[]> => {
  // 动态导入Mock数据，避免循环依赖
  const { MOCK_KNOWLEDGE_BASE_CASES } = await import('./mockCases');
  
  let cases = [...MOCK_KNOWLEDGE_BASE_CASES];
  
  // 应用过滤器
  if (filters) {
    if (filters.category) {
      cases = cases.filter(c => c.category === filters.category);
    }
    if (filters.status) {
      cases = cases.filter(c => c.status === filters.status);
    }
    if (filters.source) {
      cases = cases.filter(c => c.source === filters.source);
    }
    if (filters.limit) {
      cases = cases.slice(0, filters.limit);
    }
  }
  
  return cases;
};

// 生成向量嵌入（支持 OpenAI、SilicoFlow 等兼容 OpenAI 格式的 API）
export const generateEmbedding = async (text: string): Promise<number[] | undefined> => {
  // 方案1：优先使用 SilicoFlow API（兼容 OpenAI 格式）
  const SILICOFLOW_API_KEY = import.meta.env.VITE_SILICOFLOW_API_KEY || 
                              (typeof process !== 'undefined' && process.env?.SILICOFLOW_API_KEY) || '';
  const SILICOFLOW_BASE_URL = import.meta.env.VITE_SILICOFLOW_BASE_URL || 
                               (typeof process !== 'undefined' && process.env?.SILICOFLOW_BASE_URL) ||
                               'https://api.siliconflow.cn/v1';

  if (SILICOFLOW_API_KEY) {
    // 尝试多个可能的 embedding 模型（按优先级）
    const modelsToTry = [
      'text-embedding-ada-002', // OpenAI 兼容模型
      'BAAI/bge-large-en-v1.5', // SilicoFlow 推荐的 embedding 模型
      'BAAI/bge-base-en-v1.5', // 备选模型
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`[Embedding] 尝试使用模型: ${model}`);
        // SilicoFlow 兼容 OpenAI embeddings API
        const response = await fetch(`${SILICOFLOW_BASE_URL}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SILICOFLOW_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            input: text,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          // 如果是模型不存在错误，尝试下一个模型
          if (response.status === 404 || errorText.includes('model') || errorText.includes('not found')) {
            console.warn(`[Embedding] 模型 ${model} 不可用，尝试下一个...`);
            continue;
          }
          console.error('SilicoFlow Embedding Error:', response.status, errorText);
          throw new Error(`SilicoFlow API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const embedding = data.data?.[0]?.embedding;
        
        // 验证向量是否有效
        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error('Invalid embedding: empty or not an array');
        }
        
        // 检查向量维度（Supabase 配置为 1536，但不同模型可能有不同维度）
        const dimension = embedding.length;
        const expectedDimension = 1536; // 数据库配置的维度
        
        if (dimension !== expectedDimension) {
          console.warn(`[Embedding] 警告：向量维度为 ${dimension}，但数据库配置为 ${expectedDimension} 维。`);
          console.warn(`[Embedding] 为避免保存失败，将不保存向量（案例数据仍会正常保存）。`);
          console.warn(`[Embedding] 如需使用向量搜索，请：`);
          console.warn(`[Embedding]   1. 修改数据库 schema：ALTER TABLE knowledge_base ALTER COLUMN embedding TYPE vector(${dimension});`);
          console.warn(`[Embedding]   2. 或使用 ${expectedDimension} 维的 embedding 模型`);
          // 返回 undefined，不保存向量，但案例数据仍会保存
          return undefined;
        }
        
        console.log(`[Embedding] SilicoFlow 成功生成向量（模型: ${model}），维度: ${dimension}`);
        return embedding;
      } catch (error: any) {
        // 如果是最后一个模型也失败了，抛出错误
        if (model === modelsToTry[modelsToTry.length - 1]) {
          console.error(`[Embedding] 所有 SilicoFlow 模型都失败，最后一个错误:`, error);
          // 继续尝试 OpenAI（如果配置了）
          break;
        }
        // 否则继续尝试下一个模型
        continue;
      }
    }
  }

  // 方案2：使用 OpenAI Embedding API
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
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
      const embedding = data.data[0].embedding;
      // 验证向量是否有效
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Invalid embedding: empty or not an array');
      }
      
      console.log(`[Embedding] 成功生成向量，维度: ${embedding.length}`);
      return embedding;
    } catch (error) {
      console.error('OpenAI Embedding Error:', error);
      throw error;
    }
  }

  // 方案3：使用 Supabase 的 pgvector 扩展（如果配置了本地模型）——需要在 Supabase 中配置 edge function

  // 如果没有配置 embedding 服务，返回 undefined（不发送向量字段）
  console.warn('[Embedding] 未配置 embedding 服务（SilicoFlow 或 OpenAI），将保存不带向量的记录');
  console.warn('[Embedding] 请在 .env.local 中配置：');
  console.warn('[Embedding]   VITE_SILICOFLOW_API_KEY=your_key (推荐)');
  console.warn('[Embedding]   或 VITE_OPENAI_API_KEY=your_key');
  return undefined; // 返回 undefined，调用方需要检查
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
  // 检查Supabase配置和embedding服务
  const hasSupabase = SUPABASE_URL && SUPABASE_ANON_KEY;
  // 检查是否有任何 embedding 服务（SilicoFlow 或 OpenAI）
  const hasEmbedding = !!(
    import.meta.env.VITE_SILICOFLOW_API_KEY || 
    (typeof process !== 'undefined' && process.env?.SILICOFLOW_API_KEY) ||
    import.meta.env.VITE_OPENAI_API_KEY || 
    ''
  );

  // 如果没有配置，直接使用文本搜索
  if (!hasSupabase) {
    console.warn('[RAG] Supabase未配置，使用文本搜索');
    return searchMockCasesByText(queryText, options);
  }

  if (!hasEmbedding) {
    console.warn('[RAG] Embedding API未配置，使用文本搜索（向量搜索需要VITE_SILICOFLOW_API_KEY或VITE_OPENAI_API_KEY）');
    // 即使没有embedding，也可以尝试从Supabase获取所有案例然后文本搜索
    try {
      const allCases = await getCasesFromSupabase({
        status: 'published',
        category: options?.category,
        limit: 50,
      });
      const q = queryText.toLowerCase();
      const results = allCases
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.context_summary.toLowerCase().includes(q) ||
            c.conflict_detail?.toLowerCase().includes(q) ||
            c.tags.some((tag) => tag.toLowerCase().includes(q))
        )
        .slice(0, options?.limit || 5);
      return results;
    } catch (error) {
      console.warn('[RAG] Supabase文本搜索失败，使用Mock数据', error);
      return searchMockCasesByText(queryText, options);
    }
  }

  try {
    // 1. 生成查询文本的向量
    const queryEmbedding = await generateEmbedding(queryText);
    
    if (!queryEmbedding || queryEmbedding.length === 0) {
      // embedding生成失败，回退到文本搜索
      return searchMockCasesByText(queryText, options);
    }

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
  } catch (error: any) {
    console.warn('向量搜索失败，改用文本搜索:', error.message);
    return searchMockCasesByText(queryText, options);
  }
};

// 文本搜索Mock数据
const searchMockCasesByText = async (
  queryText: string,
  options?: {
    category?: string;
    threshold?: number;
    limit?: number;
  }
): Promise<KnowledgeBaseCase[]> => {
  const { MOCK_KNOWLEDGE_BASE_CASES } = await import('./mockCases');
  
  const q = queryText.toLowerCase();
  const limit = options?.limit || 5;
  
  // 简单的关键词匹配
  let results = MOCK_KNOWLEDGE_BASE_CASES.filter(c => {
    if (options?.category && c.category !== options.category) {
      return false;
    }
    
    const searchableText = [
      c.title,
      c.context_summary,
      c.conflict_detail,
      c.resolution_outcome,
      ...c.tags,
    ].join(' ').toLowerCase();
    
    return searchableText.includes(q);
  });
  
  // 按相关性排序（简单实现：匹配关键词数量）
  results.sort((a, b) => {
    const aMatches = [
      a.title, a.context_summary, a.conflict_detail, a.resolution_outcome,
      ...a.tags
    ].join(' ').toLowerCase().split(q).length - 1;
    
    const bMatches = [
      b.title, b.context_summary, b.conflict_detail, b.resolution_outcome,
      ...b.tags
    ].join(' ').toLowerCase().split(q).length - 1;
    
    return bMatches - aMatches;
  });
  
  return results.slice(0, limit);
};

