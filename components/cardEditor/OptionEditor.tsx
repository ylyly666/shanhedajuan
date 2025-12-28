import React from 'react';
import type { Card, CardOption, StatKey } from '@/types';

interface OptionEditorProps {
  label: string;
  option: CardOption;
  onChange: (option: CardOption) => void;
  onCreateFollowUp?: () => void;
}

const OptionEditor: React.FC<OptionEditorProps> = ({
  label,
  option,
  onChange,
  onCreateFollowUp,
}) => {
  const updateDelta = (key: StatKey, val: string) => {
    const num = parseInt(val) || 0;
    onChange({ ...option, delta: { ...option.delta, [key]: num } });
  };

  const handleCreateFollowUpClick = () => {
    if (onCreateFollowUp) {
      onCreateFollowUp();
    } else {
      console.warn('onCreateFollowUp not provided');
    }
  };

  return (
    <div className="space-y-3" data-testid={`option-editor-${label}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-ink bg-ink-light px-2 py-1 rounded-md inline-block font-serif">
          {label}
        </label>
        <button
          disabled={Boolean(option.followUpCardId)}
          onClick={(e) => {
            e.preventDefault();
            handleCreateFollowUpClick();
          }}
          className={`
            text-xs px-2 py-1 border rounded-md font-bold transition
            ${option.followUpCardId
              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
              : 'bg-primary-red/15 hover:bg-primary-red/25 text-primary-red border-primary-red/30'}
          `}
          title={option.followUpCardId ? '已创建后续卡' : '创建后续卡'}
        >
          {option.followUpCardId ? '已创建后续卡' : '+ 创建后续卡'}
        </button>
      </div>

      <input
        type="text"
        className="w-full p-2 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink text-sm rounded-md"
        value={option.text}
        onChange={(e) => onChange({ ...option, text: e.target.value })}
        placeholder="选项文案"
      />

      <div className="grid grid-cols-2 gap-2">
        {(['economy', 'people', 'environment', 'civility'] as StatKey[]).map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-ink-medium w-8 font-serif">{key.substring(0, 4)}</span>
            <input
              type="number"
              className="w-full p-1 border-b-2 border-ink-light bg-transparent focus:outline-none focus:border-ink text-xs rounded-md"
              value={option.delta[key] || 0}
              onChange={(e) => updateDelta(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200 pt-3 text-xs text-stone-600">
        {/* 已关联的提示改为按钮文案提示，底部文案省略 */}
      </div>
    </div>
  );
};

export default OptionEditor;

