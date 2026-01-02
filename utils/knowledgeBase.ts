/**
 * 本地知识库工具（伪RAG实现）
 * 从 knowledgeBase.json 加载案例库，提供文本匹配检索功能
 */

export interface KnowledgeCase {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  key_lesson: string;
}

let knowledgeBaseCache: KnowledgeCase[] | null = null;

/**
 * 加载知识库（带缓存）
 */
export async function loadKnowledgeBase(): Promise<KnowledgeCase[]> {
  if (knowledgeBaseCache) {
    return knowledgeBaseCache;
  }

  try {
    // 在 Vite 中，从 public 目录加载 JSON
    const response = await fetch('/knowledgeBase.json');
    if (!response.ok) {
      throw new Error(`Failed to load knowledgeBase.json: ${response.status}`);
    }
    const data = await response.json();
    knowledgeBaseCache = data;
    return data;
  } catch (error) {
    console.error('加载知识库失败:', error);
    // 如果加载失败，返回空数组
    return [];
  }
}

/**
 * 计算文本相似度分数（简单的关键词匹配）
 */
function calculateRelevanceScore(query: string, caseItem: KnowledgeCase): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // 标题匹配（权重最高）
  if (caseItem.title.toLowerCase().includes(queryLower)) {
    score += 10;
  }

  // 类别匹配
  if (caseItem.category.includes(query)) {
    score += 8;
  }

  // 标签匹配
  const matchingTags = caseItem.tags.filter(tag => 
    tag.toLowerCase().includes(queryLower) || 
    queryLower.split(' ').some(word => tag.toLowerCase().includes(word))
  );
  score += matchingTags.length * 5;

  // 内容匹配
  if (caseItem.content.toLowerCase().includes(queryLower)) {
    score += 3;
  }

  // key_lesson 匹配（经验总结权重较高）
  if (caseItem.key_lesson.toLowerCase().includes(queryLower)) {
    score += 5;
  }

  // 分词匹配（简单实现，支持中文分词）
  const queryWords = queryLower.split(/[\s，。、；：！？]+/).filter(w => w.length > 1);
  queryWords.forEach(word => {
    if (caseItem.title.toLowerCase().includes(word)) score += 2;
    if (caseItem.content.toLowerCase().includes(word)) score += 1;
    if (caseItem.key_lesson.toLowerCase().includes(word)) score += 1.5;
    caseItem.tags.forEach(tag => {
      if (tag.toLowerCase().includes(word)) score += 1;
    });
  });

  return score;
}

/**
 * 搜索相关案例
 */
export async function searchKnowledgeCases(
  query: string,
  options?: {
    category?: string;
    maxResults?: number;
    minScore?: number;
  }
): Promise<KnowledgeCase[]> {
  const allCases = await loadKnowledgeBase();
  
  // 先按类别过滤
  let filteredCases = allCases;
  if (options?.category) {
    filteredCases = allCases.filter(c => c.category === options.category);
  }

  // 计算相关性分数
  const casesWithScore = filteredCases.map(caseItem => ({
    case: caseItem,
    score: calculateRelevanceScore(query, caseItem),
  }));

  // 按分数排序
  casesWithScore.sort((a, b) => b.score - a.score);

  // 过滤最低分数
  const minScore = options?.minScore || 0;
  const filtered = casesWithScore.filter(item => item.score >= minScore);

  // 限制结果数量
  const maxResults = options?.maxResults || 5;
  return filtered.slice(0, maxResults).map(item => item.case);
}

/**
 * 将类别名称映射到 StatKey 格式
 */
export function mapCategoryToStatKey(category: string): string {
  const categoryMap: Record<string, string> = {
    '经济发展': 'economy',
    '民生福祉': 'people',
    '生态环境': 'environment',
    '乡风民俗': 'civility',
  };
  return categoryMap[category] || category;
}

/**
 * 将 StatKey 映射到中文类别名称
 */
export function mapStatKeyToCategory(statKey: string): string {
  const statKeyMap: Record<string, string> = {
    'economy': '经济发展',
    'people': '民生福祉',
    'environment': '生态环境',
    'civility': '乡风民俗',
  };
  return statKeyMap[statKey] || statKey;
}

