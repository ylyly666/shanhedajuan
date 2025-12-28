import React from 'react';

export type EditorView = 'timeline' | 'crisis' | 'preview';

interface TopNavProps {
  currentView: EditorView;
  onViewChange: (view: EditorView) => void;
  onLaunchPreview: () => void;
  onBack?: () => void;
  onImport?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ currentView, onViewChange, onLaunchPreview, onBack, onImport }) => {
  return (
    <div className="h-14 bg-white/80 backdrop-blur-sm border-b border-ink-light/30 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <span className="text-xl font-serif font-bold text-primary-red">⛰️ 山河答卷</span>
        <span className="text-xs bg-ink-light text-ink-medium px-2 py-1 rounded-md">Editor</span>
      </div>

      <div className="flex items-center gap-4">
        {/* 工作区切换 - 简洁风格 */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewChange('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              currentView === 'timeline'
                ? 'bg-primary-red text-white'
                : 'text-ink hover:bg-ink-light/20'
            }`}
          >
            📋 流程编排
          </button>
          <button
            onClick={() => onViewChange('crisis')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              currentView === 'crisis'
                ? 'bg-primary-red text-white'
                : 'text-ink hover:bg-ink-light/20'
            }`}
          >
            ⚠️ 危机配置
          </button>
          <button
            onClick={() => onLaunchPreview()}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              currentView === 'preview'
                ? 'bg-primary-red text-white'
                : 'text-ink hover:bg-ink-light/20'
            }`}
          >
            👁️ 预览导出
          </button>
        </div>

        {onImport && (
          <button
            onClick={onImport}
            className="text-xs text-ink hover:text-primary-red px-3 py-1 bg-ink-light/30 rounded-md hover:bg-ink-light/50 transition-colors flex items-center gap-1"
          >
            📥 导入卡牌
          </button>
        )}
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-ink hover:text-primary-red px-3 py-1 bg-ink-light/30 rounded-md hover:bg-ink-light/50 transition-colors"
          >
            ← 返回首页
          </button>
        )}
      </div>
    </div>
  );
};

export default TopNav;
