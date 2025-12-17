// AI智能体服务
// 基于RAG（检索增强生成）+ Prompt Engineering

import { searchSimilarCases, getCasesFromSupabase } from './supabase';
import { callSilicoFlowAPI } from '../aiService';
import { KnowledgeBaseCase, StatKey } from '../types';

export interface AIResponse {
  content: string;
  relatedCases: KnowledgeBaseCase[];
}

// 生成基于RAG的回复
export const generateResponseWithRAG = async (
  userQuery: string,
  options?: {
    category?: StatKey;
    maxCases?: number;
  }
): Promise<AIResponse> => {
  // 1. RAG检索：从案例库中检索相关案例
  let relatedCases: KnowledgeBaseCase[] = [];
  
  try {
    // 尝试向量相似度搜索（如果有embedding）
    try {
      relatedCases = await searchSimilarCases(userQuery, {
        category: options?.category,
        limit: options?.maxCases || 5,
        threshold: 0.6,
      });
    } catch (embeddingError) {
      // 如果向量搜索失败，使用文本搜索
      console.warn('向量搜索失败，使用文本搜索:', embeddingError);
      const allCases = await getCasesFromSupabase({
        status: 'published',
        category: options?.category,
        limit: 50,
      });
      
      // 简单的关键词匹配
      const queryLower = userQuery.toLowerCase();
      relatedCases = allCases
        .filter(c => 
          c.title.toLowerCase().includes(queryLower) ||
          c.context_summary.toLowerCase().includes(queryLower) ||
          c.conflict_detail.toLowerCase().includes(queryLower) ||
          c.tags.some(tag => tag.toLowerCase().includes(queryLower))
        )
        .slice(0, options?.maxCases || 5);
    }
  } catch (error) {
    console.error('案例检索失败:', error);
    // 继续执行，即使检索失败
  }

  // 2. 构建Prompt（Prompt Engineering）
  const systemPrompt = `你是一个专业的基层治理AI助手，基于《山河答卷》乡村振兴案例库为用户提供咨询和建议。

你的职责：
1. 基于提供的案例库内容回答用户问题
2. 提供专业、实用的建议
3. 引用相关案例支撑你的回答
4. 语言要通俗易懂，贴近基层工作实际

回答要求：
- 如果提供了相关案例，优先基于这些案例回答
- 如果没有相关案例，基于你的知识给出一般性建议
- 回答要具体、可操作
- 可以适当总结案例中的经验教训`;

  // 构建案例上下文
  let casesContext = '';
  if (relatedCases.length > 0) {
    casesContext = '\n\n相关案例库内容：\n';
    relatedCases.forEach((caseItem, idx) => {
      casesContext += `\n案例${idx + 1}：${caseItem.title}\n`;
      casesContext += `类别：${getCategoryName(caseItem.category)}\n`;
      casesContext += `背景：${caseItem.context_summary}\n`;
      casesContext += `矛盾：${caseItem.conflict_detail}\n`;
      casesContext += `解决：${caseItem.resolution_outcome}\n`;
      if (caseItem.expert_comment) {
        casesContext += `点评：${caseItem.expert_comment}\n`;
      }
      casesContext += `标签：${caseItem.tags.join('、')}\n`;
    });
  } else {
    casesContext = '\n\n注意：案例库中未找到直接相关的案例，请基于一般性知识回答。';
  }

  const userPrompt = `用户问题：${userQuery}${casesContext}

请基于以上信息回答用户的问题。如果引用了案例，请说明是"案例X"。`;

  // 3. 调用AI生成回复
  try {
    const aiResponse = await callSilicoFlowAPI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      content: aiResponse.trim(),
      relatedCases: relatedCases,
    };
  } catch (error: any) {
    // 如果AI调用失败，返回基于案例的简单回复
    if (relatedCases.length > 0) {
      let fallbackResponse = `根据案例库，我找到了 ${relatedCases.length} 个相关案例：\n\n`;
      relatedCases.forEach((caseItem, idx) => {
        fallbackResponse += `${idx + 1}. ${caseItem.title}\n`;
        fallbackResponse += `   ${caseItem.context_summary.substring(0, 100)}...\n\n`;
      });
      fallbackResponse += '\n您可以查看这些案例的详细内容，或重新表述您的问题。';
      
      return {
        content: fallbackResponse,
        relatedCases: relatedCases,
      };
    } else {
      throw new Error(`AI服务暂时不可用：${error.message}`);
    }
  }
};

// 获取类别名称
const getCategoryName = (category: StatKey): string => {
  const map: Record<StatKey, string> = {
    economy: '经济发展',
    people: '民生福祉',
    environment: '生态环境',
    governance: '乡风民俗',
  };
  return map[category] || category;
};

// 分析用户意图（可选，用于优化检索）
export const analyzeUserIntent = (query: string): {
  intent: 'case_search' | 'advice' | 'analysis' | 'general';
  category?: StatKey;
  keywords: string[];
} => {
  const queryLower = query.toLowerCase();
  
  // 检测类别关键词
  const categoryKeywords: Record<StatKey, string[]> = {
    economy: ['经济', '发展', '产业', '招商', '投资'],
    people: ['民生', '村民', '群众', '矛盾', '调解'],
    environment: ['环境', '生态', '污染', '环保', '绿色'],
    governance: ['乡风', '民俗', '文明', '教育', '法治', '治理', '管理', '组织', '制度'],
  };

  let detectedCategory: StatKey | undefined;
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      detectedCategory = category as StatKey;
      break;
    }
  }

  // 检测意图
  let intent: 'case_search' | 'advice' | 'analysis' | 'general' = 'general';
  if (queryLower.includes('案例') || queryLower.includes('例子') || queryLower.includes('参考')) {
    intent = 'case_search';
  } else if (queryLower.includes('建议') || queryLower.includes('怎么办') || queryLower.includes('如何')) {
    intent = 'advice';
  } else if (queryLower.includes('分析') || queryLower.includes('总结') || queryLower.includes('经验')) {
    intent = 'analysis';
  }

  // 提取关键词
  const keywords = query
    .split(/[\s，,。.！!？?；;：:]/)
    .filter(w => w.length > 1)
    .slice(0, 5);

  return {
    intent,
    category: detectedCategory,
    keywords,
  };
};

