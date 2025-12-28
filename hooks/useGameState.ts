import { useEffect, useState } from 'react';
import { GameConfig } from '@/types';
import { loadGameConfig, saveGameConfig } from '@/utils/storage/storage';

interface UseGameStateResult {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  resetConfig: (nextConfig?: GameConfig) => void;
}

/**
 * 管理全局 GameConfig 状态，并自动持久化到本地存储。
 */
export const useGameState = (initialConfig: GameConfig): UseGameStateResult => {
  const [config, setConfig] = useState<GameConfig>(initialConfig);

  // 初始化时尝试读取已保存的配置
  useEffect(() => {
    const saved = loadGameConfig();
    if (saved && saved.stages?.length) {
      setConfig(saved);
    }
  }, []);

  // 配置变更时自动保存
  useEffect(() => {
    saveGameConfig(config);
  }, [config]);

  const resetConfig = (nextConfig?: GameConfig) => {
    setConfig(nextConfig || initialConfig);
  };

  return { config, setConfig, resetConfig };
};







