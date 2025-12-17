import React from 'react';
import { motion } from 'framer-motion';
import { MetricType } from '@/utils/gameAdapter';

interface PhaseBriefingProps {
  metrics: Record<MetricType, number>;
  kpi: Partial<Record<MetricType, number>>;
  onComplete: (success: boolean) => void;
}

export const PhaseBriefing: React.FC<PhaseBriefingProps> = ({ metrics, kpi, onComplete }) => {
  const results = Object.entries(kpi).map(([key, target]) => {
    const current = metrics[key as MetricType];
    const pass = current >= (target as number);
    return { key: key as MetricType, current, target: target as number, pass };
  });

  const allPass = results.every(r => r.pass);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 bg-gov-paper z-50 p-8 flex flex-col"
    >
      <div className="border-4 border-gov-gray/20 p-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-song font-bold text-center mb-8 border-b-2 border-gov-gray pb-4">阶段政务考核简报</h2>
        
        <div className="space-y-6 flex-1">
          {results.map((res, i) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={res.key} 
              className="flex items-center justify-between p-4 bg-white/40 rounded-lg shadow-sm"
            >
              <div>
                <div className="font-song font-bold text-lg">
                  {{economy:'经济发展', people:'民生福祉', environment:'生态环境', culture:'乡风民俗'}[res.key]}
                </div>
                <div className="font-typewriter text-sm opacity-60">
                  当前: {res.current} / 目标: {res.target}
                </div>
              </div>
              <div className={`font-song font-black text-xl ${res.pass ? 'text-green-700' : 'text-gov-red'}`}>
                {res.pass ? '【达标】' : '【不合格】'}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="font-fangsong text-lg italic opacity-80">
            {allPass ? "阶段任务圆满完成，即将进入下一阶段深耕。" : "部分关键指标未能达成，基层矛盾正在积压..."}
          </p>
          <button 
            onClick={() => onComplete(allPass)}
            className={`w-full py-4 rounded-xl font-song text-xl shadow-lg active:scale-95 transition-transform ${
              allPass ? 'bg-gov-gray text-gov-paper' : 'bg-gov-red text-white'
            }`}
          >
            {allPass ? "继续前进" : "处理危机"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

