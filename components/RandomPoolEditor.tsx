import React, { useState } from 'react';
import { RandomPool, GameConfig } from '../types';

interface RandomPoolEditorProps {
  pool: RandomPool;
  config: GameConfig;
  onUpdate: (pool: RandomPool) => void;
  onOpenRandomEventLibrary: () => void;
}

const RandomPoolEditor: React.FC<RandomPoolEditorProps> = ({
  pool,
  config,
  onUpdate,
  onOpenRandomEventLibrary,
}) => {
  const randomEventLibrary = config.randomEventLibrary || [];
  const availableCount = randomEventLibrary.length;
  const [localCount, setLocalCount] = useState<string>(pool.count.toString());

  // 当 pool 变化时同步本地状态
  React.useEffect(() => {
    setLocalCount(pool.count.toString());
  }, [pool.count]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalCount(value);
    
    // 如果输入为空，不更新
    if (value === '') {
      return;
    }
    
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      const clampedValue = Math.max(1, Math.min(10, numValue));
      onUpdate({ ...pool, count: clampedValue });
    }
  };

  const handleCountBlur = () => {
    const numValue = parseInt(localCount, 10);
    if (isNaN(numValue) || numValue < 1) {
      const validCount = 1;
      setLocalCount(validCount.toString());
      onUpdate({ ...pool, count: validCount });
    } else {
      const clampedValue = Math.max(1, Math.min(10, numValue));
      if (clampedValue !== numValue) {
        setLocalCount(clampedValue.toString());
      }
      onUpdate({ ...pool, count: clampedValue });
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
          🎲
        </div>
        <div>
          <h3 className="font-bold text-ink">随机池</h3>
          <p className="text-xs text-ink-medium">从随机事件库中抽取事件</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-ink-medium mb-2">
            抽取数量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={Math.min(10, availableCount || 10)}
            value={localCount}
            onChange={handleCountChange}
            onBlur={handleCountBlur}
            className="w-full p-2 border-2 border-ink-light bg-white focus:outline-none focus:border-ink rounded-md text-ink"
            placeholder="输入数量"
            step="1"
          />
          <p className="text-xs text-ink-medium mt-1">
            从随机事件库中随机抽取的卡牌数量（1-{Math.min(10, availableCount || 10)}张）
          </p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-xs font-bold text-blue-800 mb-1">📊 随机事件库状态</div>
          <p className="text-xs text-blue-700">
            当前随机事件库共有 <span className="font-bold">{availableCount}</span> 个事件
          </p>
          {availableCount === 0 && (
            <p className="text-xs text-red-600 mt-2">
              ⚠️ 随机事件库为空，请先添加随机事件
            </p>
          )}
        </div>

        <button
          onClick={onOpenRandomEventLibrary}
          className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-md text-xs font-bold transition"
        >
          📚 打开随机事件库管理
        </button>

        {availableCount > 0 && (
          <div className="mt-4">
            <div className="text-xs font-bold text-ink-medium mb-2">预览：可能抽取的事件</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {randomEventLibrary.slice(0, 5).map((card) => (
                <div
                  key={card.id}
                  className="p-2 bg-white/80 rounded-md border border-ink-light text-xs"
                >
                  <div className="font-bold text-ink truncate mb-1">
                    {card.text.substring(0, 40)}...
                  </div>
                  <div className="text-[10px] text-ink-medium">
                    {(config.storyNpcs || config.npcs || []).find((n: any) => n.id === card.npcId)?.name || 'Unknown'}
                  </div>
                </div>
              ))}
              {randomEventLibrary.length > 5 && (
                <div className="text-xs text-ink-medium text-center py-2">
                  还有 {randomEventLibrary.length - 5} 个事件...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomPoolEditor;

