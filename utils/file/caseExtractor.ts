// AI 案例提取：将非结构化文本转为结构化案例数据
import { AIExtractedCase, StatKey } from '@/types';
import { callSilicoFlowAPI } from '@/services/ai/aiService';

// 调用 AI（复用 aiService）
const callAI = async (messages: any[], model = 'Qwen/Qwen2.5-72B-Instruct') => {
  try {
    const result = await callSilicoFlowAPI(messages, {
      model: model || 'Qwen/Qwen2.5-72B-Instruct',
      temperature: 0.3,
      max_tokens: 2000,
    });
    return result;
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_CLOSED')) {
      throw new Error(
        `AI 服务连接失败。\n\n可能原因：\n1. API 服务不可用\n2. API 地址需更新\n3. 网络问题\n\n建议：检查网络或稍后重试，或切换其他 AI 服务。`
      );
    }
    throw error;
  }
};

// 单条案例提取
export const extractCaseFromText = async (rawText: string): Promise<AIExtractedCase> => {
  const systemPrompt = `你是基层治理案例分析师，请从用户文本中提取结构化信息并返回 JSON：
字段：
- title: 简洁标题（<=20字）
- tags: 3-5 个关键词（数组格式）
- category: economy(经济发展)|people(民生福祉)|environment(生态环境)|civility(乡风民俗/基层治理)
- author_display: 上传者/来源身份（如"政府"、"基层干部"、"村民"等，如果文本中有提及身份则提取，否则留空）
- context_summary: 背景摘要（事件起因、背景）
- conflict_detail: 矛盾详情（核心冲突、困难点）
- resolution_outcome: 解决结果（处理措施及成效）
- expert_comment: 专家点评（经验总结或警示意义，可选）
要求：不编造；若缺失则留空；仅返回 JSON 可被 JSON.parse 解析。`;

  const userPrompt = `请分析并提取案例信息，返回 JSON：
${rawText}`;

  const jsonString = await callAI(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    undefined
  );

  // 解析 JSON，容错处理 markdown 代码块
  let cleaned = jsonString.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
  }

  let extracted: any;
  try {
    extracted = JSON.parse(cleaned);
  } catch {
    const jsonMatch =
      jsonString.match(/```json\s*([\s\S]*?)\s*```/i) ||
      jsonString.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      extracted = JSON.parse(jsonMatch[1]);
    } else {
      const brace = jsonString.match(/\{[\s\S]*\}/);
      if (brace) {
        extracted = JSON.parse(brace[0]);
      } else {
        throw new Error('无法解析 AI 返回的 JSON');
      }
    }
  }

  const result: AIExtractedCase = {
    title: extracted.title || '未命名案例',
    tags: Array.isArray(extracted.tags) ? extracted.tags : [],
    category: (extracted.category as StatKey) || 'civility',
    author_display: extracted.author_display || undefined,
    context_summary: extracted.context_summary || '',
    conflict_detail: extracted.conflict_detail || '',
    resolution_outcome: extracted.resolution_outcome || '',
    expert_comment: extracted.expert_comment || undefined,
  };

  const valid: StatKey[] = ['economy', 'people', 'environment', 'civility'];
  if (!valid.includes(result.category)) {
    result.category = 'civility';
  }

  return result;
};

// 批量提取（简单实现：单条包装为数组）
export const extractMultipleCases = async (rawText: string): Promise<AIExtractedCase[]> => {
  const single = await extractCaseFromText(rawText);
  return [single];
};
