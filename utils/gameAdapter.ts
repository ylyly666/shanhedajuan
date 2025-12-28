/**
 * 游戏UI适配层
 * 用于将新UI组件的类型（culture）适配到目标项目的类型系统（civility）
 */

import { StatKey, GameStats } from '@/types/game';

// 新UI使用的MetricType (culture) -> 目标项目的StatKey (civility)
export type MetricType = 'economy' | 'people' | 'environment' | 'culture';
export type MetricTypeToStatKey = {
  economy: 'economy';
  people: 'people';
  environment: 'environment';
  culture: 'civility';
};

// 将MetricType转换为StatKey
export function metricToStatKey(metric: MetricType): StatKey {
  const map: Record<MetricType, StatKey> = {
    economy: 'economy',
    people: 'people',
    environment: 'environment',
    culture: 'civility',
  };
  return map[metric];
}

// 将StatKey转换为MetricType
export function statKeyToMetric(stat: StatKey): MetricType {
  const map: Record<StatKey, MetricType> = {
    economy: 'economy',
    people: 'people',
    environment: 'environment',
    civility: 'culture',
  };
  return map[stat];
}

// 将GameStats转换为新UI需要的格式（culture格式）
export function gameStatsToMetrics(stats: GameStats): Record<MetricType, number> {
  return {
    economy: stats.economy,
    people: stats.people,
    environment: stats.environment,
    culture: stats.civility,
  };
}

// 将新UI的metrics格式转换为GameStats
export function metricsToGameStats(metrics: Record<MetricType, number>): GameStats {
  return {
    economy: metrics.economy,
    people: metrics.people,
    environment: metrics.environment,
    civility: metrics.culture,
  };
}

// MetricDelta适配
export interface MetricDelta {
  economy?: number;
  people?: number;
  environment?: number;
  culture?: number;
}

export function metricDeltaToGameStatsDelta(delta: MetricDelta): Partial<GameStats> {
  return {
    economy: delta.economy,
    people: delta.people,
    environment: delta.environment,
    civility: delta.culture,
  };
}



