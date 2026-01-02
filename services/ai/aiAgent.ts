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
  uploader?: string;
  content: string;
  key_lesson: string;
  full_details?: {
    summary: string;
    conflict: string;
    solution: string;
    expert_comment: string;
  };
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
    uploader: caseItem.uploader,
    content: caseItem.content,
    key_lesson: caseItem.key_lesson,
    full_details: caseItem.full_details,
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
1. **强制引用格式**：如果案例库中有相关案例，你必须在回答中使用以下固定格式引用：
   【参考案例：{{案例标题}}】
   例如：【参考案例：雨露计划25000元发放】
   
2. **矛盾对比分析**：在引用案例时，必须对比用户当前问题与案例中"矛盾详情"（conflict字段）的相似性，说明：
   - 用户问题与案例矛盾的相似点
   - 案例是如何解决类似矛盾的
   
3. **方法论迁移**：必须提炼案例中"专家点评"（expert_comment字段）的核心治理逻辑，并将其转化为对用户当前局面的"三步走"建议：
   - 第一步：识别问题本质
   - 第二步：采取具体措施
   - 第三步：建立长效机制
   
4. **列举案例**：如果用户问"有什么XX案例"、"推荐XX案例"等，你需要明确列举相关案例，每个案例都要说明：
   - 案例标题（使用【参考案例：标题】格式）
   - 背景摘要（summary）
   - 矛盾详情（conflict）
   - 解决方案（solution）
   - 专家点评（expert_comment）
   
5. **容错处理**：如果案例没有full_details字段，则使用content和key_lesson字段，通过正则提取结构化信息

6. **语言风格**：专业但易懂，符合基层治理实际，贴近乡村振兴场景`;

  // 从content和key_lesson中提取结构化信息的辅助函数
  const extractFromContent = (content: string, keyLesson: string) => {
    // 尝试从content中提取【背景摘要】和【矛盾详情】
    const summaryMatch = content.match(/【背景摘要】\s*([^【]+)/);
    const conflictMatch = content.match(/【矛盾详情】\s*([^【]+)/);
    
    // 尝试从key_lesson中提取【解决结果】和【专家点评】
    const solutionMatch = keyLesson.match(/【解决结果】\s*([^【]+)/);
    const expertMatch = keyLesson.match(/【专家点评】\s*([^【]+)/);
    
    return {
      summary: summaryMatch ? summaryMatch[1].trim() : content.split('\n')[0] || content.substring(0, 100),
      conflict: conflictMatch ? conflictMatch[1].trim() : '',
      solution: solutionMatch ? solutionMatch[1].trim() : keyLesson.split('\n')[0] || keyLesson.substring(0, 100),
      expert_comment: expertMatch ? expertMatch[1].trim() : '',
    };
  };

  let casesContext = '';
  let totalContextLength = 0;
  
  if (relatedCases.length > 0) {
    casesContext = '\n\n=== 相关案例库内容（基于真实乡村振兴实践） ===\n';
    relatedCases.forEach((c, idx) => {
      casesContext += `\n【案例${idx + 1}】${c.title}\n`;
      casesContext += `类别：${c.category}\n`;
      if (c.uploader) {
        casesContext += `来源：${c.uploader}\n`;
      }
      
      // 优先使用full_details结构化信息，如果没有则从content和key_lesson中提取
      let caseDetails: { summary: string; conflict: string; solution: string; expert_comment: string };
      
      if (c.full_details) {
        caseDetails = c.full_details;
      } else {
        // 容错处理：从content和key_lesson中提取
        caseDetails = extractFromContent(c.content, c.key_lesson);
      }
      
      casesContext += `背景摘要：${caseDetails.summary}\n`;
      casesContext += `矛盾详情：${caseDetails.conflict}\n`;
      casesContext += `解决方案：${caseDetails.solution}\n`;
      if (caseDetails.expert_comment) {
        casesContext += `专家点评：${caseDetails.expert_comment}\n`;
      }
      
      // 解析并显示标签（提取#标签）
      if (c.tags && c.tags.length > 0) {
        const tagWords = c.tags
          .flatMap(tag => tag.replace(/#/g, ' ').split(/\s+/).filter(w => w.trim()))
          .filter((v, i, a) => a.indexOf(v) === i); // 去重
        casesContext += `标签：${tagWords.join('、')}\n`;
      }
      casesContext += '---\n';
    });
    
    totalContextLength = casesContext.length;
    
    casesContext += `\n**重要提示**：
- 以上案例库中找到了 ${relatedCases.length} 个相关案例
- 你必须在回答中使用【参考案例：{{案例标题}}】格式明确引用这些案例
- 必须对比用户问题与案例"矛盾详情"的相似性
- 必须提炼"专家点评"中的核心治理逻辑，转化为"三步走"建议
- 不要只是泛泛而谈，必须引用具体的案例内容和数据\n`;
  } else {
    casesContext = '\n\n注意：案例库中未找到直接相关的案例，请基于一般性基层治理知识回答，但应尽量结合乡村振兴的实际场景。';
    totalContextLength = casesContext.length;
  }

  // 判断是否是询问案例的问题
  const isAskingForCases = /有什么|推荐|介绍|列举|案例|有哪些|什么案例/.test(userQuery);
  
  let userPrompt = `用户问题：${userQuery}${casesContext}\n\n`;
  
  if (isAskingForCases && relatedCases.length > 0) {
    userPrompt += `**用户正在询问案例，你必须明确列举并引用以下案例：**
${relatedCases.map((c, idx) => `案例${idx + 1}：${c.title}`).join('\n')}

请在你的回答中：
1. 明确说明找到了${relatedCases.length}个相关案例
2. 逐个介绍每个案例，使用【参考案例：{{案例标题}}】格式
3. 对每个案例，必须说明：
   - 背景摘要（summary）
   - 矛盾详情（conflict），并对比与用户问题的相似性
   - 解决方案（solution）
   - 专家点评（expert_comment），并提炼为"三步走"建议
4. 结合案例的处理结果，给出针对性的建议或总结\n`;
  } else {
    userPrompt += `请基于以上案例库内容回答用户问题。

**必须遵守以下规则：**
1. 如果案例库中有相关案例，必须使用【参考案例：{{案例标题}}】格式明确引用
2. 必须对比用户问题"${userQuery}"与案例中"矛盾详情"的相似性
3. 必须提炼案例中"专家点评"的核心治理逻辑，转化为对用户当前局面的"三步走"建议：
   - 第一步：识别问题本质
   - 第二步：采取具体措施  
   - 第三步：建立长效机制\n`;
  }

  // 调试信息：显示最终提取内容长度
  const totalPromptLength = userPrompt.length;
  const systemPromptLength = systemPrompt.length;
  
  if (import.meta.env.DEV) {
    console.log('[AI智能体] Prompt统计:');
    console.log(`  - System Prompt长度: ${systemPromptLength} 字符`);
    console.log(`  - User Prompt长度: ${totalPromptLength} 字符`);
    console.log(`  - 案例上下文长度: ${totalContextLength} 字符`);
    console.log(`  - 总Token估算: ~${Math.ceil((systemPromptLength + totalPromptLength) / 4)} tokens`);
    console.log(`  - 检索到案例数: ${relatedCases.length}`);
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

