// 数据持久化工�?- 使用localStorage

import { GameConfig, PolicyDocument, CaseStudy } from '@/types';

const STORAGE_KEYS = {
  GAME_CONFIG: 'shanhe_game_config',
  RESOURCE_LIBRARY: 'shanhe_resource_library',
  UGC_CASES: 'shanhe_ugc_cases',
} as const;

/**
 * 保存游戏配置
 */
export const saveGameConfig = (config: GameConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('保存游戏配置失败:', error);
  }
};

/**
 * 加载游戏配置
 */
export const loadGameConfig = (): GameConfig | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_CONFIG);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('加载游戏配置失败:', error);
    return null;
  }
};

/**
 * 保存资源库数�?
 */
export const saveResourceLibrary = (policies: PolicyDocument[], cases: CaseStudy[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESOURCE_LIBRARY, JSON.stringify({
      policies,
      cases,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('保存资源库失�?', error);
  }
};

/**
 * 加载资源库数�?
 */
export const loadResourceLibrary = (): { policies: PolicyDocument[]; cases: CaseStudy[] } => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESOURCE_LIBRARY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        policies: parsed.policies || [],
        cases: parsed.cases || [],
      };
    }
  } catch (error) {
    console.error('加载资源库失�?', error);
  }
  return { policies: [], cases: [] };
};

/**
 * 添加政策文档
 */
export const addPolicyDocument = (policy: PolicyDocument): void => {
  const { policies } = loadResourceLibrary();
  policies.push(policy);
  saveResourceLibrary(policies, loadResourceLibrary().cases);
};

/**
 * 添加案例
 */
export const addCaseStudy = (caseStudy: CaseStudy): void => {
  const { cases } = loadResourceLibrary();
  cases.push(caseStudy);
  saveResourceLibrary(loadResourceLibrary().policies, cases);
};

/**
 * 保存UGC案例（待审核�?
 */
export const saveUGCCase = (caseData: any): void => {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.UGC_CASES);
    const cases = existing ? JSON.parse(existing) : [];
    cases.push({
      ...caseData,
      id: `ugc_${Date.now()}`,
      status: 'pending',
      submitDate: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.UGC_CASES, JSON.stringify(cases));
  } catch (error) {
    console.error('保存UGC案例失败:', error);
  }
};

/**
 * 加载UGC案例
 */
export const loadUGCCases = (): any[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.UGC_CASES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('加载UGC案例失败:', error);
    return [];
  }
};

/**
 * 清空所有数据（谨慎使用�?
 */
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};


