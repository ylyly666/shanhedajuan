import React, { useState, useEffect } from 'react';
import { GameConfig, Stage } from '@/types';
import { loadGameConfig } from '@/utils/storage/storage';
import { EDITOR_SAMPLE_CONFIG } from '@/constants';
import TopNav, { EditorView } from '@/components/shared/TopNav';
// @ts-ignore
import CrisisConfigPage from '@/components/editor/CrisisConfigPage';
import TimelineEditor from '@/components/editor/TimelineEditor';

interface EditorProps {
  config: GameConfig;
  setConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onLaunchPreview: () => void;
  onBack?: () => void;
}

const Editor: React.FC<EditorProps> = ({ config, setConfig, onLaunchPreview, onBack }) => {
  const [activeStageId, setActiveStageId] = useState<string>(config.stages[0]?.id || '');
  const [currentView, setCurrentView] = useState<EditorView>('timeline');

  // 确保有默认阶段
  useEffect(() => {
    if (!config.stages || config.stages.length === 0) {
      // 如果没有阶段，创建一个默认阶段
      const defaultStage: Stage = {
        id: 'stage_default',
        title: '默认阶段',
        description: '添加您的第一个阶段',
        cards: []
      };
      setConfig({ ...config, stages: [defaultStage] });
      setActiveStageId('stage_default');
    } else if (!activeStageId || !config.stages.find(s => s.id === activeStageId)) {
      // 如果当前阶段不存在，选择第一个阶段
      setActiveStageId(config.stages[0].id);
    }
  }, [config.stages]);

  // 初次加载时读取 localStorage
  useEffect(() => {
    const saved = loadGameConfig();

    if (saved && saved.stages && saved.stages.length > 0) {
      // 合并保存的配置和最新的默认配置，确保NPC图片路径是最新的
      const sample = JSON.parse(JSON.stringify(EDITOR_SAMPLE_CONFIG));
      const mergedConfig: GameConfig = {
        ...saved,
        // 确保使用最新的NPC配置（包含正确的图片路径）
        storyNpcs: sample.storyNpcs || saved.storyNpcs,
        npcs: sample.npcs || saved.npcs,
        crisisNpcs: sample.crisisNpcs || saved.crisisNpcs,
      };
      setConfig(mergedConfig);
      setActiveStageId(mergedConfig.stages[0]?.id || '');
    } else {
      const sample: GameConfig = JSON.parse(JSON.stringify(EDITOR_SAMPLE_CONFIG));
      setConfig(sample);
      setActiveStageId(sample.stages[0]?.id || '');
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-paper text-ink overflow-hidden">
      {/* TopNav */}
      <TopNav
        currentView={currentView}
        onViewChange={setCurrentView}
        onLaunchPreview={onLaunchPreview}
        onBack={onBack}
      />

      {/* Crisis Config Page */}
      {currentView === 'crisis' && (
        <CrisisConfigPage
          config={config}
          setConfig={setConfig}
          onBack={() => setCurrentView('timeline')}
        />
      )}

      {/* Timeline Editor View */}
      {currentView === 'timeline' && (
        <TimelineEditor
          config={config}
          setConfig={setConfig}
          activeStageId={activeStageId}
          setActiveStageId={setActiveStageId}
        />
      )}
    </div>
  );
};

export default Editor;
