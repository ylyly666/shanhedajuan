import React, { useState } from 'react';
import { StatKey } from '@/types';
import { extractCaseFromText } from '@/utils/file/caseExtractor';
import { saveCaseToSupabase, generateEmbedding } from '@/services/database/supabase';

type CaseSource = 'official_report' | 'field_experience' | 'user_upload' | 'expert_contribution';

interface KnowledgeBaseCase {
  id?: string;
  title: string;
  tags: string[];
  category: StatKey;
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
  source: CaseSource;
  original_text?: string;
  status?: 'draft' | 'published' | 'archived' | 'pending';
}

interface AIExtractedCase {
  title: string;
  tags: string[];
  category: StatKey;
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
}

interface AdminCaseUploadProps {
  onBack: () => void;
  onReviewMode?: () => void;
}

const AdminCaseUpload: React.FC<AdminCaseUploadProps> = ({ onBack, onReviewMode }) => {
  // 原始文本
  const [rawText, setRawText] = useState('');
  
  // 结构化表单数据
  const [formData, setFormData] = useState<Partial<KnowledgeBaseCase>>({
    title: '',
    tags: [],
    category: 'governance',
    context_summary: '',
    conflict_detail: '',
    resolution_outcome: '',
    expert_comment: '',
    source: 'official_report',
    // 管理员提交默认发布，不需要状态字段
  });

  // UI状态
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI智能提取
  const handleAIExtract = async () => {
    if (!rawText.trim()) {
      alert('请先输入原始文本！');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      console.log('开始AI提取，文本长度:', rawText.length);
      const extracted: AIExtractedCase = await extractCaseFromText(rawText);
      console.log('AI提取成功:', extracted);
      
      // 填充表单
      setFormData({
        title: extracted.title,
        tags: extracted.tags,
        category: extracted.category,
        context_summary: extracted.context_summary,
        conflict_detail: extracted.conflict_detail,
        resolution_outcome: extracted.resolution_outcome,
        expert_comment: extracted.expert_comment,
        original_text: rawText, // 保存原始文本
      });

      setSaveSuccess(false);
    } catch (error: any) {
      console.error('AI提取错误详情:', error);
      const errorMessage = error.message || '提取失败，请重试';
      setExtractError(errorMessage);
      
      // 显示更详细的错误信息
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_CLOSED') || errorMessage.includes('API服务连接失败')) {
        const detailedError = `API服务连接失败！\n\n可能的原因：\n1. 硅基流动API服务暂时不可用\n2. API地址可能需要更新\n3. 网络连接问题\n\n解决方案：\n- 检查网络连接\n- 稍后重试\n- 或配置其他AI服务（OpenAI/Gemini）\n\n详细错误: ${errorMessage}`;
        alert(detailedError);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // 保存到Supabase
  const handleSave = async () => {
    // 验证必填字段
    if (!formData.title || !formData.context_summary || !formData.conflict_detail || !formData.resolution_outcome) {
      alert('请填写所有必填字段！');
      return;
    }

    setIsSaving(true);
    setExtractError(null);

    try {
      // 1. 生成向量嵌入（用于 RAG 搜索，失败也继续保存）
      const textForEmbedding = [
        formData.title,
        formData.context_summary,
        formData.conflict_detail,
        formData.resolution_outcome,
      ].join('\n');

      let embedding: number[] | undefined;
      try {
        embedding = await generateEmbedding(textForEmbedding);
      } catch (embedError) {
        console.warn('向量生成失败，将保存不带向量的记录', embedError);
        // 即使向量生成失败，也继续保存案例
      }

      // 2. 保存到 Supabase
      const savedCase = await saveCaseToSupabase(
        {
          title: formData.title!,
          tags: formData.tags || [],
          category: formData.category as StatKey,
          context_summary: formData.context_summary!,
          conflict_detail: formData.conflict_detail!,
          resolution_outcome: formData.resolution_outcome!,
          expert_comment: formData.expert_comment,
          source: (formData.source as CaseSource) || 'expert_contribution',
          original_text: formData.original_text,
          status: 'published', // 管理员提交默认公开发布
        },
        embedding
      );

      setSaveSuccess(true);
      
      // 清空表单
      setTimeout(() => {
        setRawText('');
        setFormData({
          title: '',
          tags: [],
          category: 'governance',
          context_summary: '',
          conflict_detail: '',
          resolution_outcome: '',
          expert_comment: '',
          source: 'official_report',
        });
        setSaveSuccess(false);
      }, 2000);

      alert(`案例已保存！ID: ${savedCase.id}`);
    } catch (error: any) {
      setExtractError(error.message || '保存失败，请检查网络连接和Supabase配置');
      console.error('保存错误:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 更新表单字段
  const updateField = (field: keyof KnowledgeBaseCase, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 添加标签
  const handleAddTag = () => {
    const tagInput = prompt('请输入标签：');
    if (tagInput && tagInput.trim()) {
      updateField('tags', [...(formData.tags || []), tagInput.trim()]);
    }
  };

  // 删除标签
  const handleRemoveTag = (index: number) => {
    const newTags = [...(formData.tags || [])];
    newTags.splice(index, 1);
    updateField('tags', newTags);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="text-stone-600 hover:text-stone-800 transition-colors font-bold"
            >
              返回
            </button>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <span className="text-3xl">📝</span>
              <span>管理员案例录入</span>
            </h1>
          </div>
          {onReviewMode && (
            <button
              onClick={onReviewMode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-bold text-sm"
            >
              📋 审核管理
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：原始文本输入 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 h-full">
              <h2 className="text-lg font-bold text-stone-900 mb-4">原始文本</h2>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="请粘贴或输入原始案例文本..."
                className="w-full h-[600px] p-4 border-2 border-stone-300 rounded-lg resize-none focus:outline-none focus:border-red-500 font-mono text-sm"
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-stone-500">
                  字符数： {rawText.length}
                </span>
                <button
                  onClick={() => setRawText('')}
                  className="text-sm text-stone-600 hover:text-stone-800"
                >
                  清空
                </button>
              </div>
            </div>
          </div>

          {/* 中间：AI提取按钮 */}
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <button
                onClick={handleAIExtract}
                disabled={!rawText.trim() || isExtracting}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {isExtracting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI提取中...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🤖</span>
                    <span>AI 智能提取</span>
                  </>
                )}
              </button>
              {extractError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {extractError}
                </div>
              )}
              {saveSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  保存成功！                </div>
              )}
            </div>
          </div>

          {/* 右侧：结构化表单 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 h-full overflow-y-auto max-h-[800px]">
              <h2 className="text-lg font-bold text-stone-900 mb-4">结构化信息</h2>
              
              <div className="space-y-4">
                {/* 标题 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
                    placeholder="案例标题"
                  />
                </div>

                {/* 标签 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">标签</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.tags || []).map((tag, index) => (
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
                    className="text-sm text-red-600 hover:text-red-800 font-bold"
                  >
                    + 添加标签
                  </button>
                </div>

                {/* 类别 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    类别 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category || 'governance'}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="economy">💰 经济发展</option>
                    <option value="people">👥 民生福祉</option>
                    <option value="environment">🌲 生态环保</option>
                    <option value="governance">🚩 党建治理</option>
                  </select>
                </div>

                {/* 来源 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">案例来源</label>
                  <select
                    value={formData.source || 'official_report'}
                    onChange={(e) => updateField('source', e.target.value)}
                    className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500"
                  >
                    <option value="official_report">📋 官方报告</option>
                    <option value="field_experience">🏘️ 一线经验</option>
                    <option value="user_upload">👤 用户上传</option>
                    <option value="expert_contribution">🎓 专家贡献</option>
                  </select>
                </div>


                {/* 背景摘要 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    背景摘要 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.context_summary || ''}
                    onChange={(e) => updateField('context_summary', e.target.value)}
                    className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                    rows={4}
                    placeholder="提取核心背景信息..."
                  />
                </div>

                {/* 矛盾详情 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    矛盾详情 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.conflict_detail || ''}
                    onChange={(e) => updateField('conflict_detail', e.target.value)}
                    className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                    rows={4}
                    placeholder="分析主要矛盾和冲突点..."
                  />
                </div>

                {/* 解决结果 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">
                    解决结果 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.resolution_outcome || ''}
                    onChange={(e) => updateField('resolution_outcome', e.target.value)}
                    className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                    rows={4}
                    placeholder="总结处理结果和效果..."
                  />
                </div>

                {/* 专家点评 */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">专家点评</label>
                  <textarea
                    value={formData.expert_comment || ''}
                    onChange={(e) => updateField('expert_comment', e.target.value)}
                    className="w-full p-3 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                    rows={3}
                    placeholder="从专业角度给出点评..."
                  />
                </div>

                {/* 保存按钮 */}
                <div className="pt-4 border-t border-stone-200">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !formData.title || !formData.context_summary}
                    className="w-full py-4 bg-red-800 text-white rounded-xl font-bold shadow-lg hover:bg-red-900 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>保存中... ..</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>保存到知识库</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCaseUpload;

