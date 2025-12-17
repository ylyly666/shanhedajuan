import { Card, GameStats } from '@/types';

// API配置 - 支持多种AI服务
export type AIProvider = 'silicoflow' | 'gemini' | 'openai';

const getAPIKey = (): string => {
  // 优先使用硅基流动API（支持Vite环境变量）
  return import.meta.env.VITE_SILICOFLOW_API_KEY || 
         (typeof process !== 'undefined' && process.env?.SILICOFLOW_API_KEY) ||
         import.meta.env.VITE_GEMINI_API_KEY || 
         (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
         import.meta.env.VITE_OPENAI_API_KEY || 
         (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) ||
         '';
};

export const getProvider = (): AIProvider => {
  if (import.meta.env.VITE_SILICOFLOW_API_KEY || (typeof process !== 'undefined' && process.env?.SILICOFLOW_API_KEY)) return 'silicoflow';
  if (import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)) return 'gemini';
  if (import.meta.env.VITE_OPENAI_API_KEY || (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY)) return 'openai';
  return 'silicoflow'; // 默认
};

// 硅基流动API调用（兼容OpenAI格式）
export const callSilicoFlowAPI = async (messages: any[], options: { model?: string; temperature?: number; max_tokens?: number } = {}) => {
  const apiKey = getAPIKey();
  const baseURL = import.meta.env.VITE_SILICOFLOW_BASE_URL || 
                  (typeof process !== 'undefined' && process.env?.SILICOFLOW_BASE_URL) ||
                  'https://api.siliconflow.cn/v1'; // 正确的硅基流动API地址
  
  console.log('callSilicoFlowAPI - 请求配置:', {
    baseURL,
    model: options.model || 'Qwen/Qwen2.5-72B-Instruct',
    messagesCount: messages.length
  });

  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'Qwen/Qwen2.5-72B-Instruct', // 使用硅基流动推荐的模型
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
      }),
    });

    console.log('callSilicoFlowAPI - 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.text();
      console.error('callSilicoFlowAPI - API错误:', error);
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('callSilicoFlowAPI - 成功');
    return data.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('callSilicoFlowAPI - 请求异常:', error);
    // 如果是连接错误，提供更详细的提示
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`网络请求失败: ${error.message}\n\n可能原因：\n1. API服务暂时不可用\n2. 网络连接问题\n3. API地址可能需要更新\n\n请检查：\n- 网络连接是否正常\n- 硅基流动服务是否可用\n- 尝试使用其他AI服务（OpenAI/Gemini）`);
    }
    throw error;
  }
};

// Gemini API调用（保留原有功能）
const callGeminiAPI = async (prompt: string, options: { model?: string; responseSchema?: any } = {}) => {
  const { GoogleGenAI, Type } = await import("@google/genai");
  const apiKey = getAPIKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: options.model || 'gemini-2.5-flash',
    contents: prompt,
    config: options.responseSchema ? {
      responseMimeType: "application/json",
      responseSchema: options.responseSchema,
    } : undefined,
  });
  
  return response.text || '';
};

// 通用AI调用接口
const callAI = async (prompt: string, options: { 
  model?: string; 
  temperature?: number;
  responseSchema?: any;
  systemPrompt?: string;
} = {}): Promise<string> => {
  const provider = getProvider();
  const apiKey = getAPIKey();
  
  if (!apiKey) {
    throw new Error("未配置API Key，请在.env.local中设置SILICOFLOW_API_KEY或GEMINI_API_KEY");
  }

  if (provider === 'silicoflow' || provider === 'openai') {
    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    
    return await callSilicoFlowAPI(messages, {
      model: options.model || 'gpt-4',
      temperature: options.temperature || 0.7,
    });
  } else {
    // Gemini
    const fullPrompt = options.systemPrompt 
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;
    return await callGeminiAPI(fullPrompt, {
      model: options.model || 'gemini-2.5-flash',
      responseSchema: options.responseSchema,
    });
  }
};

// --- AI Copilot: Generate Cards from Text ---
export const generateCardsFromDoc = async (text: string): Promise<Card[]> => {
  const prompt = `
你是一个专业的基层治理培训设计师。
请根据以下提供的政策文档或案例描述，提取出核心的"两难抉择"场景，并生成游戏卡牌数据。

文档内容：
${text.substring(0, 8000)}

要求：
1. 生成 1-3 张关联度最高的卡牌。
2. 选项必须体现两难（如：发展经济 vs 保护环境，短期利益 vs 长期规划）。
3. 数值变化 (delta) 范围在 -20 到 +20 之间。
4. NPC名字可以是虚构的，如"李大爷"、"王主任"。
5. 返回 JSON 格式，格式如下：
[
  {
    "id": "card_xxx",
    "npcName": "李书记",
    "text": "事件描述",
    "options": {
      "left": {
        "text": "选项A",
        "delta": { "economy": -10, "people": 5, "environment": 15, "governance": 0 }
      },
      "right": {
        "text": "选项B",
        "delta": { "economy": 20, "people": 5, "environment": -20, "governance": 0 }
      }
    }
  }
]
`;

  try {
    const response = await callAI(prompt, {
      systemPrompt: "你是一个专业的基层治理培训设计师，擅长将真实案例转化为游戏卡牌。",
      temperature: 0.7,
    });

    // 尝试解析JSON（可能包含markdown代码块）
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];
    }

    const json = JSON.parse(jsonStr);
    const cards = Array.isArray(json) ? json : [json];
    
    return cards.map((c: any) => ({
      ...c,
      npcId: 'npc_secretary', // Default placeholder
      tags: ['AI生成'],
      id: c.id || `card_${Date.now()}_${Math.random()}`,
    }));

  } catch (error) {
    console.error("Error generating cards:", error);
    return [];
  }
};

// --- Crisis Negotiation Judge ---
export interface NegotiationResult {
  success: boolean;
  score: number; // 0-100 (Angry -> Happy)
  npcResponse: string;
  feedback: string;
}

export const evaluateNegotiation = async (
  history: { role: string, text: string }[],
  npcContext: string,
  statType: string,
  judgeWeights?: { empathy: number; rationality: number; compliance: number }
): Promise<NegotiationResult> => {
  const provider = getProvider();
  const apiKey = getAPIKey();
  
  if (!apiKey) {
    return { success: false, score: 0, npcResponse: "AI Error: No Key", feedback: "请配置API Key" };
  }

  const statLabels: Record<string, string> = {
    economy: '经济发展',
    people: '民生福祉',
    environment: '生态环境',
    governance: '乡风民俗'
  };

  const prompt = `
你是一个基层治理危机谈判的AI裁判和NPC。

背景：
- 玩家扮演驻村第一书记
- 当前危机：${statLabels[statType] || statType}指标归零
- NPC性格：${npcContext}
${judgeWeights ? `- 判分权重：共情度${judgeWeights.empathy}%，合理性${judgeWeights.rationality}%，合规性${judgeWeights.compliance}%` : ''}

对话历史：
${history.map(h => `${h.role === 'user' ? '玩家' : 'NPC'}: ${h.text}`).join('\n')}

任务：
1. 作为NPC，对玩家的最后一条消息做出回应。要情绪化、具体、贴近中国农村现实。
2. 作为裁判，评估玩家的回应：
   - 共情度：是否接纳了群众情绪？（打官腔、讲大道理则扣分）
   - 合理性：解决方案是否切合实际？（直接发巨款、非法承诺则判负）
   - 策略性：是否有止损措施？是否有明确的时间节点承诺？
   - 政策红线：是否违规？（私下转账、暴力威胁则直接失败）

${history.length === 1 ? '这是对话开始，NPC应该以愤怒的指责开场。' : ''}

请以JSON格式返回：
{
  "npcResponse": "NPC的回应文本",
  "score": 0-100的分数（0=愤怒，100=平静，>60为通过）,
  "feedback": "对玩家回应的分析",
  "isPass": true/false（是否通过）
}
`;

  try {
    const response = await callAI(prompt, {
      systemPrompt: "你是一个专业的基层治理培训专家，擅长评估危机谈判中的沟通技巧。",
      temperature: 0.8,
    });

    // 解析JSON
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];
    }

    const result = JSON.parse(jsonStr);
    return {
      success: result.isPass || false,
      score: result.score || 0,
      npcResponse: result.npcResponse || "...",
      feedback: result.feedback || ""
    };
  } catch (e) {
    console.error(e);
    return { success: false, score: 50, npcResponse: "系统错误，请重试", feedback: "Error" };
  }
};

// --- Final Report Generation ---
export const generateGameReport = async (
  stats: GameStats,
  history: any[]
): Promise<string> => {
  const apiKey = getAPIKey();
  
  if (!apiKey) {
    return "# 模拟报告\n\n请配置 API Key 以获取完整 AI 分析报告。\n\n在 .env.local 文件中设置：\n- SILICOFLOW_API_KEY=your_key\n或\n- GEMINI_API_KEY=your_key";
  }

  const statLabels: Record<string, string> = {
    economy: '💰 经济发展',
    people: '👥 民生福祉',
    environment: '🌲 生态环境',
    governance: '🚩 乡风民俗'
  };

  const prompt = `
你是一位资深的基层治理培训专家。

请根据玩家的游戏数据，生成一份《乡村振兴治理报告》。

最终指标：
${Object.entries(stats).map(([k, v]) => `${statLabels[k]}: ${v}`).join('\n')}

关键决策历史（最近10条）：
${JSON.stringify(history.slice(-10), null, 2)}

请生成一份Markdown格式的报告，包含以下部分：

1. **治理画像**
   分析玩家的治理倾向（如"激进发展型"、"维稳平衡型"、"甩手掌柜型"等），用雷达图描述。

2. **关键决策复盘**
   分析2-3个导致数值剧烈波动的关键决策点，进行影响链分析，并针对核心成败点进行针对性评述。

3. **专家建议**
   指出可以改进的地方，提供具体的建议。

4. **案例推荐**
   根据失败原因或薄弱项，推荐真实案例学习材料。例如：
   - 生态治理失败，推荐"两山理论在安吉的实践"正面案例
   - 或"某地违规填海警示录"反面教材
   
   请提供具体的案例名称、地点和简要说明。

报告要求：
- 使用Markdown格式
- 语言专业但易懂
- 结合中国基层治理实际
- 提供可操作的建议
`;

  try {
    const response = await callAI(prompt, {
      systemPrompt: "你是一位资深的基层治理培训专家，擅长分析决策过程并提供专业建议。",
      temperature: 0.7,
    });
    
    return response || "报告生成失败。";
  } catch (e) {
    console.error(e);
    return "报告生成出错，请检查API配置。";
  }
};


