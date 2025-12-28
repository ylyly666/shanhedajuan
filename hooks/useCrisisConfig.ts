import { useCallback, useMemo } from 'react';
import { CrisisConfig, GameConfig, StatKey } from '@/types';

interface UseCrisisConfigParams {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
}

export const useCrisisConfig = ({ config, setConfig }: UseCrisisConfigParams) => {
  const statLabels: Record<StatKey, string> = useMemo(
    () => ({
      economy: '💰 经济发展',
      people: '👥 民生福祉',
      environment: '🌲 生态环境',
      civility: '🚩 乡风民俗',
    }),
    [],
  );

  const updateCrisisConfig = useCallback(
    (stat: StatKey, updates: Partial<CrisisConfig>) => {
      setConfig((prev) => ({
        ...prev,
        crisisConfig: {
          ...prev.crisisConfig,
          [stat]: { ...prev.crisisConfig[stat], ...updates },
        },
      }));
    },
    [setConfig],
  );

  const updateJudgeWeights = useCallback(
    (stat: StatKey, field: 'empathy' | 'rationality' | 'strategy' | 'compliance', value: number) => {
      const crisis = config.crisisConfig[stat];
      const currentWeights = crisis.judgeWeights || {
        empathy: 25,
        rationality: 25,
        strategy: 25,
        compliance: 25,
      };
      const newWeights = { ...currentWeights, [field]: Math.max(0, Math.min(100, value)) };
      updateCrisisConfig(stat, { judgeWeights: newWeights });
    },
    [config.crisisConfig, updateCrisisConfig],
  );

  return {
    statLabels,
    updateCrisisConfig,
    updateJudgeWeights,
  };
};


