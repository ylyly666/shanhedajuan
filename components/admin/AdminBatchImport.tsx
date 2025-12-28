import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { StatKey } from '@/types';
import { saveCaseToSupabase, generateEmbedding, KnowledgeBaseCase, CaseSource } from '@/services/database/supabase';

interface ExcelRow {
  事件名称?: string;
  所属类别?: string;
  上传者?: string;
  背景摘要?: string;
  矛盾详情?: string;
  解决结果?: string;
  专家点评?: string;
  标签?: string;
  [key: string]: any; // 允许其他字段
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; title: string; error: string }>;
}

interface AdminBatchImportProps {
  onBack: () => void;
}

const AdminBatchImport: React.FC<AdminBatchImportProps> = ({ onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);

  // 映射中文类别到英文
  const mapCategory = (chineseCategory: string): StatKey => {
    const categoryMap: Record<string, StatKey> = {
      '经济发展': 'economy',
      '民生福祉': 'people',
      '生态环境': 'environment',
      '生态环保': 'environment',
      '乡风民俗': 'civility',
      '基层治理': 'civility',
      '乡风民俗/基层治理': 'civility',
    };
    
    const normalized = chineseCategory?.trim() || '';
    return categoryMap[normalized] || 'civility'; // 默认值
  };

  // 解析标签字符串为数组
  const parseTags = (tagStr: string): string[] => {
    if (!tagStr || !tagStr.trim()) return [];
    
    // 支持格式: "#标签1 #标签2" 或 "标签1,标签2" 或 "标签1 标签2"
    const tags: string[] = [];
    
    // 先尝试匹配 #标签 格式
    const hashTagMatches = tagStr.match(/#([^#\s]+)/g);
    if (hashTagMatches) {
      return hashTagMatches.map(match => match.replace('#', ''));
    }
    
    // 尝试逗号分隔
    if (tagStr.includes(',')) {
      return tagStr.split(',').map(t => t.trim()).filter(t => t);
    }
    
    // 尝试空格分隔
    return tagStr.split(/\s+/).map(t => t.trim().replace(/^#/, '')).filter(t => t);
  };

  // 验证行数据
  const validateRow = (row: ExcelRow, rowIndex: number): string | null => {
    if (!row.事件名称 || !row.事件名称.trim()) {
      return `第${rowIndex + 1}行：缺少"事件名称"`;
    }
    if (!row.背景摘要 || !row.背景摘要.trim()) {
      return `第${rowIndex + 1}行：缺少"背景摘要"`;
    }
    if (!row.矛盾详情 || !row.矛盾详情.trim()) {
      return `第${rowIndex + 1}行：缺少"矛盾详情"`;
    }
    if (!row.解决结果 || !row.解决结果.trim()) {
      return `第${rowIndex + 1}行：缺少"解决结果"`;
    }
    return null;
  };

  // 预览Excel文件
  const handleFilePreview = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      if (rows.length === 0) {
        alert('Excel文件为空，请检查文件内容');
        return;
      }

      setPreviewData(rows.slice(0, 5)); // 只预览前5行
      setImportResult(null);
    } catch (error: any) {
      alert(`文件解析失败：${error.message}`);
    }
  };

  // 执行批量导入
  const handleBatchImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportResult(null);
    setCurrentProgress({ current: 0, total: 0 });

    try {
      // 1. 解析Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      if (rows.length === 0) {
        alert('Excel文件为空');
        setIsProcessing(false);
        return;
      }

      setCurrentProgress({ current: 0, total: rows.length });

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      // 2. 逐行处理
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        setCurrentProgress({ current: i + 1, total: rows.length });

        // 验证
        const validationError = validateRow(row, i);
        if (validationError) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            title: row.事件名称 || `第${i + 1}行`,
            error: validationError,
          });
          continue;
        }

        try {
          // 构建案例数据
          const caseData: KnowledgeBaseCase = {
            id: '', // 由Supabase生成
            title: row.事件名称!.trim(),
            category: mapCategory(row.所属类别 || ''),
            author_display: row.上传者?.trim() || undefined,
            context_summary: row.背景摘要!.trim(),
            conflict_detail: row.矛盾详情!.trim(),
            resolution_outcome: row.解决结果!.trim(),
            expert_comment: row.专家点评?.trim() || undefined,
            tags: parseTags(row.标签 || ''),
            source: 'official_report' as CaseSource,
            status: 'published',
          };

          // 生成向量嵌入（可选，失败也继续）
          let embedding: number[] | undefined;
          try {
            const textForEmbedding = [
              caseData.title,
              caseData.context_summary,
              caseData.conflict_detail,
              caseData.resolution_outcome,
            ].join('\n');
            const generatedEmbedding = await generateEmbedding(textForEmbedding);
            // 确保不是空数组
            if (generatedEmbedding && Array.isArray(generatedEmbedding) && generatedEmbedding.length > 0) {
              embedding = generatedEmbedding;
            }
          } catch (embedError) {
            console.warn(`第${i + 1}行向量生成失败，继续保存（不带向量）`, embedError);
            embedding = undefined; // 确保是 undefined，不是空数组
          }

          // 保存到Supabase（只有有效的embedding才会发送）
          await saveCaseToSupabase(caseData, embedding);
          result.success++;

          // 添加小延迟，避免请求过快
          if (i < rows.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            title: row.事件名称 || `第${i + 1}行`,
            error: error.message || '保存失败',
          });
          console.error(`第${i + 1}行导入失败:`, error);
        }
      }

      setImportResult(result);
      setPreviewData([]);
    } catch (error: any) {
      alert(`导入失败：${error.message}`);
      console.error('批量导入错误:', error);
    } finally {
      setIsProcessing(false);
      setCurrentProgress({ current: 0, total: 0 });
      // 清空文件输入
      event.target.value = '';
    }
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
              ← 返回
            </button>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              <span>批量导入案例</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 说明卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4">📋 导入格式说明</h2>
          <div className="space-y-2 text-sm text-stone-700">
            <p><strong>Excel表头要求：</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>事件名称</strong>（必填）- 案例标题</li>
              <li><strong>所属类别</strong>（必填）- 经济发展/民生福祉/生态环境/乡风民俗/基层治理</li>
              <li><strong>上传者</strong>（可选）- 如：政府、基层干部、村民等</li>
              <li><strong>背景摘要</strong>（必填）- 事件起因、背景</li>
              <li><strong>矛盾详情</strong>（必填）- 核心冲突、困难点</li>
              <li><strong>解决结果</strong>（必填）- 处理措施及成效</li>
              <li><strong>专家点评</strong>（可选）- 经验总结或警示意义</li>
              <li><strong>标签</strong>（可选）- 格式："#标签1 #标签2" 或 "标签1,标签2"</li>
            </ul>
            <p className="mt-4 text-red-600"><strong>注意：</strong>导入的案例将直接发布（status=published），无需审核。</p>
          </div>
        </div>

        {/* 文件上传区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4">📁 选择Excel文件</h2>
          
          <div className="space-y-4">
            {/* 预览模式 */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                预览文件（不导入）
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFilePreview}
                disabled={isProcessing}
                className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 disabled:opacity-50"
              />
            </div>

            {/* 导入模式 */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                执行导入（保存到数据库）
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleBatchImport}
                disabled={isProcessing}
                className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 disabled:opacity-50"
              />
            </div>
          </div>

          {/* 预览数据 */}
          {previewData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-stone-700 mb-2">预览（前5行）</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-stone-300">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="px-3 py-2 border border-stone-300 text-left">事件名称</th>
                      <th className="px-3 py-2 border border-stone-300 text-left">所属类别</th>
                      <th className="px-3 py-2 border border-stone-300 text-left">上传者</th>
                      <th className="px-3 py-2 border border-stone-300 text-left">标签</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-3 py-2 border border-stone-300">{row.事件名称 || '-'}</td>
                        <td className="px-3 py-2 border border-stone-300">{row.所属类别 || '-'}</td>
                        <td className="px-3 py-2 border border-stone-300">{row.上传者 || '-'}</td>
                        <td className="px-3 py-2 border border-stone-300">{row.标签 || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 进度显示 */}
          {isProcessing && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-blue-900">
                  正在导入...
                </span>
                <span className="text-sm text-blue-700">
                  {currentProgress.current} / {currentProgress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentProgress.current / currentProgress.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* 导入结果 */}
        {importResult && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">📊 导入结果</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-700">{importResult.success}</div>
                <div className="text-sm text-green-600 mt-1">成功</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-700">{importResult.failed}</div>
                <div className="text-sm text-red-600 mt-1">失败</div>
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-stone-700">
                  {importResult.success + importResult.failed}
                </div>
                <div className="text-sm text-stone-600 mt-1">总计</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-stone-700 mb-2">❌ 失败详情</h3>
                <div className="max-h-64 overflow-y-auto border border-stone-300 rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-stone-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left border-b border-stone-300">行号</th>
                        <th className="px-3 py-2 text-left border-b border-stone-300">事件名称</th>
                        <th className="px-3 py-2 text-left border-b border-stone-300">错误信息</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((error, idx) => (
                        <tr key={idx} className="border-b border-stone-200">
                          <td className="px-3 py-2">{error.row}</td>
                          <td className="px-3 py-2">{error.title}</td>
                          <td className="px-3 py-2 text-red-600">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBatchImport;

