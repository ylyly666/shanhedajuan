import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  timestamp: number;
  metrics: {
    economy: number;
    people: number;
    environment: number;
    culture: number;
  };
}

interface LeaderboardProps {
  currentScore: number;
  currentMetrics: {
    economy: number;
    people: number;
    environment: number;
    culture: number;
  };
  onContinue: () => void;
}

const STORAGE_KEY = 'shanhe_leaderboard';

const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLeaderboard = (entries: LeaderboardEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('保存排行榜失败:', error);
  }
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentScore, currentMetrics, onContinue }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>('');

  useEffect(() => {
    // 加载排行榜
    const entries = loadLeaderboard();
    setLeaderboard(entries);

    // 自动提交当前分数
    const defaultName = localStorage.getItem('shanhe_player_name') || '玩家';
    setPlayerName(defaultName);
    
    const newEntry: LeaderboardEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerName: defaultName,
      score: currentScore,
      timestamp: Date.now(),
      metrics: currentMetrics,
    };

    const updatedEntries = [...entries, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100); // 只保留前100名

    saveLeaderboard(updatedEntries);
    setLeaderboard(updatedEntries);
  }, []);

  const handleSubmit = () => {
    if (!playerName.trim()) {
      alert('请输入玩家名称');
      return;
    }

    localStorage.setItem('shanhe_player_name', playerName.trim());

    const newEntry: LeaderboardEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerName: playerName.trim(),
      score: currentScore,
      timestamp: Date.now(),
      metrics: currentMetrics,
    };

    const updatedEntries = [...leaderboard.filter(e => e.id !== newEntry.id), newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);

    saveLeaderboard(updatedEntries);
    setLeaderboard(updatedEntries);
  };

  const currentRank = leaderboard.findIndex(e => e.score === currentScore && e.metrics.economy === currentMetrics.economy) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gov-paper rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gov-gray text-gov-paper p-6 text-center">
          <h2 className="text-3xl font-song font-bold mb-2">🏆 排行榜</h2>
          <p className="text-sm opacity-80">您的得分: <span className="text-2xl font-bold">{currentScore}</span> 分</p>
          {currentRank > 0 && (
            <p className="text-xs opacity-60 mt-1">当前排名: 第 {currentRank} 名</p>
          )}
        </div>

        {/* Player Name Input */}
        <div className="p-4 bg-white/50 border-b border-stone-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="输入您的名字"
              className="flex-1 px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-primary-red font-song"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-red text-white rounded-lg hover:bg-primary-red/90 transition-colors font-song font-bold"
            >
              提交
            </button>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-6">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <p className="text-lg">暂无记录</p>
              <p className="text-sm mt-2">成为第一个上榜的玩家吧！</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isCurrent = entry.score === currentScore && 
                                 entry.metrics.economy === currentMetrics.economy &&
                                 entry.metrics.people === currentMetrics.people;
                
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      isCurrent 
                        ? 'bg-primary-red/10 border-2 border-primary-red' 
                        : 'bg-white/50 border border-stone-200'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 text-center">
                      {index < 3 ? (
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-stone-500">#{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-song font-bold text-lg">{entry.playerName}</span>
                        {isCurrent && (
                          <span className="px-2 py-1 bg-primary-red text-white text-xs rounded-full">您</span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        {new Date(entry.timestamp).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-red">{entry.score}</div>
                      <div className="text-xs text-stone-500">分</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 bg-white/50">
          <button
            onClick={onContinue}
            className="w-full py-4 bg-gov-gray text-gov-paper rounded-xl font-song font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            继续 →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

