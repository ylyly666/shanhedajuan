/**
 * 图片资源管理工具
 * 管理像素小人图片资源，确保图片显示为正方形
 * 将NPC与图片进行绑定映射
 */

// 像素小人图片列表（1-12）
const PIXEL_CHARACTER_IMAGES = Array.from({ length: 12 }, (_, i) => 
  `/images/像素小人${i + 1}.jpg`
);

/**
 * NPC ID 到图片的映射关系
 * 根据项目中的NPC配置，将每个NPC绑定到对应的像素小人图片
 */
const NPC_IMAGE_MAP: Record<string, string> = {
  // EDITOR_STORY_NPCS - 主要NPC（12个）
  'npc_lifeng': PIXEL_CHARACTER_IMAGES[0],        // 李丰 - 村党支部书记
  'npc_zhangfu': PIXEL_CHARACTER_IMAGES[1],      // 张福贵 - 养殖大户
  'npc_wangxiao': PIXEL_CHARACTER_IMAGES[2],     // 王潇 - 返乡创业青年
  'npc_liumei': PIXEL_CHARACTER_IMAGES[3],       // 刘梅 - 乡村小学教导主任
  'npc_chenzong': PIXEL_CHARACTER_IMAGES[4],     // 陈建国 - 农业投资公司总经理
  'npc_grandma_wang': PIXEL_CHARACTER_IMAGES[5], // 王桂香 - 留守老人
  'npc_old_accountant': PIXEL_CHARACTER_IMAGES[6], // 周明 - 村会计
  'npc_reporter_zhao': PIXEL_CHARACTER_IMAGES[7], // 赵敏 - 省电视台记者
  'npc_he': PIXEL_CHARACTER_IMAGES[8],           // 何大夫 - 村卫生室医生
  'npc_sun': PIXEL_CHARACTER_IMAGES[9],          // 孙寡妇 - 贫困户
  'npc_qian': PIXEL_CHARACTER_IMAGES[10],        // 钱有财 - 包工头
  'npc_old_party': PIXEL_CHARACTER_IMAGES[11],   // 老党员 - 退休教师
  
  // MOCK_NPCS - 兼容旧NPC（复用前4张图片）
  'npc_secretary': PIXEL_CHARACTER_IMAGES[0],     // 李书记 - 复用李丰的图片
  'npc_villager': PIXEL_CHARACTER_IMAGES[1],     // 张大爷 - 复用张福贵的图片
  'npc_youth': PIXEL_CHARACTER_IMAGES[2],        // 小王 - 复用王潇的图片
  'npc_boss': PIXEL_CHARACTER_IMAGES[4],         // 赵总 - 复用陈建国的图片
};

/**
 * 根据NPC ID获取对应的像素小人图片
 * 如果NPC在映射表中，返回对应的图片；否则使用哈希算法分配
 * @param npcId NPC ID
 * @returns 图片路径
 */
export function getImageByNpcId(npcId: string): string {
  // 优先使用映射表
  if (NPC_IMAGE_MAP[npcId]) {
    return NPC_IMAGE_MAP[npcId];
  }
  
  // 如果不在映射表中，使用哈希算法分配（向后兼容）
  let hash = 0;
  for (let i = 0; i < npcId.length; i++) {
    const char = npcId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  const index = Math.abs(hash) % PIXEL_CHARACTER_IMAGES.length;
  return PIXEL_CHARACTER_IMAGES[index];
}

/**
 * 根据索引获取像素小人图片
 * @param index 图片索引（0-11），如果超出范围会循环
 * @returns 图片路径
 */
export function getPixelCharacterImage(index: number): string {
  const normalizedIndex = index % PIXEL_CHARACTER_IMAGES.length;
  return PIXEL_CHARACTER_IMAGES[normalizedIndex];
}

/**
 * 获取随机像素小人图片
 * @returns 图片路径
 */
export function getRandomPixelCharacterImage(): string {
  const index = Math.floor(Math.random() * PIXEL_CHARACTER_IMAGES.length);
  return PIXEL_CHARACTER_IMAGES[index];
}

/**
 * 获取所有可用的像素小人图片
 * @returns 图片路径数组
 */
export function getAllPixelCharacterImages(): string[] {
  return [...PIXEL_CHARACTER_IMAGES];
}

/**
 * 获取NPC到图片的映射表（用于调试或显示）
 * @returns NPC ID到图片路径的映射对象
 */
export function getNpcImageMap(): Record<string, string> {
  return { ...NPC_IMAGE_MAP };
}

