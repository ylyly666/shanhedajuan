import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GameMenuProps {
  onClose: () => void;
  unlockedCards: string[];
  // 卡片数据库（用于显示角色墙）
  cardDatabase?: Record<string, { npcId: string; npcName: string; image: string }>;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onClose, unlockedCards, cardDatabase = {} }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'roles' | 'scores' | 'settings'>('menu');

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const renderRoles = () => {
    // Unique NPCs found based on unlocked card IDs
    const npcs = Array.from(new Set(unlockedCards.map(id => cardDatabase[id]?.npcId).filter(Boolean)));
    const allCards = Object.values(cardDatabase);
    const uniqueNpcs = Array.from(new Set(allCards.map(c => c.npcId))).map(npcId => {
      const card = allCards.find(c => c.npcId === npcId);
      const isUnlocked = npcs.includes(npcId);
      return { ...card, isUnlocked };
    });

    return (
      <div className="w-full h-full flex flex-col">
        <h3 className="text-xl font-song border-b border-white/30 pb-2 mb-4 text-white">角色墙 (图鉴)</h3>
        <div className="grid grid-cols-3 gap-3 overflow-y-auto pb-4 flex-1">
          {uniqueNpcs.map((npc, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${npc.isUnlocked ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-gray-600'} bg-black/70`}>
                {npc.isUnlocked ? (
                  <img src={npc.image} alt={npc.npcName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">?</div>
                )}
              </div>
              <span className="text-xs mt-1 font-song text-white/80">{npc.isUnlocked ? npc.npcName : '???'}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setActiveTab('menu')} 
          className="mt-4 self-center text-sm bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-2 rounded-full text-white transition-all"
        >
          返回
        </button>
      </div>
    );
  };

  const renderScores = () => (
    <div className="w-full h-full flex flex-col items-center">
       <h3 className="text-xl font-song border-b border-white/30 pb-2 mb-6 text-white w-full text-center">高分榜</h3>
       <div className="w-full space-y-3 flex-1">
         {[
           { name: "张书记", score: "48 周" },
           { name: "李书记", score: "32 周" },
           { name: "玩家壹号", score: "12 周" },
         ].map((s, i) => (
           <div key={i} className="flex justify-between font-typewriter text-lg bg-white/10 hover:bg-white/15 p-3 rounded-lg border border-white/20 text-white transition-all">
             <span className="font-bold">#{i+1} {s.name}</span>
             <span>{s.score}</span>
           </div>
         ))}
       </div>
       <button 
         onClick={() => setActiveTab('menu')} 
         className="mt-4 self-center text-sm bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-2 rounded-full text-white transition-all"
       >
         返回
       </button>
    </div>
  );

  const renderSettings = () => (
    <div className="w-full h-full flex flex-col items-center">
       <h3 className="text-xl font-song border-b border-white/30 pb-2 mb-6 text-white w-full text-center">设置</h3>
       <div className="w-full space-y-4 font-song text-lg text-white">
         <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/20">
           <span>音效</span>
           <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
             <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
           </div>
         </div>
         <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/20">
           <span>震动反馈</span>
           <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
             <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
           </div>
         </div>
       </div>
       <button 
         onClick={() => setActiveTab('menu')} 
         className="mt-auto self-center text-sm bg-white/10 hover:bg-white/20 border border-white/30 px-6 py-2 rounded-full text-white transition-all"
       >
         返回
       </button>
    </div>
  );

  const renderMain = () => (
    <ul className="space-y-4 text-center w-full">
      <li>
        <button 
          onClick={() => setActiveTab('roles')}
          className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-lg text-xl font-song text-white transition-all border border-white/20 hover:border-white/40"
        >
          角色墙
        </button>
      </li>
      <li>
        <button 
          onClick={() => setActiveTab('scores')}
          className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-lg text-xl font-song text-white transition-all border border-white/20 hover:border-white/40"
        >
          高分榜
        </button>
      </li>
      <li>
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-lg text-xl font-song text-white transition-all border border-white/20 hover:border-white/40"
        >
          设置
        </button>
      </li>
      <li className="mt-8">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-song text-white transition-all shadow-lg"
        >
          继续游戏
        </button>
      </li>
    </ul>
  );

  return (
    <motion.div 
      variants={menuVariants}
      initial="hidden" animate="visible" exit="exit"
      className="absolute inset-0 bg-[#1a1a1a] z-40 flex flex-col items-center p-8 text-white"
    >
      {/* 半透明遮罩层 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
      
      {/* 内容层 */}
      <div className="relative z-10 w-full max-w-md flex flex-col h-full">
        <h2 className="text-3xl font-song border-b-2 border-white/30 pb-3 mb-8 w-full text-center text-white">
          暂停菜单
        </h2>
        
        <div className="flex-1 w-full bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
          {activeTab === 'menu' && renderMain()}
          {activeTab === 'roles' && renderRoles()}
          {activeTab === 'scores' && renderScores()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </motion.div>
  );
};

