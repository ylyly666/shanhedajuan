import React, { useState, useEffect } from 'react';
import { GameConfig, StoryNpc, Card } from '@/types';
import { generateCardsFromDocMock, CardDraft } from '@/services/ai/aiMocks';
import { parseFile } from '@/utils/file/fileParser';

type AssetsTab = 'npc' | 'randomEvents' | 'documents';

interface AssetsDrawerProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  isOpen: boolean;
  onToggle: () => void;
  onFileUpload: (file: File) => void;
  onTextPaste: (text: string) => void;
  activeStageId: string;
}

const AssetsDrawer: React.FC<AssetsDrawerProps> = ({
  config,
  setConfig,
  isOpen,
  onToggle,
  onFileUpload,
  onTextPaste,
  activeStageId,
}) => {
  const [activeTab, setActiveTab] = useState<AssetsTab>('npc');
  const [pasteText, setPasteText] = useState('');
  const [editingNPC, setEditingNPC] = useState<StoryNpc | null>(null);
  const [editingRandomEvent, setEditingRandomEvent] = useState<Card | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [aiDrafts, setAiDrafts] = useState<CardDraft[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const storyNpcs = config.storyNpcs || config.npcs || [];
  const randomEventLibrary = config.randomEventLibrary || [];

  // 调试：打印NPC信息
  useEffect(() => {
    if (storyNpcs.length > 0) {
      console.log('AssetsDrawer - NPC列表:', storyNpcs.map(n => ({ id: n.id, name: n.name, avatarUrl: n.avatarUrl })));
    }
  }, [storyNpcs]);

  const handleTextPaste = async () => {
    if (!pasteText.trim()) return;
    
    setIsGenerating(true);
    try {
      const drafts = await generateCardsFromDocMock(pasteText);
      setAiDrafts(drafts);
      onTextPaste(pasteText);
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUploadForAI = async (file: File) => {
    try {
      const text = await parseFile(file);
      setPasteText(text);
      setIsGenerating(true);
      try {
        const drafts = await generateCardsFromDocMock(text);
        setAiDrafts(drafts);
      } catch (error) {
        console.error('AI生成失败:', error);
        alert('生成失败，请重试');
      } finally {
        setIsGenerating(false);
      }
    } catch (error: any) {
      alert(`文件解析失败: ${error.message}`);
    }
  };

  const handleAddDraftToStage = (draft: CardDraft) => {
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

    const newStages = config.stages.map((stage) => {
      if (stage.id !== activeStageId) return stage;
      return { ...stage, cards: [...stage.cards, card] };
    });
    setConfig({ ...config, stages: newStages });
    alert(`已添加卡牌到当前阶段！`);
  };

  // NPC 编辑表单状态
  const [npcFormData, setNpcFormData] = useState<StoryNpc>({
    id: `npc_${Date.now()}`,
    name: '',
    role: '',
    avatarUrl: 'https://picsum.photos/seed/npc/200/200',
    description: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>(npcFormData.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  const normalizeRandomEvent = (event: Card): Card => {
    const ensureDelta = (opt: any) => {
      const delta = opt?.delta || {};
      return {
        ...opt,
        delta: {
          economy: delta.economy ?? 0,
          people: delta.people ?? 0,
          environment: delta.environment ?? 0,
          civility: delta.civility ?? 0,
        },
      };
    };
    return {
      ...event,
      options: {
        left: ensureDelta(event.options.left),
        right: ensureDelta(event.options.right),
      },
      tags: event.tags || ['随机事件'],
    };
  };

  // 随机事件编辑表单状态
  const [randomEventFormData, setRandomEventFormData] = useState<Card>(() =>
    normalizeRandomEvent({
      id: `random_event_${Date.now()}`,
      npcId: storyNpcs[0]?.id || 'npc_secretary',
      text: '请输入随机事件内容...',
      options: {
        left: { text: '选项A', delta: {} },
        right: { text: '选项B', delta: {} },
      },
      tags: ['随机事件'],
    })
  );

  // 处理NPC图片上传
  const handleNPCImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件！');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB！');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setNpcFormData({ ...npcFormData, avatarUrl: base64String });
      setAvatarPreview(base64String);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('图片读取失败，请重试！');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 保存NPC
  const handleSaveNPC = () => {
    if (!npcFormData.name.trim() || !npcFormData.role.trim()) {
      alert('请填写NPC姓名和角色！');
      return;
    }

    const npcs = config.storyNpcs || config.npcs || [];
    if (editingNPC) {
      const updated = npcs.map((n: any) => (n.id === editingNPC.id ? npcFormData : n));
      setConfig({ ...config, storyNpcs: updated });
    } else {
      setConfig({ ...config, storyNpcs: [...npcs, npcFormData] });
    }
    setEditingNPC(null);
    setViewMode('list');
    setNpcFormData({
      id: `npc_${Date.now()}`,
      name: '',
      role: '',
      avatarUrl: 'https://picsum.photos/seed/npc/200/200',
      description: '',
    });
  };

  // 保存随机事件
  const handleSaveRandomEvent = () => {
    if (!randomEventFormData.text.trim()) {
      alert('请输入事件描述！');
      return;
    }
    if (!randomEventFormData.options.left.text.trim() || !randomEventFormData.options.right.text.trim()) {
      alert('请输入左右选项的文案！');
      return;
    }

    const library = config.randomEventLibrary || [];
    const payload = normalizeRandomEvent(randomEventFormData);
    if (editingRandomEvent) {
      const updated = library.map((c) => (c.id === editingRandomEvent.id ? payload : c));
      setConfig({ ...config, randomEventLibrary: updated });
    } else {
      setConfig({ ...config, randomEventLibrary: [...library, payload] });
    }
    setEditingRandomEvent(null);
    setViewMode('list');
    setRandomEventFormData(
      normalizeRandomEvent({
        id: `random_event_${Date.now()}`,
        npcId: storyNpcs[0]?.id || 'npc_secretary',
        text: '请输入随机事件内容...',
        options: {
          left: { text: '选项A', delta: {} },
          right: { text: '选项B', delta: {} },
        },
        tags: ['随机事件'],
      })
    );
  };

  // 当编辑NPC时，更新表单数据
  useEffect(() => {
    if (editingNPC && activeTab === 'npc') {
      setViewMode('edit');
      setNpcFormData(editingNPC);
      setAvatarPreview(editingNPC.avatarUrl);
    } else if (editingRandomEvent && activeTab === 'randomEvents') {
      setViewMode('edit');
      setRandomEventFormData(normalizeRandomEvent(editingRandomEvent));
    }
  }, [editingNPC, editingRandomEvent, activeTab]);

  return (
    <>
      {/* 资源库内容 - 始终显示，固定在左侧 */}
      <div
        className="h-full bg-paper border-r border-ink-light z-30 flex flex-col flex-shrink-0"
        style={{ width: '320px' }}
      >
        <div className="p-4 border-b border-ink-light">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold font-serif text-lg text-primary-red">📦 资源库</h2>
          </div>

          {/* Tab切换 */}
          <div className="flex gap-2">
            {[
              { id: 'npc' as AssetsTab, label: 'NPC', icon: '👤' },
              { id: 'randomEvents' as AssetsTab, label: '随机事件', icon: '🎲' },
              { id: 'documents' as AssetsTab, label: 'AI助手', icon: '🤖' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setViewMode('list');
                  setEditingNPC(null);
                  setEditingRandomEvent(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition ${
                  activeTab === tab.id
                    ? 'bg-primary-red text-white'
                    : 'bg-ink-light text-ink-medium hover:bg-ink-medium hover:text-ink'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* NPC Tab */}
          {activeTab === 'npc' && (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setEditingNPC(null);
                      setViewMode('edit');
                      setNpcFormData({
                        id: `npc_${Date.now()}`,
                        name: '',
                        role: '',
                        avatarUrl: 'https://picsum.photos/seed/npc/200/200',
                        description: '',
                      });
                      setAvatarPreview('https://picsum.photos/seed/npc/200/200');
                    }}
                    className="w-full py-2 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/30 rounded-md text-xs font-bold transition"
                  >
                    + 新建NPC
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    {storyNpcs.map((npc: any) => (
                      <div
                        key={npc.id}
                        onClick={() => {
                          setEditingNPC(npc);
                          setViewMode('edit');
                        }}
                        className="flex flex-col items-center bg-white/80 p-2 rounded-md border border-ink-light hover:border-primary-red cursor-pointer transition-colors"
                      >
                        <img
                          src={npc.avatarUrl}
                          className="w-12 h-12 rounded-full mb-2 object-cover"
                          alt={npc.name}
                          onError={(e) => {
                            console.error('NPC图片加载失败:', npc.avatarUrl, npc.name);
                            // 如果图片加载失败，使用默认占位符
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAxNkMyNy4zMTM3IDE2IDMwIDE4LjY4NjMgMzAgMjJDMzAgMjUuMzEzNyAyNy4zMTM3IDI4IDI0IDI4QzIwLjY4NjMgMjggMTggMjUuMzEzNyAxOCAyMkMxOCAxOC42ODYzIDIwLjY4NjMgMTYgMjQgMTZaIiBmaWxsPSIjOUI5Q0E0Ii8+CjxwYXRoIGQ9Ik0xMiAzNkMxMiAzMC40NzcgMTYuNDc3IDI2IDIyIDI2SDI2QzMxLjUyMyAyNiAzNiAzMC40NzcgMzYgMzZIMTJaIiBmaWxsPSIjOUI5Q0E0Ii8+Cjwvc3ZnPgo=';
                          }}
                          onLoad={() => {
                            console.log('NPC图片加载成功:', npc.avatarUrl, npc.name);
                          }}
                        />
                        <span className="text-xs font-bold text-ink truncate w-full text-center">
                          {npc.name}
                        </span>
                        <span className="text-[10px] text-ink-medium truncate w-full text-center">
                          {npc.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink">
                      {editingNPC ? '编辑NPC' : '新建NPC'}
                    </h3>
                    <button
                      onClick={() => {
                        setViewMode('list');
                        setEditingNPC(null);
                      }}
                      className="text-xs text-ink-medium hover:text-ink"
                    >
                      返回
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-medium mb-2">头像</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-ink-light">
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleNPCImageUpload}
                        disabled={isUploading}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-medium mb-1">姓名 *</label>
                    <input
                      type="text"
                      value={npcFormData.name}
                      onChange={(e) => setNpcFormData({ ...npcFormData, name: e.target.value })}
                      className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md text-sm"
                      placeholder="例如：张大爷"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-medium mb-1">角色 *</label>
                    <input
                      type="text"
                      value={npcFormData.role}
                      onChange={(e) => setNpcFormData({ ...npcFormData, role: e.target.value })}
                      className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md text-sm"
                      placeholder="例如：养鱼大叔"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-medium mb-1">描述</label>
                    <textarea
                      value={npcFormData.description || ''}
                      onChange={(e) => setNpcFormData({ ...npcFormData, description: e.target.value })}
                      className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md text-sm min-h-[60px]"
                      placeholder="NPC描述（可选）"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNPC}
                      className="flex-1 py-2 bg-accent-green hover:bg-accent-green/80 text-white rounded-md text-xs font-bold"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('list');
                        setEditingNPC(null);
                      }}
                      className="px-4 py-2 bg-ink-light hover:bg-ink-medium text-ink rounded-md text-xs font-bold"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 随机事件 Tab */}
          {activeTab === 'randomEvents' && (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setEditingRandomEvent(null);
                      setViewMode('edit');
                      setRandomEventFormData({
                        id: `random_event_${Date.now()}`,
                        npcId: storyNpcs[0]?.id || 'npc_secretary',
                        text: '请输入随机事件内容...',
                        options: {
                          left: { text: '选项A', delta: {} },
                          right: { text: '选项B', delta: {} },
                        },
                        tags: ['随机事件'],
                      });
                    }}
                    className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-md text-xs font-bold transition"
                  >
                    + 新建随机事件
                  </button>
                  <div className="space-y-2">
                    {randomEventLibrary.length === 0 ? (
                      <p className="text-xs text-ink-medium text-center py-4">暂无随机事件</p>
                    ) : (
                      randomEventLibrary.slice(0, 10).map((card) => (
                        <div
                          key={card.id}
                          onClick={() => {
                            setEditingRandomEvent(card);
                            setViewMode('edit');
                          }}
                          className="p-2 bg-white/80 rounded-md border border-ink-light hover:border-blue-500 cursor-pointer transition-colors"
                        >
                          <div className="text-xs font-bold text-ink truncate mb-1">
                            {card.text.substring(0, 30)}...
                          </div>
                          <div className="text-[10px] text-ink-medium">
                            {storyNpcs.find((n: any) => n.id === card.npcId)?.name || 'Unknown'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink">
                      {editingRandomEvent ? '编辑随机事件' : '新建随机事件'}
                    </h3>
                    <button
                      onClick={() => {
                        setViewMode('list');
                        setEditingRandomEvent(null);
                      }}
                      className="text-xs text-ink-medium hover:text-ink"
                    >
                      返回
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-medium mb-1">关联 NPC</label>
                    <select
                      className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md text-sm"
                      value={randomEventFormData.npcId}
                      onChange={(e) => setRandomEventFormData({ ...randomEventFormData, npcId: e.target.value })}
                    >
                      {storyNpcs.map((n: any) => (
                        <option key={n.id} value={n.id}>
                          {n.name} - {n.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-medium mb-1">事件描述</label>
                    <textarea
                      className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink text-sm min-h-[80px] rounded-md"
                      value={randomEventFormData.text}
                      onChange={(e) => setRandomEventFormData({ ...randomEventFormData, text: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    {(['left', 'right'] as const).map((side) => {
                      const option = randomEventFormData.options[side];
                      return (
                        <div
                          key={side}
                          className="p-3 bg-white/90 rounded-lg border border-ink-light shadow-sm space-y-3"
                        >
                          <label className="text-xs font-bold text-ink bg-ink-light px-2 py-1 rounded-md inline-block font-serif">
                            {side === 'left' ? '👈 左滑选项' : '👉 右滑选项'}
                          </label>

                          <input
                            type="text"
                            className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md text-sm"
                            value={option.text}
                            onChange={(e) =>
                              setRandomEventFormData({
                                ...randomEventFormData,
                                options: {
                                  ...randomEventFormData.options,
                                  [side]: { ...option, text: e.target.value },
                                },
                              })
                            }
                            placeholder="选项文案"
                          />

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-ink">
                            {(['economy', 'people', 'environment', 'civility'] as const).map((k) => (
                              <label key={k} className="flex items-center gap-2">
                                <span className="text-[10px] uppercase text-ink-medium w-16 font-serif">{k.substring(0, 4)}</span>
                                <input
                                  type="number"
                                  className="w-full p-1.5 border border-ink-light rounded bg-white focus:outline-none focus:border-primary-red text-xs"
                                  value={option.delta[k] || 0}
                                  onChange={(e) => {
                                    const v = parseInt(e.target.value || '0', 10);
                                    setRandomEventFormData({
                                      ...randomEventFormData,
                                      options: {
                                        ...randomEventFormData.options,
                                        [side]: {
                                          ...option,
                                          delta: { ...option.delta, [k]: isNaN(v) ? 0 : v },
                                        },
                                      },
                                    });
                                  }}
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveRandomEvent}
                      className="flex-1 py-2 bg-accent-green hover:bg-accent-green/80 text-white rounded-md text-xs font-bold"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('list');
                        setEditingRandomEvent(null);
                      }}
                      className="px-4 py-2 bg-ink-light hover:bg-ink-medium text-ink rounded-md text-xs font-bold"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI助手 Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-medium mb-2">粘贴文档内容</label>
                <textarea
                  className="w-full p-2 border border-ink-light rounded-md text-xs min-h-[120px] focus:outline-none focus:border-primary-red"
                  placeholder="粘贴政策文件、案例描述等文本内容..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                />
                <button
                  onClick={handleTextPaste}
                  disabled={!pasteText.trim() || isGenerating}
                  className="w-full mt-2 py-2 bg-primary-red/10 hover:bg-primary-red/20 text-primary-red border border-primary-red/30 rounded-md text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '生成中...' : '🤖 AI解析生成'}
                </button>
              </div>

              <div className="border-t border-ink-light pt-4">
                <label className="block text-xs font-bold text-ink-medium mb-2">或上传文档文件</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUploadForAI(file);
                  }}
                  className="w-full text-xs"
                />
                <p className="text-[10px] text-ink-medium mt-2">支持 PDF、Word、TXT 格式</p>
              </div>

              {/* 生成的卡牌草稿列表 */}
              {aiDrafts.length > 0 && (
                <div className="border-t border-ink-light pt-4">
                  <h3 className="text-xs font-bold text-ink-medium mb-3">
                    生成的卡牌草稿({aiDrafts.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {aiDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="p-2 bg-white/80 rounded-md border border-ink-light hover:border-primary-red transition-colors"
                      >
                        <div className="text-xs font-bold text-ink mb-1 line-clamp-2">
                          {draft.text}
                        </div>
                        <div className="flex gap-1 mb-2">
                          <span className="text-[10px] bg-ink-light px-1.5 py-0.5 rounded text-ink">
                            👈 {draft.options.left.text}
                          </span>
                          <span className="text-[10px] bg-ink-light px-1.5 py-0.5 rounded text-ink">
                            👉 {draft.options.right.text}
                          </span>
                        </div>
                        {draft.confidence && (
                          <div className="text-[10px] text-ink-medium mb-2">
                            可信度 {Math.round(draft.confidence * 100)}%
                          </div>
                        )}
                        <button
                          onClick={() => handleAddDraftToStage(draft)}
                          className="w-full py-1.5 bg-accent-green/10 hover:bg-accent-green/20 text-accent-green border border-accent-green/30 rounded-md text-xs font-bold transition"
                        >
                          + 加入当前阶段
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AssetsDrawer;
