import React, { useState, useEffect } from 'react';
import { getCasesFromSupabase, updateCaseInSupabase } from '@/services/database/supabase';
import { StatKey } from '@/types';

type CaseSource = 'official_report' | 'field_experience' | 'user_upload' | 'expert_contribution';

interface KnowledgeBaseCase {
  id: string;
  title: string;
  tags: string[];
  category: StatKey;
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
  source: CaseSource;
  original_text?: string;
  status: 'draft' | 'published' | 'archived';
}

interface AdminReviewProps {
  onBack: () => void;
  onUploadMode?: () => void;
}

const AdminReview: React.FC<AdminReviewProps> = ({ onBack, onUploadMode }) => {
  // 数据状态
  const [cases, setCases] = useState<KnowledgeBaseCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<KnowledgeBaseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<KnowledgeBaseCase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<KnowledgeBaseCase>>({});

  // 筛选状态
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('draft');
  const [searchQuery, setSearchQuery] = useState('');

  // 加载数据
  useEffect(() => {
    loadCases();
  }, []);

  // 应用筛选
  useEffect(() => {
    applyFilters();
  }, [cases, filterStatus, searchQuery]);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const data = await getCasesFromSupabase();
      setCases(data as KnowledgeBaseCase[]);
    } catch (err: any) {
      console.error('加载案例失败:', err);
      alert('加载案例失败: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cases];

    // 状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    // 搜索查询
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.context_summary.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredCases(filtered);
  };

  // 批准案例
  const handleApprove = async (caseId: string) => {
    if (!confirm('确定要批准并发布这个案例吗？')) return;

    try {
      await updateCaseInSupabase(caseId, { status: 'published' });
      await loadCases();
      alert('案例已批准并发布！');
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
      }
    } catch (error: any) {
      alert('操作失败: ' + error.message);
    }
  };

  // 拒绝案例
  const handleReject = async (caseId: string) => {
    if (!confirm('确定要拒绝这个案例吗？')) return;

    try {
      await updateCaseInSupabase(caseId, { status: 'archived' });
      await loadCases();
      alert('案例已拒绝');
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
      }
    } catch (error: any) {
      alert('操作失败: ' + error.message);
    }
  };

  // 开始编辑
  const handleStartEdit = (caseItem: KnowledgeBaseCase) => {
    setSelectedCase(caseItem);
    setEditFormData({
      title: caseItem.title,
      tags: caseItem.tags,
      category: caseItem.category,
      context_summary: caseItem.context_summary,
      conflict_detail: caseItem.conflict_detail,
      resolution_outcome: caseItem.resolution_outcome,
      expert_comment: caseItem.expert_comment,
      source: caseItem.source,
    });
    setIsEditing(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!selectedCase?.id) return;

    try {
      await updateCaseInSupabase(selectedCase.id, editFormData);
      await loadCases();
      alert('案例已更新！');
      setIsEditing(false);
      setSelectedCase(null);
    } catch (error: any) {
      alert('保存失败: ' + error.message);
    }
  };

  // 更新编辑字段
  const updateEditField = (field: keyof KnowledgeBaseCase, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // 添加标签
  const handleAddTag = () => {
    const tag = prompt('请输入标签：');
    if (tag && tag.trim()) {
      const tags = editFormData.tags || [];
      if (!tags.includes(tag.trim())) {
        updateEditField('tags', [...tags, tag.trim()]);
      }
    }
  };

  // 删除标签
  const handleRemoveTag = (index: number) => {
    const tags = editFormData.tags || [];
    updateEditField('tags', tags.filter((_, i) => i !== index));
  };

  const categoryMap: Record<StatKey, string> = {
    'economy': '💰 经济发展',
    'people': '👥 民生福祉',
    'environment': '🌲 生态环保',
    'governance': '🚩 乡风民俗',
  };

  const sourceMap: Record<CaseSource, string> = {
    'official_report': '📋 官方报告',
    'field_experience': '🏘️ 一线经验',
    'user_upload': '👤 用户上传',
    'expert_contribution': '🎓 专家贡献',
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
                返回
              </button>
              <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span className="text-3xl">🔧</span>
                <span>管理员审核</span>
              </h1>
            </div>
            <div className="flex gap-3">
              {onUploadMode && (
                <button
                  onClick={onUploadMode}
                  className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-all shadow-md hover:shadow-lg font-bold text-sm"
                >
                  + 录入案例
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 筛选栏 */}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'published')}
              className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <option value="draft">📝 待审核</option>
                <option value="published">已发布</option>
                <option value="all">📋 全部</option>
            </select>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mb-6 flex items-center gap-4 text-sm text-stone-600">
          <span>共找到<strong className="text-red-800">{filteredCases.length}</strong> 个案例</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
            待审核: {cases.filter(c => c.status === 'draft').length}
          </span>
        </div>

        {/* 案例列表 */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">加载中...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-stone-200">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-stone-600 text-lg mb-2">暂无案例</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map(caseItem => (
              <div
                key={caseItem.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-stone-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-stone-900 text-lg line-clamp-2 flex-1">
                      {caseItem.title}
                    </h3>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                      caseItem.status === 'published' ? 'bg-green-100 text-green-800' :
                      caseItem.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {caseItem.status === 'published' ? '已发布' :
                       caseItem.status === 'draft' ? '待审核' : '已拒绝'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-3">
                    <span>{categoryMap[caseItem.category]}</span>
                    <span>{caseItem.category}</span>
                    <span>{sourceMap[caseItem.source]}</span>
                  </div>
                  <p className="text-sm text-stone-600 line-clamp-2 mb-4">
                    {caseItem.context_summary}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCase(caseItem)}
                      className="flex-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-all text-sm font-bold"
                    >
                      查看
                    </button>
                    {caseItem.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleApprove(caseItem.id!)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-bold"
                        >
                          批准
                        </button>
                        <button
                          onClick={() => handleReject(caseItem.id!)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-bold"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleStartEdit(caseItem)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-bold"
                    >
                      编辑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情/编辑模态框 */}
      {(selectedCase || isEditing) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            if (!isEditing) {
              setSelectedCase(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              /* 编辑模式 */
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-stone-900">编辑案例</h2>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedCase(null);
                    }}
                    className="text-stone-400 hover:text-stone-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">标题</label>
                    <input
                      type="text"
                      value={editFormData.title || ''}
                      onChange={(e) => updateEditField('title', e.target.value)}
                      className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">标签</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editFormData.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={handleAddTag}
                      className="text-sm text-red-800 font-bold hover:underline"
                    >
                      + 添加标签
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">类别</label>
                    <select
                      value={editFormData.category || 'governance'}
                      onChange={(e) => updateEditField('category', e.target.value)}
                      className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
                    >
                      <option value="economy">💰 经济发展</option>
                      <option value="people">👥 民生福祉</option>
                      <option value="environment">🌲 生态环保</option>
                      <option value="governance">🚩 乡风民俗</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">背景摘要</label>
                    <textarea
                      value={editFormData.context_summary || ''}
                      onChange={(e) => updateEditField('context_summary', e.target.value)}
                      className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">矛盾详情</label>
                    <textarea
                      value={editFormData.conflict_detail || ''}
                      onChange={(e) => updateEditField('conflict_detail', e.target.value)}
                      className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">解决结果</label>
                    <textarea
                      value={editFormData.resolution_outcome || ''}
                      onChange={(e) => updateEditField('resolution_outcome', e.target.value)}
                      className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">专家点评</label>
                    <textarea
                      value={editFormData.expert_comment || ''}
                      onChange={(e) => updateEditField('expert_comment', e.target.value)}
                      className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedCase(null);
                    }}
                    className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-all font-bold"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-all font-bold"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              /* 查看模式 */
              <>
                <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-red-50 to-stone-50">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-stone-900 flex-1">{selectedCase!.title}</h2>
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="text-stone-400 hover:text-stone-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="px-3 py-1 bg-white rounded-full font-bold">
                      {categoryMap[selectedCase!.category]}
                    </span>
                    <span className="px-3 py-1 bg-white rounded-full font-bold">
                      {sourceMap[selectedCase!.source]}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      selectedCase!.status === 'published' ? 'bg-green-100 text-green-800' :
                      selectedCase!.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedCase!.status === 'published' ? '已发布' :
                       selectedCase!.status === 'draft' ? '待审核' : '已拒绝'}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {selectedCase!.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-700 mb-2">标签</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCase!.tags.map(tag => (
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

                  <div>
                    <h3 className="text-sm font-bold text-stone-700 mb-2">📋 背景摘要</h3>
                    <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {selectedCase!.context_summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-700 mb-2">矛盾详情</h3>
                    <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {selectedCase!.conflict_detail}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-700 mb-2">解决结果</h3>
                    <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {selectedCase!.resolution_outcome}
                    </p>
                  </div>

                  {selectedCase!.expert_comment && (
                    <div>
                      <h3 className="text-sm font-bold text-stone-700 mb-2">💡 专家点评</h3>
                      <p className="text-stone-700 leading-relaxed whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        {selectedCase!.expert_comment}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-stone-200 bg-stone-50 flex justify-between">
                  <div className="flex gap-3">
                    {selectedCase!.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleApprove(selectedCase!.id!)}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold"
                        >
                          批准发布
                        </button>
                        <button
                          onClick={() => handleReject(selectedCase!.id!)}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleStartEdit(selectedCase!)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold"
                    >
                      编辑
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-all font-bold"
                  >
                    关闭
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReview;

