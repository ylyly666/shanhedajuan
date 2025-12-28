import React, { useState } from 'react';
import { GameConfig, Card, Stage, StoryNpc, GameStats } from '@/types';
import * as XLSX from 'xlsx';

interface ImportRow {
  序号?: string | number;
  卡牌类型?: string; // 锚点卡/随机卡
  触发时间?: string; // 如"第1天"、"第2天"
  卡牌名称?: string;
  核心冲突摘要?: string;
  关键人物?: string;
  涉及核心维度?: string;
  详细文本?: string;
  左滑选项文本?: string;
  左滑选项影响?: string; // 如"经济+10，民生-10"
  右滑选项文本?: string;
  右滑选项影响?: string; // 如"经济-10，民生+10"
  阶段名称?: string; // 可选：指定添加到哪个阶段
}

interface CardImportProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onClose: () => void;
}

const CardImport: React.FC<CardImportProps> = ({ config, setConfig, onClose }) => {
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    imported: number;
    errors: string[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 解析影响字符串，如"经济+10，民生-10" -> {economy: 10, people: -10}
  const parseDelta = (deltaStr: string): Partial<GameStats> => {
    const delta: Partial<GameStats> = {};
    if (!deltaStr || !deltaStr.trim()) return delta;

    // 映射中文维度到英文key
    const dimensionMap: Record<string, keyof GameStats> = {
      经济: 'economy',
      民生: 'people',
      生态: 'environment',
      乡风: 'civility',
    };

    // 匹配模式：维度名+正负号+数字
    const regex = /([经济民生生态乡风]+)([+-]?\d+)/g;
    let match;
    while ((match = regex.exec(deltaStr)) !== null) {
      const dimension = match[1];
      const value = parseInt(match[2], 10);
      const key = dimensionMap[dimension];
      if (key) {
        delta[key] = (delta[key] || 0) + value;
      }
    }

    return delta;
  };

  // 根据人物名称查找或创建NPC
  const findOrCreateNpc = (npcName: string, role?: string): StoryNpc => {
    // 先尝试在现有NPC中查找
    const existing = config.storyNpcs?.find(npc => npc.name === npcName);
    if (existing) {
      return existing;
    }

    // 创建新NPC
    const npcId = `npc_${npcName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    const newNpc: StoryNpc = {
      id: npcId,
      name: npcName,
      role: role || '村民',
      avatarUrl: '/images/像素小人1.jpg', // 默认头像，后续可手动调整
      description: '',
    };

    return newNpc;
  };

  // 生成唯一卡牌ID
  const generateCardId = (cardName: string, index: number): string => {
    const cleanName = cardName.replace(/[【】\[\]《》]/g, '').replace(/\s+/g, '_');
    return `card_${cleanName}_${index}`;
  };

  // 解析Excel/CSV文件
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: ImportRow[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' } as any);

      if (rows.length === 0) {
        throw new Error('表格为空，请检查文件格式');
      }

      const errors: string[] = [];
      const importedCards: Card[] = [];
      const newNpcs: StoryNpc[] = [];
      const npcMap = new Map<string, StoryNpc>(); // 用于去重NPC

      // 处理每一行
      rows.forEach((row, index) => {
        try {
          // 跳过空行
          if (!row.卡牌名称 && !row.详细文本) {
            return;
          }

          // 验证必填字段
          if (!row.卡牌名称 || !row.详细文本) {
            errors.push(`第${index + 2}行：缺少必填字段（卡牌名称或详细文本）`);
            return;
          }

          if (!row.左滑选项文本 || !row.右滑选项文本) {
            errors.push(`第${index + 2}行：缺少选项文本`);
            return;
          }

          // 处理NPC - 支持多个NPC（用逗号或顿号分隔）
          const npcNamesStr = row.关键人物?.trim() || '村民';
          const npcNames = npcNamesStr.split(/[，,、]/).map(n => n.trim()).filter(n => n);
          const primaryNpcName = npcNames[0] || '村民';
          
          let npc = npcMap.get(primaryNpcName);
          if (!npc) {
            npc = findOrCreateNpc(primaryNpcName, primaryNpcName);
            npcMap.set(primaryNpcName, npc);
            newNpcs.push(npc);
          }

          // 解析选项影响
          const leftDelta = parseDelta(row.左滑选项影响 || '');
          const rightDelta = parseDelta(row.右滑选项影响 || '');

          // 创建卡牌
          const card: Card = {
            id: generateCardId(row.卡牌名称, index),
            npcId: npc.id,
            npcName: npc.name,
            text: row.详细文本.trim(),
            options: {
              left: {
                text: row.左滑选项文本.trim(),
                delta: leftDelta,
              },
              right: {
                text: row.右滑选项文本.trim(),
                delta: rightDelta,
              },
            },
            tags: row.涉及核心维度 ? [row.涉及核心维度] : [],
          };

          importedCards.push(card);
        } catch (error) {
          errors.push(`第${index + 2}行处理失败：${error instanceof Error ? error.message : String(error)}`);
        }
      });

      if (importedCards.length === 0) {
        throw new Error('没有成功导入任何卡牌，请检查数据格式');
      }

      // 更新配置
      setConfig((prevConfig) => {
        const updatedConfig = { ...prevConfig };

        // 添加新NPC
        const existingNpcIds = new Set(prevConfig.storyNpcs?.map(n => n.id) || []);
        const uniqueNewNpcs = newNpcs.filter(n => !existingNpcIds.has(n.id));
        updatedConfig.storyNpcs = [...(prevConfig.storyNpcs || []), ...uniqueNewNpcs];

        // 根据卡牌类型分配到不同位置
        const anchorCards: { card: Card; stageName?: string; triggerTime?: string }[] = [];
        const randomCards: Card[] = [];

        rows.forEach((row, index) => {
          const card = importedCards[index];
          if (!card) return;

          const cardType = row.卡牌类型?.trim();
          if (cardType === '随机卡') {
            randomCards.push(card);
          } else {
            anchorCards.push({
              card,
              stageName: row.阶段名称?.trim(),
              triggerTime: row.触发时间?.trim(),
            });
          }
        });

        // 将锚点卡添加到指定阶段或第一个阶段
        if (anchorCards.length > 0) {
          // 按阶段名称分组
          const cardsByStage = new Map<string, Card[]>();
          const defaultCards: Card[] = [];

          anchorCards.forEach(({ card, stageName }) => {
            if (stageName) {
              if (!cardsByStage.has(stageName)) {
                cardsByStage.set(stageName, []);
              }
              cardsByStage.get(stageName)!.push(card);
            } else {
              defaultCards.push(card);
            }
          });

          // 将卡牌添加到对应阶段
          cardsByStage.forEach((cards, stageName) => {
            let targetStage = updatedConfig.stages.find(s => s.title === stageName);
            
            if (!targetStage) {
              // 创建新阶段
              targetStage = {
                id: `stage_${stageName.replace(/\s+/g, '_')}_${Date.now()}`,
                title: stageName,
                description: '从表格导入的卡牌',
                cards: [],
              };
              updatedConfig.stages = [...(updatedConfig.stages || []), targetStage];
            }

            targetStage.cards = [...(targetStage.cards || []), ...cards];
          });

          // 将未指定阶段的卡牌添加到第一个阶段
          if (defaultCards.length > 0) {
            if (updatedConfig.stages.length > 0) {
              updatedConfig.stages[0].cards = [...(updatedConfig.stages[0].cards || []), ...defaultCards];
            } else {
              // 如果没有阶段，创建一个新阶段
              const newStage: Stage = {
                id: `stage_imported_${Date.now()}`,
                title: '导入的卡牌',
                description: '从表格导入的卡牌',
                cards: defaultCards,
              };
              updatedConfig.stages = [newStage];
            }
          }
        }

        // 将随机卡添加到随机事件库
        if (randomCards.length > 0) {
          updatedConfig.randomEventLibrary = [
            ...(prevConfig.randomEventLibrary || []),
            ...randomCards,
          ];
        }

        return updatedConfig;
      });

      setImportStatus({
        success: true,
        message: `成功导入 ${importedCards.length} 张卡牌`,
        imported: importedCards.length,
        errors: errors.length > 0 ? errors : [],
      });
    } catch (error) {
      setImportStatus({
        success: false,
        message: error instanceof Error ? error.message : '导入失败',
        imported: 0,
        errors: [],
      });
    } finally {
      setIsProcessing(false);
      // 清空文件输入
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stone-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-ink font-serif">导入卡牌</h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-ink transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 格式说明 */}
          <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
            <h3 className="font-bold text-ink mb-2">📋 导入格式说明</h3>
            <div className="text-sm text-ink-medium space-y-1">
              <p><strong>必填字段：</strong>卡牌名称、详细文本、左滑选项文本、右滑选项文本</p>
              <p><strong>卡牌类型：</strong>锚点卡（添加到阶段）或 随机卡（添加到随机事件库）</p>
              <p><strong>选项影响格式：</strong>维度名+数值，如"经济+10，民生-10"</p>
              <p><strong>支持的维度：</strong>经济、民生、生态、乡风</p>
              <p><strong>阶段名称：</strong>可选，指定锚点卡添加到哪个阶段（不填则添加到第一个阶段）</p>
            </div>
          </div>

          {/* 文件上传 */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              选择Excel或CSV文件
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="block w-full text-sm text-ink-medium
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-red file:text-white
                file:cursor-pointer
                hover:file:bg-[#A0353C]
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* 下载模板 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                // 创建示例数据
                const templateData: ImportRow[] = [
                  {
                    序号: 1,
                    卡牌类型: '锚点卡',
                    触发时间: '第1天',
                    卡牌名称: '省城到山村',
                    核心冲突摘要: '新任书记表态：迅速打开局面 vs 先当学生',
                    关键人物: '县委组织部副部长',
                    涉及核心维度: '民生 vs 经济',
                    详细文本: '"小张啊，关上门坐。"王副部长推了推眼镜，"这次选派你去云岭村，是县委反复考虑的结果。你是发改局的项目骨干，理论功底扎实，但基层经验确实是短板。"',
                    左滑选项文本: '"请组织放心，我一定尽快打开局面。"',
                    左滑选项影响: '民生-10',
                    右滑选项文本: '"基层情况复杂，我会先当好学生。"',
                    右滑选项影响: '经济-10',
                    阶段名称: '第一阶段：云岭三十日',
                  },
                ];

                const ws = (XLSX.utils as any).json_to_sheet(templateData);
                const wb = (XLSX.utils as any).book_new();
                (XLSX.utils as any).book_append_sheet(wb, ws, '卡牌数据');
                XLSX.writeFile(wb, '卡牌导入模板.xlsx');
              }}
              className="px-4 py-2 bg-stone-100 text-ink rounded-md hover:bg-stone-200 transition-colors text-sm font-medium"
            >
              📥 下载模板文件
            </button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // 可以打开格式说明文档
                alert('请参考导入格式说明，确保表格包含所有必填字段');
              }}
              className="text-sm text-primary-red hover:underline"
            >
              查看详细格式说明
            </a>
          </div>

          {/* 导入状态 */}
          {importStatus && (
            <div
              className={`p-4 rounded-lg ${
                importStatus.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {importStatus.success ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <p
                    className={`font-bold ${
                      importStatus.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {importStatus.message}
                  </p>
                  {importStatus.success && (
                    <p className="text-sm text-green-700 mt-1">
                      成功导入 {importStatus.imported} 张卡牌
                      {importStatus.errors.length > 0 && `，但有 ${importStatus.errors.length} 行存在错误`}
                    </p>
                  )}
                  {importStatus.errors.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <p className="font-semibold mb-1">错误详情：</p>
                      <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                        {importStatus.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 处理中提示 */}
          {isProcessing && (
            <div className="flex items-center gap-3 text-ink-medium">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-red"></div>
              <span>正在处理文件...</span>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-stone-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 text-ink rounded-md hover:bg-stone-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardImport;

