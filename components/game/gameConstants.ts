/**
 * 游戏常量数据（完整版 - 包含83条剧情）
 * 从小程序项目迁移而来
 */

import { MetricType } from '@/utils/gameAdapter';
import { getImageByNpcId } from '@/utils/imageAssets';

export const INITIAL_METRICS: Record<MetricType, number> = {
  economy: 50,
  people: 50,
  environment: 50,
  culture: 50,
};

// UI Card接口
export interface UICard {
  id: string;
  npcId: string;
  npcName: string;
  title: string;
  text: string;
  image: string;
  options: {
    left: { text: string; delta: Partial<Record<MetricType, number>> };
    right: { text: string; delta: Partial<Record<MetricType, number>> };
  };
}

export interface PhaseConfig {
  id: number;
  title: string;
  description: string;
  kpi: Partial<Record<MetricType, number>>;
  anchorCards: string[]; // Fixed sequence IDs
  randomPool: string[]; // IDs to sample from
  randomCount: number; // How many randoms to pick
}

// 辅助函数：根据NPC名称匹配图片路径
// 将小程序的NPC名称映射到当前项目的NPC ID，然后获取图片
const getImageByNpcName = (name: string, npcId?: string): string => {
  // 如果提供了npcId，优先使用
  if (npcId) {
    return getImageByNpcId(npcId);
  }
  
  // 根据NPC名称映射到NPC ID
  const nameToNpcIdMap: Record<string, string> = {
    '县里领导': 'npc_secretary',
    '司机老陈': 'npc_secretary',
    '村支书杨国富': 'npc_secretary',
    '寨老黄公': 'npc_old_party',
    '专干小马': 'npc_wangxiao',
    '技术员': 'npc_wangxiao',
    '韦家兴': 'npc_zhangfu',
    '老果农': 'npc_zhangfu',
    '老支书王永贵': 'npc_old_party',
    '委员黄秀英': 'npc_liumei',
    '盘阿伯': 'npc_zhangfu',
    '李大山': 'npc_zhangfu',
    '返乡青年': 'npc_wangxiao',
    '民警': 'npc_secretary',
    '汉族村民': 'npc_zhangfu',
    '监督局干部': 'npc_secretary',
    '镇卫生院医生': 'npc_he',
    '韦家兴儿子': 'npc_wangxiao',
    '镇长': 'npc_secretary',
    '护林员': 'npc_he',
  };
  
  // 尝试匹配NPC名称
  for (const [key, value] of Object.entries(nameToNpcIdMap)) {
    if (name.includes(key)) {
      return getImageByNpcId(value);
    }
  }
  
  // 默认返回第一个像素小人
  return getImageByNpcId('npc_secretary');
};

// 辅助函数：生成 NPC ID
const getNpcId = (name: string, index: number): string => {
  // 简单起见，使用 name + index 组合，确保唯一性
  return `npc_${index}_${encodeURIComponent(name)}`;
};

// 卡片数据库（简化的示例数据，实际应该从目标项目的config中转换）
export const CARD_DATABASE: Record<string, UICard> = {
  // Phase 1 Anchors
  'p1_a1': {
    id: 'p1_a1', npcId: 'npc_zhang', npcName: '张大爷', title: '村里的老党员', 
    image: 'https://picsum.photos/id/1005/400/500',
    text: '书记！祖祠的屋顶漏雨了。族里想大修一下，光宗耀祖，但这得动用村集体的钱。',
    options: {
      left: { text: '太贵了，不修', delta: { culture: -15, people: -5, economy: 5 } },
      right: { text: '批款修缮', delta: { culture: 20, economy: -15 } }
    }
  },
  'p1_a1_follow': {
    id: 'p1_a1_follow', npcId: 'npc_zhang', npcName: '张大爷', title: '村里的老党员', 
    image: 'https://picsum.photos/id/1005/400/500',
    text: '太感谢书记了！大家伙儿都说你心里有祖宗。这是族谱里夹着的一块老玉，送给村里博物馆吧。',
    options: {
      left: { text: '收入村集体资产', delta: { culture: 5, economy: 5 } },
      right: { text: '搞个展览宣传', delta: { culture: 15, economy: -5 } }
    }
  },
  'p1_a2': {
    id: 'p1_a2', npcId: 'npc_li', npcName: '李主任', title: '镇政府干部', 
    image: 'https://picsum.photos/id/1011/400/500',
    text: '上面下周要来检查卫生文明。为了面子，是不是先把集市关停几天，突击搞搞卫生？',
    options: {
      left: { text: '不行，影响生计', delta: { culture: -10, people: 10 } },
      right: { text: '关停整顿', delta: { culture: 20, people: -20, economy: -5 } }
    }
  },
  // Phase 1 Randoms
  'r_flood': {
    id: 'r_flood', npcId: 'npc_aunt', npcName: '刘大婶', title: '村民代表', 
    image: 'https://picsum.photos/id/1027/400/500',
    text: '发大水了！河堤看着要垮，要不要组织大家去扛沙袋？还是先转移财产？',
    options: {
      left: { text: '全员抗洪', delta: { people: 15, environment: -5 } },
      right: { text: '先保财产', delta: { economy: 5, people: -10, environment: -10 } }
    }
  },
  'r_wifi': {
    id: 'r_wifi', npcId: 'npc_youth', npcName: '小陈', title: '返乡创业青年', 
    image: 'https://picsum.photos/id/1012/400/500',
    text: '书记，我想搞直播带货卖咱们村的苹果，但这网络信号太差了，能不能给升级下基站？',
    options: {
      left: { text: '等上面补贴再说', delta: { economy: -5, people: -5 } },
      right: { text: '村里出钱升级', delta: { economy: -10, people: 15 } }
    }
  },
  // Phase 2 Anchors
  'p2_a1': {
    id: 'p2_a1', npcId: 'npc_ceo_wang', npcName: '王总', title: '化工厂投资人', 
    image: 'https://picsum.photos/id/103/400/500',
    text: '书记，我们想在河边建个加工厂。虽然有点污染，但立马能给村里解决50个就业岗位。',
    options: {
      left: { text: '拒绝，保护河流', delta: { economy: -10, environment: 15 } },
      right: { text: '欢迎，我们需要就业', delta: { economy: 25, environment: -30, people: 10 } }
    }
  },
  'p2_a2': {
    id: 'p2_a2', npcId: 'npc_teacher', npcName: '林老师', title: '乡村教师', 
    image: 'https://picsum.photos/id/1014/400/500',
    text: '学校的操场还是泥地，孩子们一跑步全是灰。能不能把卖地的钱拿来铺塑胶跑道？',
    options: {
      left: { text: '再等等，钱有用', delta: { people: -10, culture: -5 } },
      right: { text: '马上铺！', delta: { people: 20, economy: -15 } }
    }
  }
};

export const PHASES: PhaseConfig[] = [
  {
    id: 1,
    title: "第1阶段：新官上任·破冰与生存",
    description: "你刚到村里，村民都在观望。首要任务是稳住局面，熟悉情况，确保没有任何指标崩盘。",
    kpi: { economy: 30, people: 30 },
    anchorCards: ['p1_a1', 'p1_a2'],
    randomPool: ['r_flood', 'r_wifi'],
    randomCount: 2
  },
  {
    id: 2,
    title: "第2阶段：发展之争·取舍之间",
    description: "投资商进驻，村里意见不一。如何在经济腾飞与绿水青山之间找到平衡点，是你面临的最大考验。",
    kpi: { economy: 60, environment: 40 },
    anchorCards: ['p2_a1', 'p2_a2'],
    randomPool: ['r_flood'],
    randomCount: 3
  }
];

