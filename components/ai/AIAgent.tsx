import React, { useState, useRef, useEffect } from 'react';
import { searchSimilarCases, getCasesFromSupabase } from '@/services/database/supabase';
import { generateResponseWithRAG } from '@/services/ai/aiAgent';
import { KnowledgeBaseCase, StatKey } from '@/types';

interface AIAgentProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedCases?: KnowledgeBaseCase[];
  timestamp: Date;
}

const AIAgent: React.FC<AIAgentProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是《山河答卷》AI智能体，基于乡村振兴案例库为您提供专业咨询。\n\n我可以帮您：\n📚 检索相关案例\n💡 提供决策建议\n📖 解答基层治理问题\n🔍 分析案例经验\n\n请告诉我您想了解什么？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 使用RAG生成回复
      const response = await generateResponseWithRAG(input.trim());
      
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        relatedCases: response.relatedCases,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `抱歉，处理您的请求时出现错误：{error.message}\n\n请稍后重试或尝试重新表述您的问题。`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // 快速问题模版
  const quickQuestions = [
    '如何平衡经济发展与环境保护？',
    '村民矛盾调解有哪些经验？',
    '乡村振兴中的典型案例',
    '乡风民俗建设的最佳实践',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-stone-50 via-red-50/20 to-stone-100 flex flex-col overflow-hidden">
      {/* Header - 固定在顶部 */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-stone-200 flex-shrink-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-stone-600 hover:text-stone-800 transition-colors font-bold"
            >
              ← 返回首页
            </button>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              <span>AI智能体</span>
            </h1>
          </div>
          <div className="text-sm text-stone-500">
            基于案例库的 RAG 检索与对话
          </div>
        </div>
      </div>

      {/* Messages Area - 可滚动区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                  message.role === 'user'
                    ? 'bg-red-800 text-white'
                    : 'bg-white text-stone-900 border border-stone-200'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>

                {/* 相关案例 */}
                {message.relatedCases && message.relatedCases.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <div className="text-sm font-bold text-stone-700 mb-2">
                      📚 相关案例 ({message.relatedCases.length})
                    </div>
                    <div className="space-y-2">
                      {message.relatedCases.map((caseItem) => (
                        <div
                          key={caseItem.id}
                          className="bg-stone-50 rounded-lg p-3 border border-stone-200 hover:bg-stone-100 transition-colors cursor-pointer"
                          onClick={() => {
                            // 可以展开查看详情
                            alert(`案例：${caseItem.title}\n\n${caseItem.context_summary.substring(0, 200)}...`);
                          }}
                        >
                          <div className="font-bold text-sm text-stone-900 mb-1">
                            {caseItem.title}
                          </div>
                          <div className="text-xs text-stone-600 line-clamp-2">
                            {caseItem.context_summary}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow-md border border-stone-200">
                <div className="flex items-center gap-2 text-stone-600">
                  <div className="w-5 h-5 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></div>
                  <span>AI正在思考...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions - 固定在输入框上方 */}
      {messages.length === 1 && (
        <div className="px-4 py-4 bg-white/50 border-t border-stone-200 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="text-sm font-bold text-stone-600 mb-3">💡 快速提问：</div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="px-4 py-2 bg-white border border-stone-300 rounded-full text-sm text-stone-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area - 固定在底部 */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-stone-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入您的问题..."
              className="flex-1 p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-all shadow-md hover:shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '发送'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;

