/**
 * 游戏专用的AI服务
 * 用于危机谈判和游戏报告生成
 * 支持多种AI提供商：硅基流动、Gemini、OpenAI
 */

import { GoogleGenAI, Type } from "@google/genai";
import { StatKey, GameState } from '@/types/game';
import { metricToStatKey, statKeyToMetric } from '@/utils/gameAdapter';
import { callSilicoFlowAPI, AIProvider, getProvider } from '@/services/ai/aiService';

const NEGOTIATION_MODEL = 'gemini-3-flash-preview';
const REPORT_MODEL = 'gemini-3-flash-preview';

// 获取API Key
const getAPIKey = (): string => {
  return import.meta.env.VITE_SILICOFLOW_API_KEY || 
         (typeof process !== 'undefined' && process.env?.SILICOFLOW_API_KEY) ||
         import.meta.env.VITE_GEMINI_API_KEY || 
         (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
         import.meta.env.VITE_OPENAI_API_KEY || 
         (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY) ||
         '';
};

// 危机提示词（适配governance）
const CRISIS_PROMPTS: Record<string, string> = {
  economy: "你是一个愤怒的村民代表。村集体账上没钱了，分红也没了，大家日子过不下去了。你现在非常愤怒，要求书记给个说法！",
  people: "你是一个哭诉的老大娘。村里的卫生所没药，路也烂得没人修，孙子生病都送不出去。你觉得被政府抛弃了。",
  environment: "你是一个养鱼专业户。河水黑得发臭，你的鱼全翻白肚死了！你手里拿着死鱼，情绪极度激动，认为是书记引进的工厂害的。",
  governance: "你是一个德高望重的族长。现在的年轻人整天打牌赌博，也不尊老爱幼，村里的风气坏透了。你对书记的工作非常失望。"
};

// Response schema for negotiation logic
const NegotiationSchema = {
  type: Type.OBJECT,
  properties: {
    npcResponse: {
      type: Type.STRING,
      description: "The NPC response text, should be natural and fit the character persona.",
    },
    newAngerLevel: {
      type: Type.INTEGER,
      description: "Updated anger level from 0 to 100.",
    },
    negotiationStatus: {
      type: Type.STRING,
      description: "SUCCESS, FAILURE, or CONTINUE based on the user response quality.",
    },
  },
  required: ["npcResponse", "newAngerLevel", "negotiationStatus"],
};

export const startCrisisNegotiation = async (
  metric: StatKey, // 使用StatKey (governance)
  currentAnger: number,
  userMessage: string,
  history: { role: string; text: string }[]
) => {
  try {
    const provider = getProvider();
    const apiKey = getAPIKey();
    
    if (!apiKey) {
      throw new Error('API Key not found. Please set VITE_SILICOFLOW_API_KEY, VITE_GEMINI_API_KEY, or VITE_OPENAI_API_KEY');
    }

    const systemPrompt = `
      你是一个中国基层治理游戏中的危机谈判NPC。
      角色背景：${CRISIS_PROMPTS[metric]}
      当前愤怒值：${currentAnger}/100。
      
      用户（村书记）正在试图安抚你。
      评估标准：
      1. 共情度：是否承认了情绪？
      2. 实际性：解决方案是否切合实际？
      3. 策略性：是否有立即的缓解措施？
      4. 合规性：是否合法？（贿赂或非法承诺会导致立即失败）。

      真诚和具体计划会降低愤怒值。
      官僚或敷衍的回应会维持或增加愤怒值。
      请以JSON格式返回结果。
    `;

    // 构建对话历史
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    history.forEach(h => {
      messages.push({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.text
      });
    });

    messages.push({ role: 'user', content: userMessage });

    // 根据提供商选择不同的调用方式
    if (provider === 'silicoflow') {
      // 使用硅基流动API（兼容OpenAI格式）
      const response = await callSilicoFlowAPI(messages, {
        model: 'Qwen/Qwen2.5-72B-Instruct',
        temperature: 0.8,
        max_tokens: 1000
      });

      // 尝试从响应中提取JSON
      let jsonStr = response;
      if (typeof response === 'string') {
        // 尝试提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }

      try {
        const result = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
        return {
          npcResponse: result.npcResponse || result.response || "(NPC正在仔细倾听...)",
          newAngerLevel: result.newAngerLevel !== undefined ? result.newAngerLevel : Math.max(0, currentAnger - 15),
          negotiationStatus: result.negotiationStatus || result.status || "CONTINUE"
        };
      } catch (e) {
        // 如果解析失败，尝试从文本中提取信息
        return {
          npcResponse: typeof jsonStr === 'string' ? jsonStr : "(NPC正在仔细倾听...)",
          newAngerLevel: Math.max(0, currentAnger - 15),
          negotiationStatus: "CONTINUE"
        };
      }
    } else if (provider === 'gemini') {
      // 使用Gemini API
      const ai = new GoogleGenAI({ apiKey });
      
      const chatHistory = history.map(h => ({
        role: h.role as 'user' | 'model',
        parts: [{ text: h.text }]
      }));

      chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const response = await ai.models.generateContent({
        model: NEGOTIATION_MODEL,
        contents: chatHistory,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: NegotiationSchema,
        },
      });

      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr.trim());
    } else {
      // OpenAI或其他兼容OpenAI的API
      const response = await callSilicoFlowAPI(messages, {
        model: 'gpt-4',
        temperature: 0.8,
        max_tokens: 1000
      });

      let jsonStr = response;
      if (typeof response === 'string') {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }

      try {
        const result = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
        return {
          npcResponse: result.npcResponse || result.response || "(NPC正在仔细倾听...)",
          newAngerLevel: result.newAngerLevel !== undefined ? result.newAngerLevel : Math.max(0, currentAnger - 15),
          negotiationStatus: result.negotiationStatus || result.status || "CONTINUE"
        };
      } catch (e) {
        return {
          npcResponse: typeof jsonStr === 'string' ? jsonStr : "(NPC正在仔细倾听...)",
          newAngerLevel: Math.max(0, currentAnger - 15),
          negotiationStatus: "CONTINUE"
        };
      }
    }
  } catch (error) {
    console.error("Negotiation API Error:", error);
    return {
      npcResponse: "(系统：NPC正在仔细倾听...)",
      newAngerLevel: Math.max(0, currentAnger - 15),
      negotiationStatus: "CONTINUE"
    };
  }
};

export const generateGameReport = async (gameState: GameState) => {
  try {
    const provider = getProvider();
    const apiKey = getAPIKey();
    
    if (!apiKey) {
      throw new Error('API Key not found. Please set VITE_SILICOFLOW_API_KEY, VITE_GEMINI_API_KEY, or VITE_OPENAI_API_KEY');
    }

    const prompt = `
      为玩家生成一份"基层治理报告"。
      角色：村书记。
      
      游戏数据：
      各项指标：${JSON.stringify(gameState.currentStats)}
      决策次数：${gameState.history.length}
      游戏结果：${gameState.gameResult}
      当前阶段：第${gameState.currentStageIndex + 1}阶段

      请用中文Markdown格式提供报告，包含：
      1. 治理风格画像（如：激进型、平衡型等）
      2. 关键决策回顾（分析1-2个重要转折点）
      3. AI导师建议（基于乡村振兴政策）
      4. 推荐案例学习（如安吉、十八洞村等真实案例）

      语调应该具有教育性和专业性。
    `;

    // 根据提供商选择不同的调用方式
    if (provider === 'silicoflow') {
      // 使用硅基流动API
      const messages = [
        { role: 'system', content: '你是一个基层治理专家，擅长分析村书记的治理决策。' },
        { role: 'user', content: prompt }
      ];

      const response = await callSilicoFlowAPI(messages, {
        model: 'Qwen/Qwen2.5-72B-Instruct',
        temperature: 0.7,
        max_tokens: 2000
      });

      return typeof response === 'string' ? response : "## 报告生成失败";
    } else if (provider === 'gemini') {
      // 使用Gemini API
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: REPORT_MODEL,
        contents: prompt,
      });

      return response.text || "## 报告生成失败";
    } else {
      // OpenAI或其他兼容OpenAI的API
      const messages = [
        { role: 'system', content: '你是一个基层治理专家，擅长分析村书记的治理决策。' },
        { role: 'user', content: prompt }
      ];

      const response = await callSilicoFlowAPI(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000
      });

      return typeof response === 'string' ? response : "## 报告生成失败";
    }
  } catch (error) {
    console.error("Report Generation Error:", error);
    return "## 系统错误\n无法生成报告。";
  }
};



