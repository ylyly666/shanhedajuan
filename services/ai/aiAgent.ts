// AI 智能体服务：RAG 检索增强 + Prompt Engineering
import { searchSimilarCases, getCasesFromSupabase, KnowledgeBaseCase } from '../database/supabase';
import { callSilicoFlowAPI } from './aiService';
import { StatKey } from '@/types';

export interface AIResponse {
  content: string;
  relatedCases: KnowledgeBaseCase[];
}

export const generateResponseWithRAG = async (
  userQuery: string,
  options?: { category?: StatKey; maxCases?: number }
): Promise<AIResponse> => {
  let relatedCases: KnowledgeBaseCase[] = [];

  // 1) 检索案例（向量优先，失败回退文本）
  try {
    relatedCases = await searchSimilarCases(userQuery, {
      category: options?.category,
      limit: options?.maxCases || 5,
      threshold: 0.6,
    });
  } catch (embeddingError) {
    console.warn('向量搜索失败，改用文本搜索', embeddingError);
    try {
      // 尝试从Supabase获取所有案例，然后文本搜索
      const allCases = await getCasesFromSupabase({
        status: 'published',
        category: options?.category,
        limit: 50,
      });
      const q = userQuery.toLowerCase();
      relatedCases = allCases
        .filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.context_summary.toLowerCase().includes(q) ||
            c.conflict_detail.toLowerCase().includes(q) ||
            c.tags.some((tag) => tag.toLowerCase().includes(q))
        )
        .slice(0, options?.maxCases || 5);
    } catch (textSearchError) {
      console.warn('文本搜索也失败，使用空案例列表', textSearchError);
      relatedCases = [];
    }
  }

  // 2) 构建 Prompt
  const systemPrompt =
    '你是基层治理 AI 助手，基于案例库回答用户问题。回答需具体、可操作，引用案例时注明。';

  let casesContext = '';
  if (relatedCases.length > 0) {
    casesContext = '\n\n相关案例库内容：\n';
    relatedCases.forEach((c, idx) => {
      casesContext += `\n案例${idx + 1}：${c.title}\n`;
      casesContext += `类别：${getCategoryName(c.category)}\n`;
      casesContext += `背景：${c.context_summary}\n`;
      casesContext += `矛盾：${c.conflict_detail}\n`;
      casesContext += `解决：${c.resolution_outcome}\n`;
      if (c.expert_comment) casesContext += `点评：${c.expert_comment}\n`;
      casesContext += `标签：${c.tags.join('、')}\n`;
    });
  } else {
    casesContext = '\n\n注意：案例库中未找到直接相关的案例，请基于一般性知识回答。';
  }

  const userPrompt = `用户问题：${userQuery}${casesContext}\n\n请基于以上信息回答用户的问题，引用案例时注明“案例X”。`;

  // 3) 调用 AI
  try {
    const aiResponse = await callSilicoFlowAPI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.7, max_tokens: 2000 }
    );
    return { content: aiResponse.trim(), relatedCases };
  } catch (error: any) {
    // 4) 兜底：返回案例列表或错误
    if (relatedCases.length > 0) {
      let fallback = `根据案例库，找到 ${relatedCases.length} 个相关案例：\n\n`;
      relatedCases.forEach((c, idx) => {
        fallback += `${idx + 1}. ${c.title}\n`;
        fallback += `   ${c.context_summary.substring(0, 100)}...\n\n`;
      });
      fallback += '\n您可查看这些案例，或重新表述您的问题。';
      return { content: fallback, relatedCases };
    }
    throw new Error(`AI服务暂不可用：${error?.message || error}`);
  }
};

const getCategoryName = (category: StatKey): string => {
  const map: Record<StatKey, string> = {
    economy: '经济发展',
    people: '民生福祉',
    environment: '生态环保',
    civility: '乡风民俗',
  };
  return map[category] || category;
};

