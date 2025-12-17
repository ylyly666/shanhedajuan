import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MetricType = 'environment' | 'people' | 'economy' | 'culture';

interface GameIndicatorsProps {
  metrics: Record<MetricType, number>;
  previewDelta?: Partial<Record<MetricType, number>>;
}

// ==========================================
// 1. 核心资产：视觉校准版 (Visual Calibration)
// 重点解决：50% 初始状态看起来太满的问题
// 方案：将所有图标的重心上移，缩短底部，让中线(y=12)正好切在视觉中心
// ==========================================
const SOLID_ICON_PATHS: Record<MetricType, string> = {
  // 生态：三层松树
  // 调整：整体上移，顶部从 y=1 开始，底部收在 y=21
  // 50% 水位现在正好切在第二层树叶中间，视觉平衡
  environment: "M12 0.5 L6 7.5 H9 L5 13.5 H10 L7 21 H17 L14 13.5 H19 L15 7.5 H18 L12 0.5 Z", 
  
  // 民生：连体小人
  // 调整：拉长躯干，缩短腿部，抬高裆部位置。
  // 头部 y=1, 裆部 y=11.5, 脚底 y=21.5
  // 50% 水位现在正好卡在腰部，不再淹没胸口
  people: "M12 1 C14.5 1 16 3 16 5.5 Q16 7.5 13.5 7.5 L21 7.5 L21 10.5 L15.5 10.5 L18.5 21.5 H14.5 L12 15.5 L9.5 21.5 H5.5 L8.5 10.5 H3 L3 7.5 L10.5 7.5 Q8 7.5 8 5.5 C8 3 9.5 1 12 1 Z",
  
  // 经济：粗体人民币 ¥
  // 调整：整体上移，两条横线的位置抬高
  // 顶部 y=1, 底部 y=21.5, 中间横线正好在 y=12 附近
  economy: "M10 1 L12 5 L14 1 H18 L13.5 9 V11 H19 V14 H13.5 V17 H19 V20 H13.5 V21.5 H10.5 V20 H5 V17 H10.5 V14 H5 V11 H10.5 V9 L6 1 H10 Z",
  
  // 乡风：竖放的书籍
  // 调整：顶部 y=1, 底部 y=21
  // 纯矩形结构，上移后 y=12 正好切分一半面积
  culture: "M6 1 H16 A2 2 0 0 1 18 3 V19 A2 2 0 0 1 16 21 H6 A1 1 0 0 1 5 20 V2 A1 1 0 0 1 6 1 Z M7 3 V19 H8 V3 H7 Z"
};

const MetricIcon: React.FC<{
  type: MetricType;
  value: number;
  isPreviewing: boolean;
}> = ({ type, value, isPreviewing }) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const isCritical = clampedValue < 20;
  
  const liquidHeight = clampedValue; 
  // 坐标系转换：SVG y=24 是底部
  const liquidY = 24 - (24 * (liquidHeight / 100));

  const clipId = `icon-clip-${type}`;
  const COLOR_LIQUID_NORMAL = "#EFE6D1"; 
  const COLOR_LIQUID_CRITICAL = "#B22222"; 
  const COLOR_EMPTY_BG = "rgba(0, 0, 0, 0.5)"; 

  return (
    <div className="relative flex flex-col items-center justify-end w-1/4 h-full pb-3">
      {/* 图标容器 */}
      <motion.div
        className="w-12 h-16 relative mt-4" 
        animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        {/* 小白点：位于图标正上方，紧贴 */}
        <AnimatePresence>
          {isPreviewing && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20"
            >
              <div className="w-2 h-2 bg-[#EFE6D1] rounded-full shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox="0 0 24 24"
          className="w-full h-full drop-shadow-md"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id={clipId}>
              <path d={SOLID_ICON_PATHS[type]} />
            </clipPath>
          </defs>

          <g clipPath={`url(#${clipId})`}>
            {/* 底色层：深色半透明 */}
            <rect x="0" y="0" width="24" height="24" fill={COLOR_EMPTY_BG} />

            {/* 液体层：从底部升起 */}
            <motion.rect
              x="0"
              width="24"
              animate={{ 
                y: liquidY,
                height: 24 * (liquidHeight / 100)
              }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              fill={isCritical ? COLOR_LIQUID_CRITICAL : COLOR_LIQUID_NORMAL}
            />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export const GameIndicators: React.FC<GameIndicatorsProps> = ({ metrics, previewDelta }) => {
  return (
    <div className="w-full h-[18vh] min-h-[120px] bg-[#2C2C2C] flex items-center justify-around px-6 relative z-10 border-b border-white/5 shadow-xl">
      {/* 噪点纹理 */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {(['environment', 'people', 'economy', 'culture'] as MetricType[]).map((key) => (
        <MetricIcon
          key={key}
          type={key}
          value={metrics[key]}
          isPreviewing={!!previewDelta?.[key] && previewDelta[key] !== 0}
        />
      ))}
    </div>
  );
};

export default GameIndicators;