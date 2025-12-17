import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startCrisisNegotiation } from '@/services/gameGeminiService';
import { StatKey } from '@/types/game';
import { statKeyToMetric, MetricType } from '@/utils/gameAdapter';

interface CrisisNegotiationProps {
  metric: StatKey; // 使用StatKey (governance)
  onResult: (success: boolean) => void;
}

export const CrisisNegotiation: React.FC<CrisisNegotiationProps> = ({ metric, onResult }) => {
  const [stage, setStage] = useState<'decision' | 'chat'>('decision');
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [anger, setAnger] = useState(100);
  const [turns, setTurns] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 转换为MetricType (culture)
  const metricType = statKeyToMetric(metric);

  const metricNameMap: Record<string, string> = {
    economy: '经济发展',
    people: '民生福祉',
    environment: '生态环境',
    culture: '乡风民俗',
    governance: '乡风民俗'
  };

  const initialPrompts: Record<string, string> = {
    economy: "书记！村集体账上没钱了，答应的分红全落空了！你让我们怎么过年？你是不是把钱都挪用了！",
    people: "我家这老房子漏得没法住人，找你多少次了？每次都是'正在协调'，我看你就是想耗死我们！",
    environment: "看看这满河的死鱼！这就是你引进的'高科技'工厂？今天不把厂子关了，你就别想走出这个村！",
    culture: "现在的村子还有点人气吗？到处都是赌博的、混日子的！老祖宗留下的规矩全毁在你手里了！",
    governance: "现在的村子还有点人气吗？到处都是赌博的、混日子的！老祖宗留下的规矩全毁在你手里了！"
  };

  useEffect(() => {
    if (stage === 'chat') {
      setMessages([{ role: 'model', text: initialPrompts[metric] || initialPrompts['governance'] }]);
    }
  }, [stage, metric]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const result = await startCrisisNegotiation(metric, anger, userMsg, messages);
    
    setLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: result.npcResponse }]);
    setAnger(result.newAngerLevel);
    
    const newTurns = turns + 1;
    setTurns(newTurns);

    if (result.negotiationStatus === 'SUCCESS' || result.newAngerLevel <= 0) {
      setTimeout(() => onResult(true), 2000);
    } else if (result.negotiationStatus === 'FAILURE' || (newTurns >= 3 && result.newAngerLevel > 0)) {
      setTimeout(() => onResult(false), 2000);
    }
  };

  if (stage === 'decision') {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-16 h-16 bg-gov-red rounded-full flex items-center justify-center mb-6 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-white text-2xl font-song font-bold mb-4">危机状态：{metricNameMap[metric] || metricNameMap['governance']}失控</h2>
        <p className="text-white/70 font-fangsong text-lg mb-10 leading-relaxed">
          {metricNameMap[metric] || metricNameMap['governance']}指标已降至临界点以下。大批情绪激动的群众正聚集在村委会门口，事态极其严峻！
        </p>
        <div className="flex flex-col w-full gap-4 max-w-xs">
          <button 
            onClick={() => setStage('chat')}
            className="w-full py-4 bg-white text-gov-gray rounded-xl font-song font-bold text-xl active:scale-95 transition-transform"
          >
            挺身而出 (开启谈判)
          </button>
          <button 
            onClick={() => onResult(false)}
            className="w-full py-4 border-2 border-white/30 text-white/50 rounded-xl font-song text-lg"
          >
            接受问责 (引咎辞职)
          </button>
          <div className="text-white/30 text-xs mt-2 font-song italic">注意：今日尚余 3 次调解机会</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gov-paper rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] relative">
        <div className="bg-gov-red text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-70 font-song uppercase">Crisis Management</span>
            <h2 className="font-song text-lg font-bold">现场协调：{metricNameMap[metric] || metricNameMap['governance']}</h2>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] opacity-70 font-song">剩余轮次</span>
             <span className="font-typewriter text-xl">{3 - turns}</span>
          </div>
        </div>

        <div className="h-6 bg-gray-300 w-full relative">
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: `${anger}%` }}
            className={`h-full transition-all duration-700 ${anger > 60 ? 'bg-red-600' : anger > 30 ? 'bg-orange-500' : 'bg-green-600'}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-[10px] font-black text-white mix-blend-difference tracking-widest uppercase">
               NPC Anger: {anger}%
             </span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper-texture">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 text-sm font-song leading-relaxed shadow-md ${
                msg.role === 'user' 
                  ? 'bg-gov-gray text-gov-paper rounded-2xl rounded-tr-none' 
                  : 'bg-white text-gov-gray border border-gov-gray/10 rounded-2xl rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/50 px-4 py-2 rounded-full text-[10px] font-song italic text-gov-gray/60 animate-pulse">
                对方正在怒吼/思考中...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-200 shadow-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请组织语言解释、安抚或给出方案..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gov-gray/20 font-song"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-gov-gray text-gov-paper px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
            >
              提交
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

