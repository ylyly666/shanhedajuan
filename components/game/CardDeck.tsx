import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { MetricType, MetricDelta } from '@/utils/gameAdapter';

// UI Card接口（适配新UI格式）
interface UICard {
  id: string;
  npcId: string;
  npcName: string;
  title: string;
  text: string;
  image: string;
  options: {
    left: { text: string; delta: MetricDelta };
    right: { text: string; delta: MetricDelta };
  };
}

interface CardDeckProps {
  card: UICard;
  onSwipe: (direction: 'left' | 'right', delta: MetricDelta) => void;
  onPreview: (delta: Partial<Record<MetricType, number>> | null) => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({ card, onSwipe, onPreview }) => {
  const [exitX, setExitX] = useState<number | null>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  
  const opacityLeftChoice = useTransform(x, [0, -60], [0, 1]); 
  const opacityRightChoice = useTransform(x, [0, 60], [0, 1]);

  const handleDragEnd = (e: any, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      setExitX(500);
      onSwipe('right', card.options.right.delta);
    } else if (info.offset.x < -threshold) {
      setExitX(-500);
      onSwipe('left', card.options.left.delta);
    } else {
      onPreview(null);
    }
  };

  const handleDrag = (e: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 15) {
      onPreview(info.offset.x > 0 ? card.options.right.delta : card.options.left.delta);
    } else {
      onPreview(null);
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center overflow-hidden bg-gov-paper">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-paper-texture cloud-pattern"></div>

      {/* 1. Top Story Area (25% height) */}
      <div className="w-full px-10 h-[25%] flex items-center justify-center z-10">
        <p className="font-fangsong text-lg text-gov-gray font-bold leading-relaxed tracking-tight text-center">
          {card.text}
        </p>
      </div>

      {/* 2. Middle Card Area (60% height) */}
      <div className="w-full h-[60%] flex items-center justify-center relative z-20">
        <AnimatePresence mode="wait">
          {!exitX && (
            <motion.div
              key={card.id}
              style={{ x, rotate, touchAction: "none" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              onDrag={handleDrag}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ x: exitX || 0, opacity: 0, transition: { duration: 0.3 } }}
              className="w-[85%] aspect-square bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden border-none"
            >
               {/* Character Portrait 立绘 */}
               <img 
                 src={card.image} 
                 alt={card.npcName} 
                 className="w-full h-full object-cover object-center pointer-events-none" 
                 draggable="false"
               />
               
               {/* Decision Overlays - Transparent mask covering top 1/3 */}
               <div className="absolute top-0 left-0 w-full h-[35%] pointer-events-none z-30">
                 <motion.div 
                   style={{ opacity: opacityLeftChoice }} 
                   className="absolute inset-0 bg-gov-red/80 flex items-center justify-end pr-6"
                 >
                   <span className="text-white font-song text-xl font-black text-right drop-shadow-md">
                      {card.options.left.text}
                   </span>
                 </motion.div>
                 <motion.div 
                   style={{ opacity: opacityRightChoice }} 
                   className="absolute inset-0 bg-gov-gray/80 flex items-center justify-start pl-6"
                 >
                    <span className="text-white font-song text-xl font-black text-left drop-shadow-md">
                      {card.options.right.text}
                    </span>
                 </motion.div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Bottom Identity Area (15% height) */}
      <div className="w-full h-[15%] flex items-center justify-center z-10">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-gov-gray font-song text-sm font-bold tracking-[0.3em] opacity-40 uppercase"
        >
          {card.npcName} · {card.title}
        </motion.div>
      </div>
    </div>
  );
};

