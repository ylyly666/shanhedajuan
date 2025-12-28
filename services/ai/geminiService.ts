import { GoogleGenAI, Schema, Type } from "@google/genai";
import { Card, GameStats, NpcAsset } from '@/types';

const apiKey = process.env.API_KEY || '';

// --- AI Copilot: Generate Cards from Text ---
export const generateCardsFromDoc = async (text: string): Promise<Card[]> => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const cardSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        npcName: { type: Type.STRING },
        text: { type: Type.STRING },
        options: {
          type: Type.OBJECT,
          properties: {
            left: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                delta: {
                  type: Type.OBJECT,
                  properties: {
                    economy: { type: Type.NUMBER },
                    people: { type: Type.NUMBER },
                    environment: { type: Type.NUMBER },
                    civility: { type: Type.NUMBER },
                  }
                }
              }
            },
            right: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                delta: {
                  type: Type.OBJECT,
                  properties: {
                    economy: { type: Type.NUMBER },
                    people: { type: Type.NUMBER },
                    environment: { type: Type.NUMBER },
                    civility: { type: Type.NUMBER },
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const prompt = `
    你是一个专业的基层治理培训设计师。
    请根据以下提供的政策文档或案例描述，提取出核心的“两难抉择”场景，并生成游戏卡牌数据。
    
    文档内容：
    ${text.substring(0, 8000)}

    要求：
    1. 生成 1-3 张关联度最高的卡牌。
    2. 选项必须体现两难（如：发展经济 vs 保护环境，短期利益 vs 长期规划）。
    3. 数值变化 (delta) 范围在 -20 到 +20 之间。
    4. NPC名字可以是虚构的，如“李大爷”、“王主任”。
    5. 返回 JSON 格式。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cardSchema,
      },
    });

    const json = JSON.parse(response.text || '[]');
    // Add default NPC ID and tags post-generation
    return json.map((c: any) => ({
      ...c,
      npcId: 'npc_secretary', // Default placeholder
      tags: ['AI生成']
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
  statType: string
): Promise<NegotiationResult> => {
  if (!apiKey) return { success: false, score: 0, npcResponse: "AI Error: No Key", feedback: "Check API Key" };

  const ai = new GoogleGenAI({ apiKey });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      npcResponse: { type: Type.STRING, description: "The NPC's verbal response to the player." },
      score: { type: Type.NUMBER, description: "Current anger level reversed (0=Furious, 100=Calm). Pass if > 60." },
      feedback: { type: Type.STRING, description: "Analysis of the player's empathy, rationality, and strategy." },
      isPass: { type: Type.BOOLEAN, description: "Whether the crisis is resolved." }
    }
  };

  const prompt = `
    Context: You are the AI Judge and the NPC for a crisis negotiation in a Chinese village civility game.
    The player is the Village Secretary.
    The specific crisis is regarding: ${statType} (Value dropped to 0).
    NPC Personality/Context: ${npcContext}.
    
    Conversation History:
    ${JSON.stringify(history)}

    Task:
    1. Act as the NPC and respond to the player's last message. Be emotional, specific, and grounded in rural Chinese reality.
    2. Act as the Judge (System) to score the player's response based on:
       - Empathy (Did they listen?)
       - Rationality (Is the solution realistic?)
       - Strategy (Did they offer a timeline/compromise?)
       - Policy Red Lines (Did they promise illegal money or use threats? If so, score 0).
    
    If this is the start of the conversation, the NPC should start with an angry accusation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      success: result.isPass,
      score: result.score,
      npcResponse: result.npcResponse,
      feedback: result.feedback
    };
  } catch (e) {
    console.error(e);
    return { success: false, score: 50, npcResponse: "...", feedback: "Error" };
  }
};

// --- Final Report Generation ---
export const generateGameReport = async (
  stats: GameStats,
  history: any[]
): Promise<string> => {
  if (!apiKey) return "# 模拟报告\n请配置 API Key 以获取完整 AI 分析报告。";

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Role: Senior Governance Training Expert.
    Task: Generate a "Rural Revitalization Governance Report" based on the player's game session.
    
    Final Stats: ${JSON.stringify(stats)}
    Decision History (Key moments): ${JSON.stringify(history.slice(-10))}

    Report Structure (Markdown):
    1. **Governance Profile**: (e.g., "Radical Developer", "Balanced Peacemaker").
    2. **Key Decisions Review**: Analyze 2-3 specific choices and their ripple effects.
    3. **Expert Advice**: What could be improved? 
    4. **Case Study Recommendation**: Recommend a real-world Chinese rural civility case study (e.g., Anji, Shibadong Village) that matches their playstyle or failure point.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Report generation failed.";
  } catch (e) {
    return "Error generating report.";
  }
};
