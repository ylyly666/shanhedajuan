import { GameConfig, GameStats, NpcAsset, StoryNpc, CrisisNpc, Card } from './types';

export const INITIAL_STATS: GameStats = {
  economy: 50,
  people: 50,
  environment: 50,
  civility: 50,
};

export const MOCK_NPCS: NpcAsset[] = [
  { id: 'npc_secretary', name: '李书记', role: '村支书', avatarUrl: '/images/像素小人1.jpg', defaultCrisisPrompt: '固执但在乎集体荣誉'},
  { id: 'npc_villager', name: '张大爷', role: '养殖大户', avatarUrl: '/images/像素小人2.jpg', defaultCrisisPrompt: '理想主义，但也务实' },
  { id: 'npc_youth', name: '小王', role: '返乡青年', avatarUrl: '/images/像素小人3.jpg', defaultCrisisPrompt: '理想主义，但也务实' },
  { id: 'npc_boss', name: '赵总', role: '投资商', avatarUrl: '/images/像素小人5.jpg', defaultCrisisPrompt: '唯利是图，但也讲究效率' },
];

// Story 阶段使用的 NPC 资产
const MOCK_STORY_NPCS: StoryNpc[] = [
  { id: 'npc_secretary', name: '李书记', role: '村支书', avatarUrl: '/images/像素小人1.jpg', description: '务实但较为保守' },
  { id: 'npc_villager', name: '张大爷', role: '养殖大户', avatarUrl: '/images/像素小人2.jpg', description: '脾气火爆，爱讲道理' },
  { id: 'npc_youth', name: '小王', role: '返乡青年', avatarUrl: '/images/像素小人3.jpg', description: '理想主义，关注环保' },
  { id: 'npc_boss', name: '赵总', role: '投资商', avatarUrl: '/images/像素小人5.jpg', description: '务实逐利' },
];

// 危机谈判 NPC 模板
const MOCK_CRISIS_NPCS: CrisisNpc[] = [
  {
    id: 'npc_secretary',
    name: '李书记',
    role: '村支书',
    avatarUrl: '/images/像素小人1.jpg',
    personality: '心系集体荣誉，担心问责',
    judgeWeights: { empathy: 30, rationality: 30, compliance: 40 },
  },
  {
    id: 'npc_villager',
    name: '张大爷',
    role: '养殖大户',
    avatarUrl: '/images/像素小人2.jpg',
    personality: '利益受损，情绪激烈',
    judgeWeights: { empathy: 40, rationality: 25, compliance: 35 },
  },
  {
    id: 'npc_youth',
    name: '小王',
    role: '返乡青年',
    avatarUrl: '/images/像素小人3.jpg',
    personality: '关注环保，理性沟通',
    judgeWeights: { empathy: 35, rationality: 35, compliance: 30 },
  },
  {
    id: 'npc_boss',
    name: '赵总',
    role: '投资商',
    avatarUrl: '/images/像素小人5.jpg',
    personality: '结果导向，注重效率',
    judgeWeights: { empathy: 20, rationality: 50, compliance: 30 },
  },
];

// -----------------------------
// 编辑器示例：山河村完整剧本
// -----------------------------
export const EDITOR_STORY_NPCS: StoryNpc[] = [
  {
    id: 'npc_lifeng',
    name: '李丰',
    role: '村党支部书记',
    avatarUrl: '/images/像素小人1.jpg',
    description:
      '56岁，在山河村工作30年。务实保守，对村里每户情况了如指掌，但思想偏传统，对新技术、新模式持怀疑态度。有高血压，不能受太大刺激。',
  },
  {
    id: 'npc_zhangfu',
    name: '张福贵',
    role: '养殖大户/原村委会副主任',
    avatarUrl: '/images/像素小人2.jpg',
    description:
      '48岁，经营全村最大养猪场，年出栏2000头。性格火爆直率，在村里30多户亲戚，形成一定家族势力。2018年因酒驾被免去副主任职务，至今耿耿于怀。',
  },
  {
    id: 'npc_wangxiao',
    name: '王潇',
    role: '返乡创业青年/村团支部书记',
    avatarUrl: '/images/像素小人3.jpg',
    description:
      '28岁，电子商务专业毕业，曾在杭州某电商公司工作3年。父亲是村里老支书，自己带着5万元积蓄回乡创业。有想法但缺经验，容易急躁。',
  },
  {
    id: 'npc_liumei',
    name: '刘梅',
    role: '乡村小学教导主任',
    avatarUrl: '/images/像素小人4.jpg',
    description:
      '32岁，师范毕业后自愿回乡任教10年。丈夫在县城工作，长期两地分居。教学认真负责，但常因学校条件简陋感到无力，多次申请调离未果。',
  },
  {
    id: 'npc_chenzong',
    name: '陈建国',
    role: '农业投资公司总经理',
    avatarUrl: '/images/像素小人5.jpg',
    description:
      '45岁，市政协委员。表面儒雅，实则精于算计。曾投资多个乡村项目，在政商界人脉广泛，本次考察带有市领导推荐信。',
  },
  {
    id: 'npc_grandma_wang',
    name: '王桂花',
    role: '留守老人/村民监督委员会成员',
    avatarUrl: '/images/像素小人6.jpg',
    description:
      '73岁，担任村民监督15年，熟悉每一笔账目。为人正直但过于较真，得罪不少人。',
  },
  {
    id: 'npc_old_accountant',
    name: '周明',
    role: '村会计/退役军人',
    avatarUrl: '/images/像素小人7.jpg',
    description:
      '55岁，村委工作25年，曾在部队服役，做事一板一眼，对财务纪律极其严格。患有关节炎但拒绝提前退休。',
  },
  {
    id: 'npc_reporter_zhao',
    name: '赵敏',
    role: '省电视台《乡村振兴纪实》栏目记者',
    avatarUrl: '/images/像素小人8.jpg',
    description:
      '35岁，新闻系硕士。以深度调查报道闻名，曾揭露多个基层问题。本次采访有宣传与监督的双重任务。',
  },
  {
    id: 'npc_he',
    name: '何大夫',
    role: '村卫生室医生',
    avatarUrl: '/images/像素小人9.jpg',
    description:
      '42岁，全科医生，十年前从县医院辞职回乡。医术精湛但脾气古怪，设备简陋靠个人积蓄维持。',
  },
  {
    id: 'npc_sun',
    name: '孙寡妇',
    role: '贫困户/单亲母亲',
    avatarUrl: '/images/像素小人10.jpg',
    description:
      '35岁，丈夫车祸去世，抚养两个女儿，在村口开小卖部为生，性格内向敏感但生活困难。',
  },
  {
    id: 'npc_qian',
    name: '钱有财',
    role: '包工头/村建筑队负责人',
    avatarUrl: '/images/像素小人11.jpg',
    description:
      '43岁，早年在城里搞建筑发家，为人圆滑，村里一半房屋都是他建的，与多名村干部关系密切，有偷工减料前科。',
  },
  {
    id: 'npc_old_party',
    name: '老党员',
    role: '退休教师/党龄50年老党员',
    avatarUrl: '/images/像素小人12.jpg',
    description:
      '76岁，退休教师，党龄50年。正派德高望重，但思想传统，看不惯年轻人的做派。',
  },
];

export const EDITOR_NPCS: NpcAsset[] = EDITOR_STORY_NPCS.map(npc => ({
  id: npc.id,
  name: npc.name,
  role: npc.role,
  avatarUrl: npc.avatarUrl,
  defaultCrisisPrompt: npc.description || '村情复杂，需要审慎处理。',
}));

const EDITOR_CRISIS_NPCS: CrisisNpc[] = [
  {
    id: 'npc_chenzong',
    name: '陈建国',
    role: '农业投资公司总经理',
    avatarUrl: '/images/像素小人5.jpg',
    personality: '投资收益导向，容忍度低',
    judgeWeights: { empathy: 15, rationality: 45, compliance: 40 },
  },
  {
    id: 'npc_grandma_wang',
    name: '王桂花',
    role: '村民监督委员会成员',
    avatarUrl: '/images/像素小人6.jpg',
    personality: '关注公平透明，较真执着',
    judgeWeights: { empathy: 40, rationality: 20, compliance: 40 },
  },
  {
    id: 'npc_he',
    name: '何大夫',
    role: '村卫生室医生',
    avatarUrl: '/images/像素小人9.jpg',
    personality: '重视公共健康与环保，反对敷衍',
    judgeWeights: { empathy: 25, rationality: 25, compliance: 50 },
  },
  {
    id: 'npc_lifeng',
    name: '李丰',
    role: '村党支部书记',
    avatarUrl: '/images/像素小人1.jpg',
    personality: '务实保守，顾虑问责与稳定',
    judgeWeights: { empathy: 25, rationality: 35, compliance: 40 },
  },
];

// 编辑器随机事件库（默认导入）
export const RANDOM_EVENT_LIBRARY: Card[] = [
  // 1. 自然灾害
  {
    id: 'random_flood',
    npcId: 'npc_lifeng',
    text: '书记！气象局发了红色预警，今晚到明天有大到暴雨！后山那个地质灾害点去年就说要治理，一直没钱，下面住着12户人家！',
    tags: ['自然灾害', '紧急避险', '安全'],
    options: {
      left: {
        text: '立即组织转移，启用应急资金',
        delta: { people: +25, economy: -20, civility: +15 },
      },
      right: {
        text: '加强监测，先做临时防护',
        delta: { civility: +10, economy: -5, people: -15 },
      },
    },
  },
  // 2. 公共卫生事件
  {
    id: 'random_epidemic',
    npcId: 'npc_he',
    text: "陈书记，村小学有3个孩子确诊流感，正在扩散。卫生室退烧药只够20人份，口罩没有，还有谣言说是'猪流感'，矛头指向张福贵的猪场。",
    tags: ['公共卫生', '谣言', '资源紧张'],
    options: {
      left: {
        text: '立即封校，全力采购药品',
        delta: { people: +20, economy: -15, civility: +10 },
      },
      right: {
        text: '科学引导，避免恐慌',
        delta: { civility: +15, people: +10, economy: -5 },
      },
    },
  },
  // 3. 经济纠纷
  {
    id: 'random_wage_dispute',
    npcId: 'npc_sun',
    text: '钱有财的建筑队欠了我家男人3万工钱两年未付，他说村集体欠他工程款，让我找村里要。我一个寡妇带两个孩子…',
    tags: ['劳资纠纷', '弱势群体', '历史债务'],
    options: {
      left: {
        text: '村里先垫付，再向钱有财追偿',
        delta: { people: +30, economy: -15, civility: +20 },
      },
      right: {
        text: '协助法律诉讼，提供法律援助',
        delta: { civility: +15, people: +15, economy: -5 },
      },
    },
  },
  // 4. 文化冲突
  {
    id: 'random_funeral_conflict',
    npcId: 'npc_old_party',
    text: '张家修坟多占李家三尺地，李家砸了碑，两家各叫了二十多人在坟地对峙，锄头铁锹都拿出来了。',
    tags: ['宗族冲突', '历史恩怨', '群体事件'],
    options: {
      left: {
        text: '立即带村干部现场调解',
        delta: { civility: +25, people: +15, economy: -10 },
      },
      right: {
        text: '报警处理，依法解决',
        delta: { civility: +15, people: -10, economy: -5 },
      },
    },
  },
  // 5. 意外机遇
  {
    id: 'random_heritage_discovery',
    npcId: 'npc_reporter_zhao',
    text: '拍摄时发现一座清代古桥，可能申报文保并发展旅游，但桥地块是张福贵计划扩建猪场的位置。',
    tags: ['文化遗产', '发展冲突', '意外机遇'],
    options: {
      left: {
        text: '立即暂停扩建，启动文物申报',
        delta: { environment: +20, economy: +15, people: -10 },
      },
      right: {
        text: '先协调，寻找两全方案',
        delta: { civility: +20, economy: +5, people: +5 },
      },
    },
  },
  // 6. 技术事故
  {
    id: 'random_tech_accident',
    npcId: 'npc_wangxiao',
    text: '电商平台服务器被攻击，30多个订单信息或泄露，若曝光可能赔钱并违法。',
    tags: ['技术风险', '网络安全', '创业危机'],
    options: {
      left: {
        text: '立即报警并通知客户',
        delta: { civility: +25, economy: -20, people: +10 },
      },
      right: {
        text: '先内部处理，尽量隐瞒',
        delta: { civility: -25, economy: -10, people: -20 },
      },
    },
  },
  // 7. 政策变动
  {
    id: 'random_policy_change',
    npcId: 'npc_lifeng',
    text: '县里新规：村级项目超过30万必须“四议两公开”并报镇党委审批，正在谈的项目都得重走程序。',
    tags: ['政策变动', '程序合规', '效率影响'],
    options: {
      left: {
        text: '严格执行新规，重新走程序',
        delta: { civility: +30, economy: -15, people: +10 },
      },
      right: {
        text: '特事特办，先推进后补程序',
        delta: { economy: +10, civility: -20, people: -5 },
      },
    },
  },
  // 8. 人才流失
  {
    id: 'random_brain_drain',
    npcId: 'npc_liumei',
    text: '县一中发了调动通知，我可能要走。村里缺老师，但孩子要上初中，在村里没未来。',
    tags: ['人才流失', '教育资源', '个人发展'],
    options: {
      left: {
        text: '真诚挽留，承诺改善条件',
        delta: { people: +20, economy: -10, civility: +15 },
      },
      right: {
        text: '支持个人发展，帮助办好手续',
        delta: { civility: +20, people: -15, economy: 0 },
      },
    },
  },
];

export const EDITOR_SAMPLE_CONFIG: GameConfig = {
  npcs: EDITOR_NPCS,
  storyNpcs: EDITOR_STORY_NPCS,
  crisisNpcs: EDITOR_CRISIS_NPCS,
  randomEventLibrary: RANDOM_EVENT_LIBRARY,
  crisisConfig: {
    economy: {
      npcId: 'npc_chenzong',
      npcName: '陈建国',
      npcRole: '农业投资公司总经理',
      npcAvatarUrl: '/images/像素小人5.jpg',
      personality: '投资收益导向，容忍度低',
      conflictReason: '担心项目受阻导致亏损',
      judgeWeights: { empathy: 15, rationality: 45, strategy: 25, compliance: 15 },
    },
    people: {
      npcId: 'npc_grandma_wang',
      npcName: '王桂花',
      npcRole: '村民监督委员会成员',
      npcAvatarUrl: '/images/像素小人6.jpg',
      personality: '关注公平透明，较真执着',
      conflictReason: '群众利益受损、民生被忽视',
      judgeWeights: { empathy: 40, rationality: 20, strategy: 20, compliance: 20 },
    },
    environment: {
      npcId: 'npc_he',
      npcName: '何大夫',
      npcRole: '村卫生室医生',
      npcAvatarUrl: '/images/像素小人9.jpg',
      personality: '重视公共健康与环保，反对敷衍',
      conflictReason: '养殖污染影响饮水安全',
      judgeWeights: { empathy: 25, rationality: 25, strategy: 25, compliance: 25 },
    },
    civility: {
      npcId: 'npc_lifeng',
      npcName: '李丰',
      npcRole: '村党支部书记',
      npcAvatarUrl: '/images/像素小人1.jpg',
      personality: '务实保守，顾虑问责与稳定',
      conflictReason: '班子团结与政治风险并存',
      judgeWeights: { empathy: 25, rationality: 30, strategy: 25, compliance: 20 },
    },
  },
  stages: [
    {
      id: 'stage_1',
      title: '第一阶段：新官上任（0-3个月）',
      description:
        '初到山河村，面对环保督察、危房小学、道路硬化停滞、贫困户住房、村集体债务等五大紧急问题，需快速摸底与建立信任。',
      kpi: { economy: 30, people: 40, environment: 35, civility: 50 },
      kpiEnabled: { economy: true, people: true, environment: true, civility: true },
      cards: [
        {
          id: 'card_1_1',
          npcId: 'npc_lifeng',
          npcName: '李丰',
          text:
            '陈书记，欢迎！这是当前最急的五件事：1) 养猪场30天内整改，否则罚款20万；2) 小学D级危房，雨季前必须加固；3) 通镇3公里路硬化项目因补偿停了半年；4) 孙寡妇的危房；5) 村里欠工程款80万。您先从哪个抓？',
          tags: ['开局', '多线危机', '资源紧张'],
          options: {
            left: {
              text: '先处理环保整改，这是政治任务',
              delta: { environment: +20, civility: +10, people: -15, economy: -10 },
              followUpCardId: 'card_1_1_left',
            },
            right: {
              text: '先解决小学危房，孩子安全第一',
              delta: { people: +25, environment: -10, civility: +5, economy: -15 },
              followUpCardId: 'card_1_1_right',
            },
          },
        },
        {
          id: 'card_1_1_left',
          npcId: 'npc_zhangfu',
          text:
            '新书记，你一来就断我生路？环保局懂什么！我堂哥在县环保局当副局长，信不信我让他压下去？',
          tags: ['环保', '利益冲突', '威胁'],
          options: {
            left: {
              text: '坚持原则，立即下达整改通知书',
              delta: { environment: +30, civility: +20, people: -25, economy: -20 },
              followUpCardId: 'card_1_1_left_left',
            },
            right: {
              text: '先做工作，承诺帮助转型过渡',
              delta: { environment: +10, people: -5, civility: +15, economy: -5 },
              followUpCardId: 'card_1_1_left_right',
            },
          },
        },
        {
          id: 'card_1_1_left_left',
          npcId: 'npc_old_party',
          text: '张福贵放话要去市里上访，说你破坏营商环境。他家在村里30多户亲戚，真闹起来不好收拾。',
          tags: ['矛盾升级', '群体性事件风险', '政治智慧'],
          options: {
            left: {
              text: '立即向镇党委汇报，寻求支持',
              delta: { civility: +25, people: -20, economy: -10 },
              followUpCardId: 'card_1_1_left_left_left',
            },
            right: {
              text: '亲自登门，夜访做家族工作',
              delta: { people: +15, civility: -10, environment: -5 },
              followUpCardId: 'card_1_1_left_left_right',
            },
          },
        },
        {
          id: 'card_1_1_left_left_left',
          npcId: 'npc_lifeng',
          text: '镇里支持你依法整改，但要求稳定大局，注意舆情。',
          options: {
            left: { text: '联合执法，确保合法合规', delta: { civility: +20, environment: +10 } },
            right: { text: '放缓节奏，边整改边安抚', delta: { people: +10, environment: +5, civility: -5 } },
          },
        },
        {
          id: 'card_1_1_left_left_right',
          npcId: 'npc_zhangfu',
          text: '张福贵态度稍软，但要求补贴损失，否则继续闹。',
          options: {
            left: { text: '给予有限补偿换取停工配合', delta: { economy: -10, people: +10, civility: +5 } },
            right: { text: '强调依法整改，不补贴', delta: { civility: +10, people: -10 } },
          },
        },
        {
          id: 'card_1_1_left_right',
          npcId: 'npc_zhangfu',
          text: '张福贵同意整改，但希望获得转型支持与贷款帮助。',
          options: {
            left: { text: '帮申请贴息贷款，指导转型', delta: { economy: -5, civility: +15, people: +5 } },
            right: { text: '提供技术培训与市场对接', delta: { economy: +5, environment: +5, civility: +10 } },
          },
        },
        {
          id: 'card_1_1_right',
          npcId: 'npc_liumei',
          text: '小学是D级危房，教育局没钱。昨天墙皮掉落差点砸到孩子，怎么办？',
          tags: ['教育', '安全', '资金困境'],
          options: {
            left: {
              text: '立即停课，转移学生到村委会',
              delta: { people: +30, civility: +15, economy: -20 },
              followUpCardId: 'card_1_1_right_left',
            },
            right: {
              text: '发动村民义务加固，先应急',
              delta: { people: +20, civility: +25, economy: -5 },
              followUpCardId: 'card_1_1_right_right',
            },
          },
        },
        {
          id: 'card_1_1_right_left',
          npcId: 'npc_reporter_zhao',
          text: '媒体闻讯想采访危房停课一事，你如何应对？',
          options: {
            left: { text: '坦诚问题，展示整改计划', delta: { civility: +15, people: +10, economy: -5 } },
            right: { text: '低调处理，暂缓采访', delta: { civility: -5, people: -5 } },
          },
        },
        {
          id: 'card_1_1_right_right',
          npcId: 'npc_old_accountant',
          text: '义务加固需要材料费用，账上资金紧张，是否动用预备金？',
          options: {
            left: { text: '动用预备金，保障安全', delta: { economy: -10, people: +15, civility: +5 } },
            right: { text: '申请镇里临时补助', delta: { civility: +10, people: +5 } },
          },
        },
        {
          id: 'card_1_2',
          npcId: 'npc_old_accountant',
          text: '村里欠款80万，钱有财威胁要锁村部大门起诉。你打算怎么处理？',
          tags: ['债务', '历史遗留', '法律风险'],
          options: {
            left: {
              text: '先还一部分，稳住债主',
              delta: { civility: +10, economy: -25, people: +5 },
              followUpCardId: 'card_1_2_left',
            },
            right: {
              text: '重新审计，该认的认，不该认的绝不认',
              delta: { civility: +20, people: -10, economy: -5 },
              followUpCardId: 'card_1_2_right',
            },
          },
        },
        {
          id: 'card_1_2_left',
          npcId: 'npc_qian',
          text: '钱有财收下部分款项，但要求写清偿计划书并加盖公章。',
          options: {
            left: { text: '签署计划书，分期偿还', delta: { civility: +10, economy: -10 } },
            right: { text: '拒绝签署，维持口头承诺', delta: { civility: -10, people: -5 } },
          },
        },
        {
          id: 'card_1_2_right',
          npcId: 'npc_old_accountant',
          text: '审计发现部分支出无票据，需追责前任干部，是否立案？',
          options: {
            left: { text: '坚决立案，追责到底', delta: { civility: +20, people: -10 } },
            right: { text: '先内部谈话，限期补齐凭证', delta: { civility: +10, people: +5 } },
          },
        },
        {
          id: 'card_1_3',
          npcId: 'npc_qian',
          text: '通镇道路因补偿争议停工半年，设备租赁费已5万。如何推进？',
          tags: ['基础设施', '征地', '裙带关系'],
          options: {
            left: {
              text: '重新规划路线，避开争议地块',
              delta: { civility: +15, economy: -10, people: +10 },
              followUpCardId: 'card_1_3_left',
            },
            right: {
              text: '依法评估补偿，坚持原则',
              delta: { civility: +25, economy: -15, people: -5 },
              followUpCardId: 'card_1_3_right',
            },
          },
        },
        {
          id: 'card_1_3_left',
          npcId: 'npc_lifeng',
          text: '改线可行，但需新增设计费用并延后工期，镇里催进度。',
          options: {
            left: { text: '追加费用，确保推进', delta: { economy: -8, civility: +10 } },
            right: { text: '先保通行，简化路面', delta: { people: +8, economy: -5, civility: +5 } },
          },
        },
        {
          id: 'card_1_3_right',
          npcId: 'npc_lifeng',
          text: '依法评估后补偿提高，李书记小舅子不满，内部压力增大。',
          options: {
            left: { text: '坚持规则，公开评估结果', delta: { civility: +15, people: -5 } },
            right: { text: '做内部工作，适度让利', delta: { people: +5, civility: -5, economy: -5 } },
          },
        },
        {
          type: 'random_pool',
          id: 'pool_stage_1',
          count: 2,
        },
      ],
    },
    {
      id: 'stage_2',
      title: '第二阶段：发展之争（4-12个月）',
      description:
        '威信初步建立后，开始推动发展项目：有机农业园、电商基地、养殖转型，资金有限只能重点支持一条，同时历史问题反复。',
      kpi: { economy: 55, people: 60, environment: 50, civility: 65 },
      kpiEnabled: { economy: true, people: true, environment: false, civility: true },
      cards: [
        {
          id: 'card_2_1',
          npcId: 'npc_chenzong',
          text: '陈总提出300万有机农业园，要求免租三年并排他。若支持王潇，他或转投他村。',
          tags: ['招商引资', '排他条款', '利益博弈'],
          options: {
            left: {
              text: '接受条件，全力支持有机农业园',
              delta: { economy: +40, environment: +15, people: -10, civility: -5 },
              followUpCardId: 'card_2_1_left',
            },
            right: {
              text: '先评估，不承诺排他条款',
              delta: { civility: +20, economy: -10, people: +5 },
              followUpCardId: 'card_2_1_right',
            },
          },
        },
        {
          id: 'card_2_1_left',
          npcId: 'npc_wangxiao',
          text: '支持陈总后，王潇失望：200亩地涉及老人果园与口粮田，担心被排挤。',
          options: {
            left: {
              text: '安置补偿受影响农户',
              delta: { civility: +20, people: -15, economy: +10 },
              followUpCardId: 'card_2_1_left_left',
            },
            right: {
              text: '按政策补偿即可',
              delta: { economy: +25, people: -25, civility: -5 },
            },
          },
        },
        {
          id: 'card_2_1_left_left',
          npcId: 'npc_grandma_wang',
          text: '安置需透明公开，老人担心失地后养老无保障。',
          options: {
            left: { text: '设立专项监督与过渡补贴', delta: { civility: +15, people: +10, economy: -10 } },
            right: { text: '签订补偿协议后快速推进', delta: { economy: +10, civility: -5 } },
          },
        },
        {
          id: 'card_2_1_right',
          npcId: 'npc_chenzong',
          text: '陈总要求两周内给答复，否则撤资。',
          options: {
            left: { text: '快速评估给出折中方案', delta: { civility: +10, economy: +10 } },
            right: { text: '优先支持本土项目，放弃陈总', delta: { economy: -15, civility: +15, people: +10 } },
          },
        },
        {
          id: 'card_2_2',
          npcId: 'npc_wangxiao',
          text:
            '王潇提出电商基地方案：统一品牌包装、建小型加工厂、培训30名青年，需集体支持20万。',
          tags: ['青年创业', '电商', '风险投资'],
          options: {
            left: {
              text: '村集体投资20万占51%',
              delta: { economy: +25, people: +15, civility: -10 },
              followUpCardId: 'card_2_2_left',
            },
            right: {
              text: '协助贷款，村里只担保',
              delta: { economy: +15, civility: +15, people: +5 },
              followUpCardId: 'card_2_2_right',
            },
          },
        },
        {
          id: 'card_2_2_left',
          npcId: 'npc_old_accountant',
          text: '集体入股需完善财务监管，是否设立项目专账？',
          options: {
            left: { text: '设专账并定期公示', delta: { civility: +20, people: +10 } },
            right: { text: '简化流程，先干再说', delta: { economy: +5, civility: -10 } },
          },
        },
        {
          id: 'card_2_2_right',
          npcId: 'npc_wangxiao',
          text: '贷款担保获批，但银行要求风险共担，需追加抵押。',
          options: {
            left: { text: '以集体资产作部分抵押', delta: { economy: -10, civility: +10 } },
            right: { text: '缩小规模，降低贷款额', delta: { economy: -5, people: -5, civility: +5 } },
          },
        },
        {
          id: 'card_2_3',
          npcId: 'npc_he',
          text: '养猪场整改后仍排污，水样超标12倍。是否向市环保局举报？',
          tags: ['环保反弹', '监管失灵', '职业道德'],
          options: {
            left: {
              text: '秘密取证，直报市环保局',
              delta: { environment: +30, civility: -15, people: -10 },
              followUpCardId: 'card_2_3_left',
            },
            right: {
              text: '内部施压，限期二次整改',
              delta: { environment: +10, civility: +10, people: -5 },
              followUpCardId: 'card_2_3_right',
            },
          },
        },
        {
          id: 'card_2_3_left',
          npcId: 'npc_zhangfu',
          text: '张福贵得知举报，威胁报复，要求你撤回材料。',
          options: {
            left: { text: '坚持上报，申请警方保护', delta: { civility: +20, people: -10 } },
            right: { text: '协商缓报，换取彻底整改', delta: { environment: +10, civility: +5, people: +5 } },
          },
        },
        {
          id: 'card_2_3_right',
          npcId: 'npc_he',
          text: '二次整改承诺到位，但需要监督资金与设备采购。',
          options: {
            left: { text: '建立第三方监测机制', delta: { civility: +15, environment: +10, economy: -5 } },
            right: { text: '由村委监督，降低成本', delta: { civility: +5, economy: 0, environment: +5 } },
          },
        },
        {
          id: 'card_2_4',
          npcId: 'npc_reporter_zhao',
          text:
            '记者突访：危房小学、养殖污染、扶贫资金使用不明三大问题希望采访。',
          tags: ['媒体监督', '形象危机', '公共关系'],
          options: {
            left: {
              text: '坦诚问题，展示整改努力',
              delta: { civility: +25, people: +10, economy: -5 },
              followUpCardId: 'card_2_4_left',
            },
            right: {
              text: '重点介绍规划，淡化问题',
              delta: { economy: +15, civility: -10, people: -5 },
              followUpCardId: 'card_2_4_right',
            },
          },
        },
        {
          id: 'card_2_4_left',
          npcId: 'npc_reporter_zhao',
          text: '记者认可坦诚态度，建议后续跟拍整改进展。',
          options: {
            left: { text: '同意公开透明', delta: { civility: +15, people: +10 } },
            right: { text: '仅提供阶段性信息', delta: { civility: +5 } },
          },
        },
        {
          id: 'card_2_4_right',
          npcId: 'npc_reporter_zhao',
          text: '记者质疑遮丑，准备发出批评报道。',
          options: {
            left: { text: '紧急补充材料挽回', delta: { civility: +10, economy: -5 } },
            right: { text: '接受批评，内部整改', delta: { civility: +5, people: +5 } },
          },
        },
        {
          type: 'random_pool',
          id: 'pool_stage_2',
          count: 3,
        },
      ],
    },
    {
      id: 'stage_3',
      title: '第三阶段：深水攻坚（13-24个月）',
      description:
        '项目推进中的利益分配、环保反弹、媒体与上级考核齐聚，需在有限时间内巩固成果、化解危机并形成可持续机制。',
      kpi: { economy: 70, people: 75, environment: 60, civility: 80 },
      kpiEnabled: { economy: true, people: true, environment: true, civility: true },
      cards: [
        {
          id: 'card_3_1',
          npcId: 'npc_grandma_wang',
          text:
            '有机农业园被质疑违规：化肥替代有机肥、用工不足且多为外村人、部分土地荒置，疑似圈地。',
          tags: ['投资监管', '土地投机', '公众监督'],
          options: {
            left: {
              text: '立即调查，如有欺诈依法处理',
              delta: { civility: +30, economy: -40, people: +15 },
              followUpCardId: 'card_3_1_left',
            },
            right: {
              text: '内部约谈，限期整改',
              delta: { economy: -15, civility: -10, people: -20 },
              followUpCardId: 'card_3_1_right',
            },
          },
        },
        {
          id: 'card_3_1_left',
          npcId: 'npc_chenzong',
          text: '陈总称受市场波动影响，若严格处罚将撤资并索赔。',
          options: {
            left: { text: '坚持调查，必要时解除合同', delta: { civility: +20, economy: -20 } },
            right: { text: '协商整改，保留项目但强化监管', delta: { civility: +10, economy: -5 } },
          },
        },
        {
          id: 'card_3_1_right',
          npcId: 'npc_grandma_wang',
          text: '村民认为你偏袒资本方，信任下降。',
          options: {
            left: { text: '公开整改清单与时间表', delta: { civility: +15, people: +10 } },
            right: { text: '维持内部处理，求稳', delta: { civility: -10, people: -10 } },
          },
        },
        {
          id: 'card_3_2',
          npcId: 'npc_wangxiao',
          text:
            '电商项目遭投诉：物流成本高、包装不达标、亏损15万。是否追加投资？',
          tags: ['创业失败', '资金风险', '信任危机'],
          options: {
            left: {
              text: '追加投资，聘请专业团队挽救',
              delta: { economy: -25, civility: -15, people: +10 },
              followUpCardId: 'card_3_2_left',
            },
            right: {
              text: '及时止损，总结教训',
              delta: { civility: +20, economy: -10, people: -15 },
              followUpCardId: 'card_3_2_right',
            },
          },
        },
        {
          id: 'card_3_2_left',
          npcId: 'npc_old_accountant',
          text: '需追加预算并重新确立决策机制，是否引入第三方运营？',
          options: {
            left: { text: '引入专业团队托管', delta: { economy: -10, civility: +15 } },
            right: { text: '内部迭代，控制成本', delta: { economy: -5, civility: +5 } },
          },
        },
        {
          id: 'card_3_2_right',
          npcId: 'npc_wangxiao',
          text: '王潇失望，但愿意留下协助总结经验。',
          options: {
            left: { text: '鼓励其转型做培训与直播', delta: { people: +10, economy: +5 } },
            right: { text: '安排他参与其他项目', delta: { civility: +5, people: +5 } },
          },
        },
        {
          id: 'card_3_3',
          npcId: 'npc_lifeng',
          text: '班子内部有分歧：有人认为你太激进。民主生活会在即，如何处理？',
          tags: ['班子矛盾', '政治风险'],
          options: {
            left: {
              text: '坚持原则，会上坦诚沟通',
              delta: { civility: +25, people: -10, economy: -5 },
              followUpCardId: 'card_3_3_left',
            },
            right: {
              text: '适当妥协，先维持团结',
              delta: { civility: -10, people: +15, economy: +5 },
              followUpCardId: 'card_3_3_right',
            },
          },
        },
        {
          id: 'card_3_3_left',
          npcId: 'npc_old_party',
          text: '老党员支持你立规矩，但提醒注意方式方法。',
          options: {
            left: { text: '建立班子共识行动清单', delta: { civility: +15 } },
            right: { text: '聚焦几件硬任务，少开战线', delta: { civility: +10, people: +5 } },
          },
        },
        {
          id: 'card_3_3_right',
          npcId: 'npc_lifeng',
          text: '暂时缓和矛盾，但改革动力下降。',
          options: {
            left: { text: '设里程碑，避免拖延', delta: { civility: +10 } },
            right: { text: '继续观望，避免冲突', delta: { civility: -5, people: +5 } },
          },
        },
        {
          id: 'card_3_4',
          npcId: 'npc_reporter_zhao',
          text:
            '省里征集“基层治理创新案例”。若拿出“问题村蜕变”的真实故事，可能获得政策与资金倾斜。',
          tags: ['政策机遇', '媒体效应'],
          options: {
            left: {
              text: '精心准备材料，全力争取',
              delta: { civility: +20, economy: +15, people: +10 },
              followUpCardId: 'card_3_end_a',
            },
            right: {
              text: '实事求是，不包装不夸大',
              delta: { civility: +25, economy: +5, people: +15 },
              followUpCardId: 'card_3_end_b',
            },
          },
        },
        {
          id: 'card_3_end_a',
          npcId: 'npc_old_party',
          text: '改革派结局：得罪不少人，但路通了、校舍建了，规矩立住，群众认可变化。',
          options: {
            left: { text: '继续推进未完成改革', delta: { civility: +40, people: +25, economy: +20, environment: +30 } },
            right: { text: '申请留任，完成未尽事业', delta: { civility: +50, people: +30, economy: +25, environment: +35 } },
          },
        },
        {
          id: 'card_3_end_b',
          npcId: 'npc_lifeng',
          text: '务实派结局：稳步推进，欠债还清，矛盾化解，班子稳定，人心未乱。',
          options: {
            left: { text: '总结经验，形成可复制模式', delta: { civility: +35, people: +30, economy: +25, environment: +20 } },
            right: { text: '推荐接任者，确保延续', delta: { civility: +45, people: +35, economy: +20, environment: +25 } },
          },
        },
        {
          type: 'random_pool',
          id: 'pool_stage_3',
          count: 2,
        },
      ],
    },
  ],
};

// DEMO_CONFIG 作为在线/预览的默认值，同步指向编辑器示例
export const DEMO_CONFIG: GameConfig = EDITOR_SAMPLE_CONFIG;