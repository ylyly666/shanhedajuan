import React from 'react';
import type { Card } from '@/types';
import CardNode from './CardNode';

interface CardTreeProps {
  startId: string;
  cards: Card[];
  depth?: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  selected: string | null;
  branch?: 'left' | 'right';
  dragHandleProps?: any;
  parentColorMap?: Map<string, string>;
  cardParentMap?: Map<string, string | null>;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  npcMap?: Map<string, string>;
  npcAvatarMap?: Map<string, string>;
}

const isCard = (item: any): item is Card => Boolean(item && 'options' in item);

const CardTree: React.FC<CardTreeProps> = ({
  startId,
  cards,
  depth = 0,
  expanded,
  onToggle,
  onSelect,
  selected,
  branch,
  dragHandleProps,
  parentColorMap,
  cardParentMap,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  npcMap,
  npcAvatarMap,
}) => {
  const map = React.useMemo(() => {
    const m = new Map<string, Card>();
    cards.filter(isCard).forEach((c) => m.set(c.id, c));
    return m;
  }, [cards]);

  const renderNode = (
    id: string,
    currentDepth: number,
    branchDir?: 'left' | 'right',
    handleProps?: any,
    parentId?: string | null
  ): React.ReactNode => {
    const node = map.get(id);
    if (!node) return null;
    const leftId = node.options.left?.followUpCardId;
    const rightId = node.options.right?.followUpCardId;
    const hasChildren = Boolean(leftId || rightId);
    const isExpanded = expanded.has(id);

    const nodeDragHandleProps = currentDepth === 0 ? handleProps : undefined;
    const nodeOnMoveUp = currentDepth === 0 ? onMoveUp : undefined;
    const nodeOnMoveDown = currentDepth === 0 ? onMoveDown : undefined;
    const nodeCanMoveUp = currentDepth === 0 ? canMoveUp : false;
    const nodeCanMoveDown = currentDepth === 0 ? canMoveDown : false;

    return (
      <div key={id} className="relative">
        <CardNode
          card={node}
          depth={currentDepth}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          branch={branchDir}
          parentId={parentId}
          onToggle={onToggle}
          onSelect={onSelect}
          selected={selected}
          dragHandleProps={nodeDragHandleProps}
          firstLevelParentId={cardParentMap?.get(id) || null}
          groupColor={cardParentMap?.get(id) ? parentColorMap?.get(cardParentMap.get(id)!) : undefined}
          onMoveUp={nodeOnMoveUp}
          onMoveDown={nodeOnMoveDown}
          canMoveUp={nodeCanMoveUp}
          canMoveDown={nodeCanMoveDown}
          npcName={npcMap?.get(node.npcId)}
          npcAvatarUrl={npcAvatarMap?.get(node.npcId)}
        />
        {hasChildren && isExpanded && (
          <div>
            {leftId && renderNode(leftId, currentDepth + 1, 'left', undefined, id)}
            {rightId && renderNode(rightId, currentDepth + 1, 'right', undefined, id)}
          </div>
        )}
      </div>
    );
  };

  return <>{renderNode(startId, depth, branch, dragHandleProps)}</>;
};

export default CardTree;

