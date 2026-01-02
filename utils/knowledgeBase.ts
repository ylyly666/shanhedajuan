/**
 * 本地知识库工具（增强版伪RAG实现）
 * 从 knowledgeBase.json 加载案例库，提供智能文本匹配检索功能
 */

export interface KnowledgeCase {
  id: string;
  title: string;
  category: string;
  uploader?: string;
  tags: string[]; // 格式: ["#标签1 #标签2 #标签3"]
  content: string; // 包含【背景摘要】和【矛盾详情】
  key_lesson: string; // 包含【解决结果】和【专家点评】
  full_details?: {
    summary: string;
    conflict: string;
    solution: string;
    expert_comment: string;
  };
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
 * 从tags字符串数组中提取所有标签词
 * 输入: ["#雨露计划 #职教补助 #政策找人"]
 * 输出: ["雨露计划", "职教补助", "政策找人"]
 */
function extractTagWords(tags: string[]): string[] {
  const tagWords: string[] = [];
  tags.forEach(tagStr => {
    // 移除#符号，按空格分割
    const words = tagStr
      .replace(/#/g, ' ')
      .split(/\s+/)
      .filter(w => w.trim().length > 0);
    tagWords.push(...words);
  });
  return tagWords;
}

/**
 * 中文分词（简单实现：按常见分隔符分割）
 */
function tokenizeChinese(text: string): string[] {
  // 移除标点符号，按常见分隔符分割
  const tokens = text
    .replace(/[【】\[\]()（）《》""''，。、；：！？\s]+/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
  
  // 对于长词，也尝试提取子词（2-4字）
  const subTokens: string[] = [];
  tokens.forEach(token => {
    if (token.length >= 4) {
      // 提取2-4字的子词
      for (let len = 2; len <= 4 && len <= token.length; len++) {
        for (let i = 0; i <= token.length - len; i++) {
          subTokens.push(token.substring(i, i + len));
        }
      }
    }
  });
  
  return [...tokens, ...subTokens];
}

/**
 * 匹配因子记录（用于调试）
 */
export interface MatchFactor {
  type: 'TitleMatch' | 'TagMatch' | 'CategoryMatch' | 'ContentMatch' | 'KeyLessonMatch' | 'FullDetailsMatch';
  score: number;
  matchedText?: string;
}

/**
 * 计算文本相似度分数（增强版关键词匹配）
 * 返回分数和匹配因子（用于调试）
 */
function calculateRelevanceScore(
  query: string, 
  caseItem: KnowledgeCase
): { score: number; factors: MatchFactor[] } {
  const queryLower = query.toLowerCase().trim();
  let score = 0;
  const factors: MatchFactor[] = [];

  // 提取查询词
  const queryTokens = tokenizeChinese(queryLower);
  const queryWords = queryLower.split(/[\s，。、；：！？]+/).filter(w => w.length > 0);
  const allQueryTerms = [...new Set([...queryTokens, ...queryWords, queryLower])];

  // 1. 标题完全匹配（权重最高）
  const titleLower = caseItem.title.toLowerCase();
  if (titleLower === queryLower) {
    score += 50;
    factors.push({ type: 'TitleMatch', score: 50, matchedText: queryLower });
  } else if (titleLower.includes(queryLower)) {
    score += 30;
    factors.push({ type: 'TitleMatch', score: 30, matchedText: queryLower });
  }
  
  // 标题分词匹配
  allQueryTerms.forEach(term => {
    if (titleLower.includes(term) && term.length >= 2) {
      score += 5;
      if (!factors.find(f => f.type === 'TitleMatch' && f.matchedText === term)) {
        factors.push({ type: 'TitleMatch', score: 5, matchedText: term });
      }
    }
  });

  // 2. 标签匹配（权重很高，因为标签是精确的关键词）
  const tagWords = extractTagWords(caseItem.tags);
  tagWords.forEach(tag => {
    const tagLower = tag.toLowerCase();
    // 完全匹配标签
    if (tagLower === queryLower) {
      score += 40;
      factors.push({ type: 'TagMatch', score: 40, matchedText: tag });
    } else if (tagLower.includes(queryLower) || queryLower.includes(tagLower)) {
      score += 25;
      factors.push({ type: 'TagMatch', score: 25, matchedText: tag });
    }
    // 分词匹配
    allQueryTerms.forEach(term => {
      if (tagLower.includes(term) && term.length >= 2) {
        score += 8;
        if (!factors.find(f => f.type === 'TagMatch' && f.matchedText === term)) {
          factors.push({ type: 'TagMatch', score: 8, matchedText: term });
        }
      }
    });
  });

  // 3. 类别匹配
  if (caseItem.category.includes(query) || query.includes(caseItem.category)) {
    score += 15;
    factors.push({ type: 'CategoryMatch', score: 15, matchedText: caseItem.category });
  }

  // 4. content字段匹配（包含背景摘要和矛盾详情）
  const contentLower = caseItem.content.toLowerCase();
  if (contentLower.includes(queryLower)) {
    score += 10;
    factors.push({ type: 'ContentMatch', score: 10 });
  }
  allQueryTerms.forEach(term => {
    if (contentLower.includes(term) && term.length >= 2) {
      score += 2;
    }
  });

  // 5. key_lesson字段匹配（处理结果和经验总结）
  const keyLessonLower = caseItem.key_lesson.toLowerCase();
  if (keyLessonLower.includes(queryLower)) {
    score += 12;
    factors.push({ type: 'KeyLessonMatch', score: 12 });
  }
  allQueryTerms.forEach(term => {
    if (keyLessonLower.includes(term) && term.length >= 2) {
      score += 2.5;
    }
  });

  // 6. full_details结构化字段匹配（如果存在）
  if (caseItem.full_details) {
    const { summary, conflict, solution, expert_comment } = caseItem.full_details;
    const detailsText = `${summary} ${conflict} ${solution} ${expert_comment}`.toLowerCase();
    
    if (detailsText.includes(queryLower)) {
      score += 8;
      factors.push({ type: 'FullDetailsMatch', score: 8 });
    }
    allQueryTerms.forEach(term => {
      if (detailsText.includes(term) && term.length >= 2) {
        score += 1.5;
      }
    });
  }

  // 7. 多词查询的额外加分（如果多个词都匹配）
  const matchedTerms = allQueryTerms.filter(term => {
    const searchText = `${titleLower} ${tagWords.join(' ')} ${contentLower} ${keyLessonLower}`.toLowerCase();
    return searchText.includes(term) && term.length >= 2;
  });
  if (matchedTerms.length >= 2) {
    score += matchedTerms.length * 3; // 多词匹配加分
  }

  return { score, factors };
}

/**
 * 搜索相关案例（增强版，支持自动阈值和同类合并）
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
  
  if (allCases.length === 0) {
    console.warn('[知识库] 知识库为空');
    return [];
  }

  // 先按类别过滤
  let filteredCases = allCases;
  if (options?.category) {
    filteredCases = allCases.filter(c => c.category === options.category);
  }

  // 计算相关性分数（包含匹配因子）
  const casesWithScore = filteredCases.map(caseItem => {
    const { score, factors } = calculateRelevanceScore(query, caseItem);
    return {
      case: caseItem,
      score,
      factors,
    };
  });

  // 按分数排序
  casesWithScore.sort((a, b) => b.score - a.score);

  // 自动阈值逻辑：如果最高分低于15分，触发模糊模式
  const topScore = casesWithScore.length > 0 ? casesWithScore[0].score : 0;
  const useFuzzyMode = topScore < 15;
  
  if (useFuzzyMode) {
    console.warn(`[知识库检索] 最高分 ${topScore.toFixed(1)} < 15，触发模糊模式，扩大检索范围...`);
    // 模糊模式：重新计算，搜索full_details中的全文字段，降低阈值
    const fuzzyCases = filteredCases.map(caseItem => {
      let fuzzyScore = 0;
      const factors: MatchFactor[] = [];
      
      // 在full_details中全文搜索
      if (caseItem.full_details) {
        const { summary, conflict, solution, expert_comment } = caseItem.full_details;
        const fullText = `${summary} ${conflict} ${solution} ${expert_comment}`.toLowerCase();
        const queryLower = query.toLowerCase();
        
        if (fullText.includes(queryLower)) {
          fuzzyScore += 5;
          factors.push({ type: 'FullDetailsMatch', score: 5 });
        }
        
        // 分词匹配
        const queryWords = queryLower.split(/[\s，。、；：！？]+/).filter(w => w.length > 0);
        queryWords.forEach(word => {
          if (fullText.includes(word) && word.length >= 2) {
            fuzzyScore += 1;
          }
        });
      }
      
      // 也搜索content和key_lesson
      const contentLower = caseItem.content.toLowerCase();
      const keyLessonLower = caseItem.key_lesson.toLowerCase();
      const queryLower = query.toLowerCase();
      
      if (contentLower.includes(queryLower)) {
        fuzzyScore += 3;
        factors.push({ type: 'ContentMatch', score: 3 });
      }
      if (keyLessonLower.includes(queryLower)) {
        fuzzyScore += 3;
        factors.push({ type: 'KeyLessonMatch', score: 3 });
      }
      
      return {
        case: caseItem,
        score: fuzzyScore,
        factors,
      };
    });
    
    fuzzyCases.sort((a, b) => b.score - a.score);
    casesWithScore.splice(0, casesWithScore.length, ...fuzzyCases);
  }

  // 同类合并：如果同一category有多个案例，优先选择tags匹配度更高的
  const categoryGroups = new Map<string, typeof casesWithScore>();
  casesWithScore.forEach(item => {
    const category = item.case.category;
    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, []);
    }
    categoryGroups.get(category)!.push(item);
  });

  // 对每个category，如果案例数>=2，只保留tags匹配度最高的
  const deduplicatedCases: typeof casesWithScore = [];
  categoryGroups.forEach((group, category) => {
    if (group.length >= 2) {
      // 计算每个案例的tags匹配度
      const tagWords = extractTagWords(group[0].case.tags);
      const queryLower = query.toLowerCase();
      
      group.forEach(item => {
        const itemTagWords = extractTagWords(item.case.tags);
        const tagMatchCount = itemTagWords.filter(tag => 
          tag.toLowerCase().includes(queryLower) || queryLower.includes(tag.toLowerCase())
        ).length;
        (item as any).tagMatchCount = tagMatchCount;
      });
      
      // 按tags匹配度排序，只保留最高的
      group.sort((a, b) => (b as any).tagMatchCount - (a as any).tagMatchCount);
      deduplicatedCases.push(group[0]);
    } else {
      deduplicatedCases.push(...group);
    }
  });

  // 重新按分数排序
  deduplicatedCases.sort((a, b) => b.score - a.score);

  // 调试信息：显示前5个案例的分数和匹配因子
  if (import.meta.env.DEV) {
    console.log(`[知识库检索] 查询: "${query}"`);
    console.log(`[知识库检索] 模式: ${useFuzzyMode ? '模糊模式' : '精确模式'}`);
    console.log(`[知识库检索] 最高分: ${deduplicatedCases[0]?.score.toFixed(1) || 0}`);
    console.log('[知识库检索] 前5个结果:');
    deduplicatedCases.slice(0, 5).forEach((item, idx) => {
      const tagWords = extractTagWords(item.case.tags);
      const factorSummary = item.factors
        .filter(f => f.score >= 5) // 只显示重要因子
        .map(f => `${f.matchedText || f.type}(${f.type})`)
        .join(', ');
      console.log(`  ${idx + 1}. [分数: ${item.score.toFixed(1)}] ${item.case.title}`);
      console.log(`     标签: ${tagWords.join(', ')}`);
      console.log(`     匹配因子: ${factorSummary || '无'}`);
    });
  }

  // 过滤最低分数
  const minScore = options?.minScore ?? (useFuzzyMode ? 0 : 1);
  const filtered = deduplicatedCases.filter(item => item.score >= minScore);

  // 限制结果数量
  const maxResults = options?.maxResults || 5;
  const results = filtered.slice(0, maxResults).map(item => item.case);

  // 如果结果为空但查询词明显（长度>=2），尝试更宽松的匹配
  if (results.length === 0 && query.trim().length >= 2) {
    console.warn(`[知识库检索] 未找到匹配案例，尝试最宽松的匹配...`);
    const relaxedResults = deduplicatedCases
      .filter(item => item.score > 0)
      .slice(0, maxResults)
      .map(item => item.case);
    return relaxedResults;
  }

  return results;
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

/**
 * 深度检索测试函数（用于手动测试）
 * 在浏览器控制台中调用：window.testKnowledgeBaseSearch('雨露计划')
 */
export async function testKnowledgeBaseSearch(query: string) {
  console.log('='.repeat(60));
  console.log(`🔍 深度检索测试: "${query}"`);
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  const results = await searchKnowledgeCases(query, {
    maxResults: 10,
    minScore: 0, // 不设最低分数，查看所有结果
  });
  const endTime = Date.now();
  
  console.log(`\n⏱️  检索耗时: ${endTime - startTime}ms`);
  console.log(`📊 检索结果数: ${results.length}`);
  
  if (results.length === 0) {
    console.warn('⚠️  未找到任何匹配案例！');
    console.log('\n💡 建议：');
    console.log('  1. 检查查询词是否正确');
    console.log('  2. 尝试使用更通用的关键词');
    console.log('  3. 检查知识库是否已正确加载');
  } else {
    console.log('\n📋 检索结果详情:');
    results.forEach((caseItem, idx) => {
      const tagWords = extractTagWords(caseItem.tags);
      console.log(`\n${idx + 1}. 【${caseItem.title}】`);
      console.log(`   类别: ${caseItem.category}`);
      console.log(`   标签: ${tagWords.join(', ')}`);
      if (caseItem.full_details) {
        console.log(`   背景: ${caseItem.full_details.summary.substring(0, 50)}...`);
        console.log(`   矛盾: ${caseItem.full_details.conflict.substring(0, 50)}...`);
      } else {
        console.log(`   内容: ${caseItem.content.substring(0, 50)}...`);
      }
    });
  }
  
  console.log('\n' + '='.repeat(60));
  return results;
}

// 在开发环境下，将测试函数挂载到window对象
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).testKnowledgeBaseSearch = testKnowledgeBaseSearch;
  console.log('💡 提示: 可以在控制台使用 testKnowledgeBaseSearch("雨露计划") 进行深度检索测试');
}
