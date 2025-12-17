import React, { useState, useEffect } from 'react';
import { StoryNpc, GameConfig } from '@/types';

interface InlineNPCFormProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onSave: (npc: StoryNpc) => void;
  onCancel: () => void;
}

const InlineNPCForm: React.FC<InlineNPCFormProps> = ({
  config,
  setConfig,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<StoryNpc>({
    id: `npc_${Date.now()}`,
    name: '',
    role: '',
    avatarUrl: 'https://picsum.photos/seed/npc/200/200',
    description: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string>(formData.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData({ ...formData, avatarUrl: base64String });
      setAvatarPreview(base64String);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('图片读取失败，请重试！');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setAvatarPreview(formData.avatarUrl);
  }, [formData.avatarUrl]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      alert('请填写NPC姓名和角色！');
      return;
    }

    const npcs = config.storyNpcs || config.npcs || [];
    setConfig({ ...config, storyNpcs: [...npcs, formData] });
    onSave(formData);
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-ink">+ 新建NPC</h4>
        <button
          onClick={onCancel}
          className="text-ink-medium hover:text-ink text-lg"
        >
          ×
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <label className="block text-xs font-bold text-ink-medium mb-2">头像</label>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-ink-light">
            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="mt-2 text-xs w-16"
          />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <label className="block text-xs font-bold text-ink-medium mb-1">姓名 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md text-sm"
              placeholder="例如：张大爷"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-medium mb-1">角色 *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink rounded-md text-sm"
              placeholder="例如：养鱼大叔"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 bg-accent-green hover:bg-accent-green/80 text-white rounded-md text-xs font-bold"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-ink-light hover:bg-ink-medium text-ink rounded-md text-xs font-bold"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default InlineNPCForm;

