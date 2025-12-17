import React, { useState } from 'react';
import { CardDraft, generateCardsFromDocMock } from '@/services/ai/aiMocks';
import { Card, GameConfig } from '@/types';

interface AIDockProps {
  isOpen: boolean;
  onToggle: () => void;
  onAddCardToStage: (card: Card) => void;
  config: GameConfig;
}

const AIDock: React.FC<AIDockProps> = ({ isOpen, onToggle, onAddCardToStage, config }) => {
  const [pasteText, setPasteText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<CardDraft[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleGenerate = async () => {
    if (!pasteText.trim() && !selectedFile) {
      alert('请先粘贴文本或上传文件！');
      return;
    }

    setIsGenerating(true);
    try {
      let textToProcess = pasteText;
      
      // 如果有文件，读取文件内容（简化版，实际应使用parseFile）
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileText = e.target?.result as string;
          const newDrafts = await generateCardsFromDocMock(fileText);
          setDrafts(newDrafts);
          setIsGenerating(false);
        };
        reader.readAsText(selectedFile);
      } else {
        const newDrafts = await generateCardsFromDocMock(textToProcess);
        setDrafts(newDrafts);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('生成失败，请重试');
      setIsGenerating(false);
    }
  };

  const handleAddDraft = (draft: CardDraft) => {
    const card: Card = {
      id: draft.id,
      npcId: draft.npcId,
      text: draft.text,
      options: {
        left: draft.options.left,
        right: draft.options.right,
      },
      tags: draft.tags,
    };
    onAddCardToStage(card);
  };

  return (
    <>
      {/* 收起/展开按钮 */}
      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-primary-red text-white px-2 py-8 rounded-l-lg shadow-lg transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-0'
        }`}
      >
        <span className="writing-vertical-rl text-xs font-bold">
          {isOpen ? '收起' : 'AI助手 ◀'}  
        </span>
      </button>

      {/* Dock内容 */}
      <div
        className={`fixed right-0 top-0 h-full bg-paper border-l border-ink-light z-30 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '360px' }}
      >
        <div className="p-4 border-b border-ink-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold font-serif text-lg text-primary-red">🤖 AI 创作助手</h2>
            <button onClick={onToggle} className="text-ink-medium hover:text-ink text-xl">
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 输入区域 */}
          <div>
            <label className="block text-xs font-bold text-ink-medium mb-2">粘贴文档内容</label>
            <textarea
              className="w-full p-2 border border-ink-light rounded-md text-xs min-h-[120px] focus:outline-none focus:border-primary-red"
              placeholder="粘贴政策文件、案例描述等文本内容..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
            />
          </div>

          <div className="border-t border-ink-light pt-4">
            <label className="block text-xs font-bold text-ink-medium mb-2">或上传文档文件</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs"
            />
            <p className="text-[10px] text-ink-medium mt-2">支持 PDF、Word、TXT 格式</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!pasteText.trim() && !selectedFile)}
            className="w-full py-2 bg-primary-red/10 hover:bg-primary-red/20 text-primary-red border border-primary-red/30 rounded-md text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '🤖 AI解析生成'}
          </button>

          {/* 生成的草稿列表 */}
          {drafts.length > 0 && (
            <div className="border-t border-ink-light pt-4">
              <h3 className="text-xs font-bold text-ink-medium mb-3">生成的卡牌草稿 ({drafts.length})</h3>
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3 bg-white/80 rounded-md border border-ink-light hover:border-primary-red transition-colors"
                  >
                    <div className="text-xs font-bold text-ink mb-2 line-clamp-2">
                      {draft.text}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span className="text-[10px] bg-ink-light px-2 py-0.5 rounded-md text-ink">
                        👈 {draft.options.left.text}
                      </span>
                      <span className="text-[10px] bg-ink-light px-2 py-0.5 rounded-md text-ink">
                        👉 {draft.options.right.text}
                      </span>
                    </div>
                    {draft.confidence && (
                      <div className="text-[10px] text-ink-medium mb-2">
                        可信度: {Math.round(draft.confidence * 100)}%
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddDraft(draft)}
                        className="flex-1 py-1.5 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/30 rounded-md text-xs font-bold transition"
                      >
                        + 加入当前阶段
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AIDock;
