// AI案例提取服务
// 将非结构化文本自动提取为结构化案例数据

import { AIExtractedCase, StatKey } from '../types';

// 直接使用aiService中已验证的API调用函数
import { callSilicoFlowAPI } from '../aiService';

// 调用AI API（使用aiService中已验证的函数）
const callAI = async (messages: any[], model = 'Qwen/Qwen2.5-72B-Instruct') => {
  console.log('使用aiService调用API，消息数量:', messages.length, '模型:', model);
  
  try {
    // 直接使用aiService中的callSilicoFlowAPI函数
    const result = await callSilicoFlowAPI(messages, {
      model: model || 'Qwen/Qwen2.5-72B-Instruct',
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    console.log('API调用成功，返回长度:', result.length);
    return result;
  } catch (error: any) {
    console.error('API调用失败:', error);
    
    // 如果API服务不可用，提供友好的错误提示
    if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_CLOSED')) {
      throw new Error(`API服务连接失败。\n\n可能原因：\n1. 硅基流动API服务暂时不可用\n2. API地址可能需要更新\n3. 网络连接问题\n\n建议：\n- 检查网络连接\n- 稍后重试\n- 或配置其他AI服务（OpenAI/Gemini）`);
    }
    
    throw error;
  }
};

// AI智能提取案例信息
export const extractCaseFromText = async (
  rawText: string
): Promise<AIExtractedCase> => {
  const systemPrompt = `你是一个专业的基层治理案例分析师。你的任务是从用户提供的非结构化文本中，提取出结构化的案例信息。

请仔细阅读文本，提取以下信息并以JSON格式返回：

1. **title** (string): 拟定一个简练、准确的标题（20字以内）
2. **tags** (array of strings): 提取3-5个关键词标签，如：["乡村振兴", "产业发展", "矛盾调解"]
3. **category** (string): 判断案例主要涉及的维度，必须是以下之一：
   - "economy" (经济发展)
   - "people" (民生福祉)
   - "environment" (生态环境)
   - "governance" (乡风民俗)
4. **context_summary** (string): 提取核心背景信息（200-300字），包括时间、地点、人物、基本情况
5. **conflict_detail** (string): 分析主要矛盾和冲突点（200-300字），包括：
   - 涉及的利益相关方
   - 核心争议点
   - 矛盾的复杂性
6. **resolution_outcome** (string): 总结处理结果和效果（200-300字），包括：
   - 采取的措施
   - 最终结果
   - 经验教训
7. **expert_comment** (string, optional): 从专业角度给出点评（100-200字），包括：
   - 案例的典型性
   - 可借鉴之处
   - 注意事项

要求：
- 所有文本内容要准确、客观，基于原文信息
- 不要编造或添加原文中没有的信息
- 如果某些信息不明确，可以合理推断，但要在相应字段中说明
- JSON格式必须严格正确，可以直接被JSON.parse解析
- 只返回JSON，不要其他文字

返回格式示例：
{
  "title": "某村土地流转引发的村民矛盾调解案例",
  "tags": ["土地流转", "矛盾调解", "村民自治"],
  "category": "people",
  "context_summary": "2023年，某村...",
  "conflict_detail": "主要矛盾在于...",
  "resolution_outcome": "通过...方式，最终...",
  "expert_comment": "该案例典型反映了..."
}`;

  const userPrompt = `请分析以下文本并提取案例信息：

${rawText}

请严格按照要求返回JSON格式。只返回JSON，不要其他文字。`;

  try {
    console.log('开始AI提取，文本长度:', rawText.length);
    const jsonString = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    console.log('AI返回的原始内容（前200字符）:', jsonString.substring(0, 200));

    // 解析JSON
    let extracted: any;
    try {
      // 清理可能的markdown代码块标记
      let cleanedJson = jsonString.trim();
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // 尝试直接解析
      extracted = JSON.parse(cleanedJson);
    } catch (e) {
      console.warn('直接解析失败，尝试提取JSON部分', e);
      // 如果失败，尝试提取JSON部分（AI可能返回了markdown代码块）
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || 
                       jsonString.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[1]);
      } else {
        // 尝试提取第一个 { } 之间的内容
        const braceMatch = jsonString.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          extracted = JSON.parse(braceMatch[0]);
        } else {
          console.error('无法解析的JSON内容:', jsonString.substring(0, 500));
          throw new Error('无法解析AI返回的JSON。返回内容: ' + jsonString.substring(0, 200));
        }
      }
    }

    // 验证和转换
    const result: AIExtractedCase = {
      title: extracted.title || '未命名案例',
      tags: Array.isArray(extracted.tags) ? extracted.tags : [],
      category: (extracted.category as StatKey) || 'governance',
      context_summary: extracted.context_summary || '',
      conflict_detail: extracted.conflict_detail || '',
      resolution_outcome: extracted.resolution_outcome || '',
      expert_comment: extracted.expert_comment || undefined,
    };

    // 验证category
    const validCategories: StatKey[] = ['economy', 'people', 'environment', 'governance'];
    if (!validCategories.includes(result.category)) {
      result.category = 'governance'; // 默认值
    }

    return result;
  } catch (error: any) {
    console.error('AI提取失败:', error);
    throw new Error(`AI提取失败: ${error.message}`);
  }
};

// 批量提取（如果文本包含多个案例）
export const extractMultipleCases = async (
  rawText: string
): Promise<AIExtractedCase[]> => {
  // 可以先用AI判断文本是否包含多个案例
  // 如果包含，则分段处理
  // 这里简化实现，假设一个文本对应一个案例
  const caseData = await extractCaseFromText(rawText);
  return [caseData];
};
