/**
 * AI 智能体服务：RAG 检索增强 + Prompt Engineering
 * 使用本地 JSON 知识库实现伪 RAG
 */
import { callSilicoFlowAPI } from './aiService';
import type { StatKey } from '@/types/game';
import { searchKnowledgeCases, mapStatKeyToCategory, type KnowledgeCase } from '@/utils/knowledgeBase';

export interface KnowledgeBaseCase {
  id: string;
  title: string;
  tags: string[];
  category: string;
  content: string;
  key_lesson: string;
}

export interface AIResponse {
  content: string;
  relatedCases: KnowledgeBaseCase[];
}

/**
 * 将本地知识库案例转换为通用格式
 */
function convertToKnowledgeBaseCase(caseItem: KnowledgeCase): KnowledgeBaseCase {
  return {
    id: caseItem.id,
    title: caseItem.title,
    tags: caseItem.tags,
    category: caseItem.category,
    content: caseItem.content,
    key_lesson: caseItem.key_lesson,
  };
}

// RAG检索增强生成（使用本地JSON知识库）
export const generateResponseWithRAG = async (
  userQuery: string,
  options?: { category?: StatKey; maxCases?: number }
): Promise<AIResponse> => {
  let relatedCases: KnowledgeBaseCase[] = [];

  try {
    // 1) 从本地知识库检索案例
    // 将 StatKey 映射到知识库的中文类别
    const category = options?.category 
      ? mapStatKeyToCategory(options.category)
      : undefined;

    const localCases = await searchKnowledgeCases(userQuery, {
      category,
      maxResults: options?.maxCases || 5,
      minScore: 1, // 最低相关性分数
    });

    // 转换为统一格式
    relatedCases = localCases.map(convertToKnowledgeBaseCase);
  } catch (error) {
    console.error('检索案例失败:', error);
    // 继续执行，即使检索失败也尝试生成回复
  }

  // 2) 构建 Prompt（根据 JSON 结构调整）
  const systemPrompt = `你是《山河答卷》基层治理 AI 智能助手，专门基于真实乡村振兴案例库回答用户问题。

**重要：你必须明确引用案例库中的案例！**

回答规则：
1. **必须引用案例**：如果案例库中有相关案例，你必须在回答中明确引用，格式为"案例X：案例标题"（X为序号，如"案例1：牛油果引种决策"）
2. **列举案例**：如果用户问"有什么XX案例"、"推荐XX案例"等，你需要明确列举相关案例，每个案例都要说明：
   - 案例标题
   - 简要背景（来自content字段）
   - 处理结果/经验（来自key_lesson字段）
3. **引用格式**：在回答中引用案例时，使用"根据案例X"、"参考案例X"、"如案例X所示"等明确表述
4. **具体可操作**：结合案例的处理结果和经验总结（key_lesson），给出针对性建议
5. **语言风格**：专业但易懂，符合基层治理实际，贴近乡村振兴场景`;

  let casesContext = '';
  if (relatedCases.length > 0) {
    casesContext = '\n\n=== 相关案例库内容（基于真实乡村振兴实践） ===\n';
    relatedCases.forEach((c, idx) => {
      casesContext += `\n【案例${idx + 1}】${c.title}\n`;
      casesContext += `类别：${c.category}\n`;
      casesContext += `案例背景与问题：\n${c.content}\n`;
      casesContext += `处理结果与经验：\n${c.key_lesson}\n`;
      if (c.tags && c.tags.length > 0) {
        casesContext += `标签：${c.tags.join('、')}\n`;
      }
      casesContext += '---\n';
    });
    casesContext += `\n**重要提示**：
- 以上案例库中找到了 ${relatedCases.length} 个相关案例
- 你必须在回答中明确引用这些案例，使用"案例1"、"案例2"等格式
- 如果用户询问案例推荐，请逐个列举这些案例，说明每个案例的背景（content）和处理经验（key_lesson）
- 不要只是泛泛而谈，必须引用具体的案例内容\n`;
  } else {
    casesContext = '\n\n注意：案例库中未找到直接相关的案例，请基于一般性基层治理知识回答，但应尽量结合乡村振兴的实际场景。';
  }

  // 判断是否是询问案例的问题
  const isAskingForCases = /有什么|推荐|介绍|列举|案例|有哪些|什么案例/.test(userQuery);
  
  let userPrompt = `用户问题：${userQuery}${casesContext}\n\n`;
  
  if (isAskingForCases && relatedCases.length > 0) {
    userPrompt += `**用户正在询问案例，你必须明确列举并引用以下案例：**
${relatedCases.map((c, idx) => `案例${idx + 1}：${c.title}`).join('\n')}

请在你的回答中：
1. 明确说明找到了${relatedCases.length}个相关案例
2. 逐个介绍每个案例，包括：
   - 案例标题
   - 案例背景与问题（来自content字段）
   - 处理结果与经验（来自key_lesson字段）
3. 每个案例都要使用"案例X"格式明确标注
4. 结合案例的处理结果，给出针对性的建议或总结\n`;
  } else {
    userPrompt += `请基于以上案例库内容回答用户问题。**如果案例库中有相关案例，你必须明确引用，使用"案例X"格式（如"案例1"、"案例2"等）。**\n`;
  }

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
        fallback += `${idx + 1}. ${c.title}（${c.category}）\n`;
        fallback += `   背景：${c.content.substring(0, 100)}...\n`;
        fallback += `   经验：${c.key_lesson.substring(0, 80)}...\n\n`;
      });
      fallback += '\n您可查看这些案例，或重新表述您的问题。';
      return { content: fallback, relatedCases };
    }
    throw new Error(`AI服务暂不可用：${error?.message || error}`);
  }
};

