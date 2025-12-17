import React from 'react';
import type { Card } from '@/types';

interface CardNodeProps {
  card: Card;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  branch?: 'left' | 'right';
  parentId?: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  selected: string | null;
  dragHandleProps?: any;
  firstLevelParentId?: string | null;
  groupColor?: string;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  npcName?: string; // NPC 名称
  npcAvatarUrl?: string; // NPC 头像URL
}

const INDENT_PER_LEVEL = 32; // 每一层的缩进像素
const CONNECTOR_OFFSET = 16; // 连接线起始偏移

// 分支徽章（小三角）
const BranchBadge: React.FC<{ branch?: 'left' | 'right' }> = ({ branch }) => {
  if (!branch) return null;
  const label = branch === 'left' ? '◀' : '▶';
  return (
    <span className="absolute top-2 right-2 px-1 py-0.5 text-[10px] font-bold rounded bg-accent-green/15 text-accent-green border border-accent-green/30">
      {label}
    </span>
  );
};

const MoveButtons: React.FC<{
  depth: number;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  id: string;
}> = ({ depth, onMoveUp, onMoveDown, canMoveUp, canMoveDown, id }) => {
  if (depth !== 0) return null;
  return (
    <div className="absolute right-2 top-2 flex flex-col gap-1">
      <button
        className={`w-6 h-6 rounded text-[10px] flex items-center justify-center ${
          canMoveUp ? 'bg-ink-light/50 hover:bg-ink-light/70' : 'bg-ink-light/20 cursor-not-allowed'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (canMoveUp && onMoveUp) onMoveUp(id);
        }}
        disabled={!canMoveUp}
        aria-label="上移"
      >
        ▲
      </button>
      <button
        className={`w-6 h-6 rounded text-[10px] flex items-center justify-center ${
          canMoveDown ? 'bg-ink-light/50 hover:bg-ink-light/70' : 'bg-ink-light/20 cursor-not-allowed'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (canMoveDown && onMoveDown) onMoveDown(id);
        }}
        disabled={!canMoveDown}
        aria-label="下移"
      >
        ▼
      </button>
    </div>
  );
};

const toAlpha = (hslColor?: string, alpha = 0.08) => {
  if (!hslColor) return undefined;
  // 将 hsl(h, s, l) 转换为 hsla(h, s, l, a)
  return hslColor.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
};

const CardNode: React.FC<CardNodeProps> = ({
  card,
  depth,
  isExpanded,
  hasChildren,
  branch,
  parentId,
  onToggle,
  onSelect,
  selected,
  dragHandleProps,
  firstLevelParentId,
  groupColor,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  npcName,
  npcAvatarUrl,
}) => {
  const indent = depth * INDENT_PER_LEVEL;
  const colorBarOffset = -8; // 所有层级紧贴卡片左缘
  const backgroundTint = depth > 0 && groupColor ? toAlpha(groupColor, 0.08) : undefined;
  const borderTint = depth > 0 && groupColor ? toAlpha(groupColor, 0.18) : undefined;

  return (
    <div
      className={`
        relative p-3 border rounded-lg hover:shadow-md transition-all
        ${selected === card.id ? 'ring-2 ring-primary-red/30 border-primary-red' : ''}
      `}
      style={{
        marginLeft: depth === 0 ? 0 : indent,
        paddingLeft: 8,
        background: backgroundTint || 'white',
        borderColor: borderTint || 'var(--ink-light, #E5E7EB)',
      }}
      onClick={() => onSelect(card.id)}
    >
      {groupColor && (
        <div
          className="absolute top-0 bottom-0 w-1.5 rounded-sm pointer-events-none"
          style={{ background: groupColor, left: colorBarOffset }}
        >
          <div
            className="absolute w-1.5 h-1.5 rounded-full top-1/2 -translate-y-1/2 left-0 pointer-events-none"
            style={{ background: groupColor }}
          />
        </div>
      )}

      <MoveButtons
        depth={depth}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        id={card.id}
      />
      {/* 分支徽章：左/右后续分别用方向箭头 */}
      {branch && (
        <span className="absolute top-2 right-2 text-sm">
          {branch === 'left' ? '⬅️' : '➡️'}
        </span>
      )}

      <div className="flex items-start gap-2 min-w-0">
        <div className="w-7 shrink-0 flex items-start justify-center pt-0.5">
          {hasChildren && (
            <button
              className="text-xl leading-none text-ink hover:text-ink-dark"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(card.id);
              }}
              aria-label={isExpanded ? '折叠' : '展开'}
              title={isExpanded ? '折叠' : '展开'}
            >
              {isExpanded ? '▾' : '▸'}
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {npcAvatarUrl && (
              <img
                src={npcAvatarUrl}
                alt={npcName || 'NPC'}
                className="w-6 h-6 rounded-full object-cover border border-ink-light"
                onError={(e) => {
                  // 如果图片加载失败，隐藏图片
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {npcName && <span className="text-xs text-ink-medium">{npcName}</span>}
          </div>
          <div className="text-sm font-bold text-ink truncate pr-12">
            {card.text}
          </div>
        </div>
      </div>

      {/* 去掉垂直线，避免与彩带重复 */}
    </div>
  );
};

export default CardNode;

