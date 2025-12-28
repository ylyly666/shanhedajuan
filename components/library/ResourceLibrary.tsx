import React, { useEffect, useState } from 'react';
import { getCasesFromSupabase, KnowledgeBaseCase, CaseSource } from '@/services/database/supabase';
import { StatKey } from '@/types';

interface ResourceLibraryProps {
  onBack: () => void;
  onAdminMode?: () => void;
}

const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ onBack, onAdminMode }) => {
  const [cases, setCases] = useState<KnowledgeBaseCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<KnowledgeBaseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<StatKey | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<CaseSource | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('published');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const [selectedCase, setSelectedCase] = useState<KnowledgeBaseCase | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCasesFromSupabase({
          status: 'published',
        });
        setCases(data);
        // 如果没有数据，显示提示信息
        if (data.length === 0) {
          console.info('案例库为空，可能未配置Supabase或使用Mock数据');
        }
      } catch (err: any) {
        console.error('加载案例失败:', err);
        setError(err?.message || '加载数据失败，请检查网络连接或Supabase配置');
        // 即使出错也尝试使用Mock数据
        try {
          const { MOCK_KNOWLEDGE_BASE_CASES } = await import('@/services/database/mockCases');
          setCases(MOCK_KNOWLEDGE_BASE_CASES.filter(c => c.status === 'published'));
          setError(null); // 清除错误，因为Mock数据可用
        } catch (mockError) {
          // Mock数据也加载失败，保持错误状态
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = [...cases];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((c) => c.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter((c) => c.source === selectedSource);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.context_summary.toLowerCase().includes(q) ||
          c.conflict_detail.toLowerCase().includes(q) ||
          c.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((c) => c.tags.includes(selectedTag));
    }

    setFilteredCases(filtered);
  }, [cases, selectedCategory, selectedSource, selectedStatus, searchQuery, selectedTag]);

  const getAllTags = (): string[] => {
    const set = new Set<string>();
    cases.forEach((c) => c.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  };

  const sourceMap: Record<CaseSource, string> = {
    official_report: '📋 官方报告',
    field_experience: '🏘️ 一线经验',
    user_upload: '👤 用户上传',
    expert_contribution: '🎓 专家贡献',
  };

  const categoryMap: Record<StatKey, string> = {
    economy: '💰 经济发展',
    people: '👥 民生福祉',
    environment: '🌲 生态环保',
    civility: '🚩 乡风民俗',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-red-50/20 to-stone-100">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-stone-600 hover:text-stone-800 transition-colors font-bold"
              >
                返回首页
              </button>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span className="text-3xl">📚</span>
                <span>资料库</span>
              </h1>
            </div>
            {onAdminMode && (
              <button
                onClick={onAdminMode}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-all shadow-md hover:shadow-lg font-bold text-sm"
              >
                🔧 管理员入口
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-stone-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="🔍 搜索标题、内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'draft' | 'published')}
              className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="published">已发布</option>
              <option value="draft">待审核</option>
              <option value="all">全部</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as StatKey | 'all')}
              className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="all">全部类别</option>
              <option value="economy">💰 经济发展</option>
              <option value="people">👥 民生福祉</option>
              <option value="environment">🌲 生态环保</option>
              <option value="civility">🚩 乡风民俗</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as CaseSource | 'all')}
              className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="all">全部来源</option>
              <option value="official_report">📋 官方报告</option>
              <option value="field_experience">🏘️ 一线经验</option>
              <option value="user_upload">👤 用户上传</option>
              <option value="expert_contribution">🎓 专家贡献</option>
            </select>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="">全部标签</option>
              {getAllTags().map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4 text-sm text-stone-600">
          <span>
            共找到<strong className="text-red-800">{filteredCases.length}</strong> 个案例
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
            待审核: {cases.filter((c) => c.status === 'draft').length}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-700 bg-white rounded-xl border border-red-200 shadow-sm">
            加载失败：{error}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-stone-600 text-lg mb-2">暂无案例</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-stone-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-stone-900 text-lg line-clamp-2 flex-1">
                      {caseItem.title}
                    </h3>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                        caseItem.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : caseItem.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {caseItem.status === 'published'
                        ? '已发布'
                        : caseItem.status === 'draft'
                        ? '待审核'
                        : '已拒绝'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
                    <span>{categoryMap[caseItem.category]}</span>
                    <span>{sourceMap[caseItem.source]}</span>
                  </div>
                  <p className="text-sm text-stone-600 line-clamp-2 mb-4">{caseItem.context_summary}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCase(caseItem)}
                      className="flex-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-all text-sm font-bold"
                    >
                      查看
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCase && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-stone-200 overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">{selectedCase.title}</h2>
                <div className="flex gap-2 mt-2 text-xs text-stone-500">
                  <span>{categoryMap[selectedCase.category]}</span>
                  <span>{sourceMap[selectedCase.source]}</span>
                  <span
                    className={`px-2 py-1 rounded-full font-bold ${
                      selectedCase.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : selectedCase.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedCase.status === 'published'
                      ? '已发布'
                      : selectedCase.status === 'draft'
                      ? '待审核'
                      : '已拒绝'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-stone-400 hover:text-stone-600 text-2xl">
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2">背景摘要</h3>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{selectedCase.context_summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2">矛盾详情</h3>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{selectedCase.conflict_detail}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2">解决结果</h3>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{selectedCase.resolution_outcome}</p>
              </div>

              {selectedCase.expert_comment && (
                <div>
                  <h3 className="text-sm font-bold text-stone-700 mb-2">专家点评</h3>
                  <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{selectedCase.expert_comment}</p>
                </div>
              )}

              {selectedCase.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-stone-700 mb-2">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.tags.map((tag) => (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;

