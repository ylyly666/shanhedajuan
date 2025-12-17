import React, { useState, useEffect } from 'react';
import { getCasesFromSupabase } from '../utils/supabase';
import { KnowledgeBaseCase, StatKey, CaseSource } from '../types';

interface ResourceLibraryProps {
  onBack: () => void;
  onAdminMode?: () => void;
}

const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ onBack, onAdminMode }) => {
  // 数据状态
  const [cases, setCases] = useState<KnowledgeBaseCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<KnowledgeBaseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 筛选状态
  const [selectedCategory, setSelectedCategory] = useState<StatKey | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<CaseSource | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // UI 状态
  const [selectedCase, setSelectedCase] = useState<KnowledgeBaseCase | null>(null);

  // 加载数据
  useEffect(() => {
    loadCases();
  }, []);

  // 应用筛选
  useEffect(() => {
    applyFilters();
  }, [cases, selectedCategory, selectedSource, selectedStatus, searchQuery, selectedTag]);

  const loadCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCasesFromSupabase();
      setCases(data);
    } catch (err: any) {
      setError(err.message || '加载数据失败');
      console.error('加载案例失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cases];

    // 状态筛选（默认只显示已发布的）
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }

    // 类别筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // 来源筛选
    if (selectedSource !== 'all') {
      filtered = filtered.filter(c => c.source === selectedSource);
    }

    // 搜索查询（标题、摘要、标签）
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.context_summary.toLowerCase().includes(query) ||
        c.conflict_detail.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 标签筛选
    if (selectedTag) {
      filtered = filtered.filter(c => c.tags.includes(selectedTag));
    }

    setFilteredCases(filtered);
  };

  // 获取所有标签
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    cases.forEach(c => {
      c.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  // 来源映射
  const sourceMap: Record<CaseSource, string> = {
    'official_report': '📋 官方报告',
    'field_experience': '🏘️ 一线经验',
    'user_upload': '👤 用户上传',
    'expert_contribution': '🎓 专家贡献',
  };

  // 类别映射
  const categoryMap: Record<StatKey, string> = {
    'economy': '💰 经济发展',
    'people': '👥 民生福祉',
    'environment': '🌲 生态环境',
    'governance': '🚩 乡风民俗',
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-red-50/20 to-stone-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="text-stone-600 hover:text-stone-800 transition-colors font-bold"
              >
                ← 返回首页
              </button>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span className="text-3xl">📚</span>
                <span>乡村振兴资料库</span>
              </h1>
            </div>
            {onAdminMode && (
              <button
                onClick={onAdminMode}
                className="px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-all shadow-md hover:shadow-lg font-bold text-sm"
              >
                🔧 管理员
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 筛选栏 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-stone-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜索框 */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="🔍 搜索标题、内容、标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
              />
            </div>

            {/* 类别筛选 */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as StatKey | 'all')}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="all">📂 全部类别</option>
                <option value="economy">💰 经济发展</option>
                <option value="people">👥 民生福祉</option>
                <option value="environment">🌲 生态环境</option>
                <option value="governance">🚩 乡风民俗</option>
              </select>
            </div>

            {/* 来源筛选 */}
            <div>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as CaseSource | 'all')}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="all">📌 全部来源</option>
                <option value="official_report">📋 官方报告</option>
                <option value="field_experience">🏘️ 一线经验</option>
                <option value="user_upload">👤 用户上传</option>
                <option value="expert_contribution">🎓 专家贡献</option>
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'published' | 'draft')}
                className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="published">✅ 已发布</option>
                <option value="draft">📝 待审核</option>
                <option value="all">📋 全部</option>
              </select>
            </div>
          </div>

          {/* 标签筛选 */}
          {getAllTags().length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                    selectedTag === ''
                      ? 'bg-red-800 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  全部标签
                </button>
                {getAllTags().map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                      selectedTag === tag
                        ? 'bg-red-800 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mb-6 flex items-center gap-4 text-sm text-stone-600">
          <span>共找到 <strong className="text-red-800">{filteredCases.length}</strong> 个案例</span>
          {selectedCategory !== 'all' && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
              {categoryMap[selectedCategory as StatKey]}
            </span>
          )}
          {selectedSource !== 'all' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {sourceMap[selectedSource as CaseSource]}
            </span>
          )}
        </div>

        {/* 内容区域 */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-800 font-bold mb-2">加载失败</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadCases}
              className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-all font-bold"
            >
              重试
            </button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-stone-600 text-lg mb-2">暂无案例</p>
            <p className="text-stone-400 text-sm mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedSource !== 'all'
                ? '尝试调整筛选条件'
                : '前往"投稿"页面分享您的案例'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSource('all');
                setSelectedTag('');
              }}
              className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-all font-bold"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map(caseItem => (
              <div
                key={caseItem.id}
                onClick={() => setSelectedCase(caseItem)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-stone-200 overflow-hidden cursor-pointer group"
              >
                {/* 卡片头部 */}
                <div className="p-5 border-b border-stone-100">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-stone-900 text-lg line-clamp-2 group-hover:text-red-800 transition-colors flex-1">
                      {caseItem.title}
                    </h3>
                    {caseItem.status === 'draft' && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold whitespace-nowrap">
                        待审核
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>{categoryMap[caseItem.category]}</span>
                    <span>•</span>
                    <span>{sourceMap[caseItem.source]}</span>
                  </div>
                </div>

                {/* 卡片内容 */}
                <div className="p-5">
                  <p className="text-sm text-stone-600 line-clamp-3 mb-4">
                    {caseItem.context_summary}
                  </p>

                  {/* 标签 */}
                  {caseItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {caseItem.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                      {caseItem.tags.length > 3 && (
                        <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs">
                          +{caseItem.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100">
                    <span>
                      {caseItem.created_at
                        ? new Date(caseItem.created_at).toLocaleDateString('zh-CN')
                        : '未知日期'}
                    </span>
                    <span className="text-red-600 font-bold group-hover:underline">
                      查看详情 →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情模态框 */}
      {selectedCase && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCase(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 详情头部 */}
            <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-red-50 to-stone-50">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-stone-900 flex-1">{selectedCase.title}</h2>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-stone-400 hover:text-stone-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="px-3 py-1 bg-white rounded-full font-bold">
                  {categoryMap[selectedCase.category]}
                </span>
                <span className="px-3 py-1 bg-white rounded-full font-bold">
                  {sourceMap[selectedCase.source]}
                </span>
                {selectedCase.status === 'draft' && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                    待审核
                  </span>
                )}
                {selectedCase.created_at && (
                  <span className="text-stone-500">
                    {new Date(selectedCase.created_at).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </div>

            {/* 详情内容 */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* 标签 */}
              {selectedCase.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-stone-700 mb-2">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 背景摘要 */}
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2">📋 背景摘要</h3>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.context_summary}
                </p>
              </div>

              {/* 矛盾详情 */}
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2">⚡ 矛盾详情</h3>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.conflict_detail}
                </p>
              </div>

              {/* 解决结果 */}
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2">✅ 解决结果</h3>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.resolution_outcome}
                </p>
              </div>

              {/* 专家点评 */}
              {selectedCase.expert_comment && (
                <div>
                  <h3 className="text-sm font-bold text-stone-700 mb-2">💡 专家点评</h3>
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    {selectedCase.expert_comment}
                  </p>
                </div>
              )}
            </div>

            {/* 详情底部 */}
            <div className="p-6 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-all font-bold"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;
