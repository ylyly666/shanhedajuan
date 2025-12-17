import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { MetricType } from '@/utils/gameAdapter';

interface GameReportProps {
  report: string;
  loading: boolean;
  metrics: Record<MetricType, number>;
  onRestart?: () => void;
}

export const GameReport: React.FC<GameReportProps> = ({ report, loading, metrics, onRestart }) => {
  const renderRadar = () => {
    const size = 240;
    const center = size / 2;
    const radius = size * 0.4;
    const keys: MetricType[] = ['economy', 'people', 'environment', 'culture'];
    const labels = ['经济', '民生', '生态', '乡风'];
    
    const points = keys.map((key, i) => {
      const angle = (i * 90 - 90) * (Math.PI / 180);
      const val = metrics[key] / 100;
      const x = center + radius * val * Math.cos(angle);
      const y = center + radius * val * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const bgPoints = keys.map((_, i) => {
      const angle = (i * 90 - 90) * (Math.PI / 180);
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="flex flex-col items-center my-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
          {/* Base shape */}
          <polygon points={bgPoints} fill="none" stroke="#2c2c2c" strokeWidth="1" strokeDasharray="4" opacity="0.2" />
          <line x1={center} y1={center-radius} x2={center} y2={center+radius} stroke="#2c2c2c" opacity="0.1" />
          <line x1={center-radius} y1={center} x2={center+radius} y2={center} stroke="#2c2c2c" opacity="0.1" />
          
          {/* Data shape */}
          <motion.polygon 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.6, scale: 1 }}
            points={points} 
            fill="#b91c1c" 
            stroke="#b91c1c" 
            strokeWidth="2" 
          />
          
          {/* Labels */}
          {labels.map((label, i) => {
            const angle = (i * 90 - 90) * (Math.PI / 180);
            const x = center + (radius + 20) * Math.cos(angle);
            const y = center + (radius + 20) * Math.sin(angle);
            return (
              <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="font-song font-bold text-xs fill-gov-gray">
                {label}
              </text>
            );
          })}
        </svg>
        <div className="font-song text-sm opacity-60 mt-2">治理倾向评估图</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="absolute inset-0 bg-gov-paper flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 border-4 border-gov-gray border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-song font-bold mb-2">正在撰写《乡村振兴治理报告》</h2>
        <p className="font-fangsong opacity-60">AI 正在深度解析您的每一项决策及其长远影响...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 bg-gov-paper overflow-y-auto p-6 pb-20 z-40"
    >
      <div className="bg-white/40 border-2 border-gov-gray/10 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
        <h1 className="text-2xl font-song font-bold text-center mb-2">山河答卷 · 终局报告</h1>
        <div className="text-center font-typewriter text-xs opacity-40 mb-6 border-b border-gov-gray/10 pb-4">
          编号: SH-{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>

        {renderRadar()}

        <div className="prose prose-stone font-song max-w-none prose-headings:font-song prose-headings:border-l-4 prose-headings:border-gov-red prose-headings:pl-3">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <button 
            onClick={onRestart || (() => window.location.reload())}
            className="w-full py-4 bg-gov-gray text-gov-paper rounded-xl font-song font-bold shadow-lg"
          >
            开启下一任期
          </button>
          <button className="w-full py-4 border-2 border-gov-gray text-gov-gray rounded-xl font-song font-bold opacity-60">
            保存并分享报告
          </button>
        </div>
      </div>
    </motion.div>
  );
};

