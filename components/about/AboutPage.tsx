import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, // 添加返回箭头图标
  ChevronDown, 
  ChevronRight, 
  Play, 
  BookOpen, 
  Users, 
  BarChart3, 
  Target,
  FileText,
  Award,
  Globe,
  Clock,
  Zap,
  Shield,
  Cpu,
  Database,
  Code,
  UserCheck,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  Brain,
  Gamepad2,
  Edit3,
  Search,
  Download,
  Calendar,
  Star
} from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [stats, setStats] = useState({
    cases: 0,
    users: 0,
    institutions: 0,
    satisfaction: 0
  });

  // 模拟数据加载动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        cases: 500,
        users: 100,
        institutions: 10,
        satisfaction: 68
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 页面滚动到指定部分
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // 核心功能数据
  const coreFeatures = [
    {
      title: "AI危机谈判系统",
      description: "大语言模型驱动的自然语言谈判训练，模拟真实群众工作场景",
      icon: <Brain className="w-6 h-6" />,
      color: "from-red-500 to-orange-500",
      stats: ["情绪化NPC", "多轮谈判", "实时AI评估", "个性化反馈"],
      link: "#ai-negotiation-demo" 
      },
    {
      title: "四维动态制衡",
      description: "经济、民生、生态、乡风的动态平衡决策系统",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
      stats: ["非线性因果", "模糊决策", "长尾效应", "系统思维"],
      link: "#balance"
    },
    {
      title: "可视化编辑器",
      description: "零代码内容创作工具，支持AI辅助生成",
      icon: <Edit3 className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      stats: ["拖拽编排", "文档转化", "实时预览", "一键发布"],
      link: "#editor"
    },
    {
      title: "RAG智能体",
      description: "基于22万字真实案例库的专业AI助手",
      icon: <Cpu className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      stats: ["精准检索", "案例匹配", "政策解读", "智能推荐"],
      link: "#rag"
    }
  ];

  // 发展时间轴数据
  const timelineData = [
    {
      phase: "第一阶段",
      title: "产品打磨与试点验证",
      duration: "6个月",
      year: "2026",
      activities: [
        "在2-3家省级党校部署测试",
        "收集用户反馈进行迭代优化",
        "积累首批高质量UGC案例",
        "完成产品核心模块稳定化"
      ],
      achievements: ["签约5家标杆机构客户", "完成更加精细化的案例库建设", "产品核心模块稳定运行"]
    },
    {
      phase: "第二阶段",
      title: "实效验证与纵向深化",
      duration: "1-2年",
      year: "2026-2027",
      activities: [
        "面向全国党校系统推广标准化方案",
        "基于平台数据开展治理行为学研究",
        "训练更垂直、可靠的基层治理智能体",
        "发布首个大型剧情DLC"
      ],
      achievements: ["C端游戏销量突破里程碑", "B/G端客户扩展至30家以上", "智能体完成重要升级"]
    },
    {
      phase: "第三阶段",
      title: "市场拓展与生态开放",
      duration: "2-3年",
      year: "2027-2028",
      activities: [
        "在Steam、TapTap等主流平台发布完整版",
        "建立全国渠道合作伙伴网络",
        "有限度开放编辑器工具",
        "举办案例创作大赛"
      ],
      achievements: ["形成稳定B端订阅收入", "C端内容销售收入增长", "UGC生态初步形成"]
    },
    {
      phase: "第四阶段",
      title: "边界延伸与平台成型",
      duration: "3年以上",
      year: "2028+",
      activities: [
        "将核心引擎复制到社区治理、应急管理等领域",
        "全面开放编辑器与创作生态",
        "建立行业标准与认证体系",
        "探索国际市场合作"
      ],
      achievements: ["成为基层干部数字化实战培训重要平台", "完成向模拟培训平台的进化"]
    }
  ];

  // 团队成员数据
  const teamMembers = [
    {
      name: "俞乐怡",
      role: "主导技术实现",
      avatar: "👩‍💻",
      expertise: ["游戏框架开发", "AI系统集成", "前后端架构", "平台部署"],
      background: "负责《山河答卷》整体技术架构设计，主导游戏框架与AI系统的集成开发，确保平台高性能与可扩展性",
      contributions: [
        "搭建React Context全局状态树与数值平衡引擎",
        "实现大语言模型API的统一调用层与RAG检索服务",
        "开发可视化节点编辑器前端工作流引擎",
        "主导平台前后端联调与云部署架构"
      ],
      link: "https://scholar.google.com/example"
    },
    {
      name: "徐靖豫",
      role: "主导内容生产",
      avatar: "📝",
      expertise: ["基层调研", "案例开发", "产品策划", "政策研究"],
      background: "主导项目22万字真实案例调研体系构建，负责剧情架构、卡牌脚本与NPC角色网络设计，确保内容真实性与教育价值",
      contributions: [
        "完成选调生深度访谈与50+篇驻村日志收集",
        "构建乡村振兴案例库结构化数据模型",
        "设计三阶段实战化叙事剧情架构",
        "制定内容创作规范与质量控制标准"
      ],
      link: "https://scholar.google.com/example"
    },
    {
      name: "郭芷岑",
      role: "视觉呈现主导",
      avatar: "🎨",
      expertise: ["UI/UX设计", "品牌视觉", "像素艺术", "交互设计"],
      background: "负责平台整体视觉系统设计，建立'克制的力量感与温润的叙事性'美术风格，设计游戏与编辑器界面交互体验",
      contributions: [
        "设计SVG遮罩水位图与四维指标可视化系统",
        "创作像素风格角色立绘与乡村场景资产",
        "建立产品视觉规范系统与品牌识别体系",
        "设计零代码编辑器的交互流程与用户体验"
      ],
      link: "https://dribbble.com/example"
    }
  ];

  // 合作伙伴数据
  const partners = [
    { name: "中共中央党校", type: "学术合作", logo: "🏛️", description: "情景模拟教学实验室合作单位" },
    { name: "湖北省委组织部", type: "试点单位", logo: "📋", description: "选调生数字化培训试点" },
    { name: "武汉大学", type: "研究支持", logo: "🎓", description: "基层治理行为学研究合作伙伴" },
    { name: "腾讯云AI", type: "技术支持", logo: "☁️", description: "大模型API与云计算服务" },
    { name: "乡村振兴局", type: "政策指导", logo: "🌾", description: "政策咨询与案例指导" },
  ];

  // FAQ数据
  const faqs = [
    {
      question: "《山河答卷》与传统干部培训方式有何不同？",
      answer: "传统培训以理论讲授为主，缺乏实战性。《山河答卷》通过AI驱动的沉浸式模拟，提供'零风险、可重复、高仿真'的决策训练环境。学员在虚拟环境中面对真实基层治理的两难抉择，通过即时反馈和智能复盘，实现从理论到实战的能力转化。"
    },
    {
      question: "AI危机谈判系统如何确保训练效果？",
      answer: "系统基于22万字真实案例库训练，NPC具有复杂的社会属性与性格标签。AI从共情度、实际性、策略性、合规度四个维度综合评估学员表现，提供个性化反馈。每次谈判都是独特的交互体验，模拟基层工作中'一把钥匙开一把锁'的智慧。"
    },
    {
      question: "如何实现'一县一策'的定制化培训？",
      answer: "通过我们的零代码可视化编辑器，培训机构可以快速将本地政策文件、典型案例转化为可交互的培训内容。支持上传PDF/Word文档，AI自动解析并生成推荐卡牌，创作者只需简单拖拽编辑即可制作符合本地特色的培训剧本。"
    },
    {
      question: "项目的商业模式和可持续性如何？",
      answer: "我们采用B/C双轮驱动模式：B/G端面向机构收取软件授权费与定制服务费（从干部培训经费列支）；C端在Steam等平台采用30-60元买断制。通过'政策点数'机制精准控制AI调用成本，商业模式健康可持续。"
    },
    {
      question: "如何保证内容的真实性与政策合规性？",
      answer: "所有内容均源于真实调研：50+选调生深度访谈、15篇驻村日志、24起官方典型案例。创作过程由乡村振兴领域专家审核，确保符合政策导向。AI智能体基于RAG技术，回答严格依据案例库，有效抑制幻觉。"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* 固定侧边导航 */}
      <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="bg-white/95 backdrop-blur-sm rounded-r-2xl shadow-xl border border-stone-200 py-4 px-2">
          <nav className="space-y-2">
            {[
              { id: 'hero', label: '首页', icon: '⛰️' },
              { id: 'pain-points', label: '痛点分析', icon: '🎯' },
              { id: 'dual-positioning', label: '双重定位', icon: '🎮' },
              { id: 'core-features', label: '核心功能', icon: '✨' },
              { id: 'technology', label: '技术架构', icon: '⚙️' },
              { id: 'market', label: '市场分析', icon: '📈' },
              { id: 'timeline', label: '发展历程', icon: '📅' },
              { id: 'team', label: '团队介绍', icon: '👥' },
              { id: 'partners', label: '期待合作伙伴', icon: '🤝' },
              { id: 'contact', label: '联系我们', icon: '📞' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group ${
                  activeSection === item.id 
                    ? 'bg-primary-red text-white shadow-lg' 
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
                title={item.label}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="absolute left-full ml-2 px-3 py-1 bg-stone-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.label}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="lg:ml-16">
        {/* 顶部导航 */}
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <button
                  onClick={onBack}
                  className="flex items-center space-x-3 group"
                >
                  <img 
                  src="/images/logo.png"  // public目录下的路径
                  alt="山河答卷Logo" 
                  className="h-9 w-9 object-contain"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-stone-900 font-serif tracking-tight">山河答卷</h1>
                    <p className="text-xs text-stone-500">基层治理AI实战模拟平台</p>
                  </div>
                </button>
                <div className="hidden md:flex space-x-1">
                  {['', '', '', '', ''].map((item) => (
                    <button
                      key={item}
                      className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red rounded-lg hover:bg-red-50 transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* 添加的突出返回按钮 */}
                <button 
                  onClick={onBack}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-50 to-red-100 border-2 border-primary-red text-primary-red rounded-xl hover:bg-red-50 hover:shadow-md transition-all duration-300 group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-semibold">返回主页</span>
                </button>

                <button 
                  onClick={() => window.open('https://whu.kdocs.cn/l/ccBbtdGXFDrv', '_blank')}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span>项目演示</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 主视觉区 */}
        <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/images/background.png')] opacity-40 bg-cover bg-center"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/50 to-stone-900/70"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-2"></span>
                  <span className="text-sm">AI原生 · 实战模拟 · 乡村振兴</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold mb-6 font-serif leading-tight">
                  书写<span className="text-primary-red">山河答卷</span>
                  <br />
                  赋能<span className="text-primary-red">治理新篇</span>
                </h1>

                <p className="text-xl text-stone-300 mb-8 leading-relaxed max-w-2xl">
                  基于22万字真实案例调研的基层干部数字化训战平台。
                  通过AI驱动的沉浸式策略模拟，锤炼系统决策、应急处突、群众工作三大核心能力。
                </p>

                <div className="flex flex-wrap gap-4 mb-12">
                  <button 
                    onClick={() => window.open('https://whu.kdocs.cn/l/ccBbtdGXFDrv', '_blank')}
                    className="px-8 py-4 bg-primary-red text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>开始体验</span>
                  </button>
                  <button 
                    onClick={() => window.open('https://whu.kdocs.cn/l/ccBbtdGXFDrv', '_blank')}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    查看案例库
                  </button>
                  <button 
                    onClick={() => window.open('https://whu.kdocs.cn/l/ccBbtdGXFDrv', '_blank')}
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>下载白皮书</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{stats.cases}+</div>
                    <div className="text-sm text-stone-400">真实案例</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{stats.users}+</div>
                    <div className="text-sm text-stone-400">学员使用</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{stats.institutions}</div>
                    <div className="text-sm text-stone-400">合作机构</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{stats.satisfaction}%</div>
                    <div className="text-sm text-stone-400">满意度</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-stone-800">
                  <div 
                    className="aspect-[9/16] bg-cover bg-center relative"
                    style={{ backgroundImage: "url('/images/可视化编辑器3（实时在线预览编辑效果）.png')" }}    >
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="text-6xl mb-6">🎮</div>
                        <h3 className="text-2xl font-bold mb-2 text-white">《山河答卷》游戏界面</h3>
                        <p className="text-stone-200 mb-4">四维指标动态平衡决策系统</p>
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-red/40 rounded-lg backdrop-blur-sm">
                          <span className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></span>
                          <span className="text-sm text-white">"AI危机谈判+AI复盘报告"已就绪</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 浮动标签 */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl shadow-xl">
                  <span className="font-bold">AI原生</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl shadow-xl">
                  <span className="font-bold">实战模拟</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 痛点分析 */}
        <section id="pain-points" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                破解基层培训<span className="text-primary-red">三大核心困境</span>
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                传统干部培训的痛点，正是《山河答卷》创新的起点
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "理论脱离实践",
                  description: "培训内容以宏观政策与通用理论为主，与一线工作实际严重脱节",
                  icon: "📚",
                  color: "border-red-200 bg-red-50",
                  stats: ["干部反映培训内容不实用", "理论转化率不足", "缺乏真实决策场景模拟"],
                  solution: "基于真实案例的数字化训战平台"
                },
                {
                  title: "形式单一枯燥",
                  description: "主要依赖集中讲座、文件阅读等单向传授模式，缺乏互动性与参与感",
                  icon: "🎯",
                  color: "border-blue-200 bg-blue-50",
                  stats: ["学员主动思考不足", "培训过程吸引力弱", "形式化学习普遍"],
                  solution: "游戏化沉浸式学习体验"
                },
                {
                  title: "效果难以评估",
                  description: "培训成果缺乏客观、可量化的衡量标准，难以评估实战能力提升",
                  icon: "📊",
                  color: "border-green-200 bg-green-50",
                  stats: ["传统考核无法评估决策能力", "应急处突能力缺乏衡量标准", "群众工作效果难以量化"],
                  solution: "AI智能复盘与能力画像分析"
                }
              ].map((pain, index) => (
                <div key={index} className={`rounded-2xl border-2 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${pain.color}`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-white border-2 border-stone-200 flex items-center justify-center text-2xl">
                      {pain.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">{pain.title}</h3>
                      <p className="text-sm text-stone-600 mt-1">{pain.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {pain.stats.map((stat, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary-red"></div>
                        <span className="text-sm text-stone-700">{stat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-stone-200">
                    <div className="text-sm font-medium text-primary-red mb-2">《山河答卷》解决方案</div>
                    <div className="font-bold text-lg text-stone-900">{pain.solution}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 产品双重定位 */}
        <section id="dual-positioning" className="py-20 bg-gradient-to-br from-stone-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                <span className="text-primary-red">双重产品定位</span>：严肃培训工具 × 深度策略游戏
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                既满足B/G端机构培训的专业需求，又提供C端玩家的深度游戏体验
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* B/G端定位 */}
              <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-600">面向机构培训体系</div>
                        <h3 className="text-2xl font-bold text-stone-900">数字化训战平台</h3>
                      </div>
                    </div>
                    <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      B/G端
                    </span>
                  </div>

                  <p className="text-stone-600 mb-6 leading-relaxed">
                    为党校、组织部等机构提供"零风险、可重复、高仿真"的决策沙盘。
                    通过可视化编辑器实现"一县一策"的精准定制培训，满足不同地区、
                    不同层级的干部培训需求。
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-stone-700">支付路径合规（干部培训费、党组织工作经费）</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-stone-700">支持定制开发与本地化部署</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-stone-700">提供学员能力评估与培训效果报告</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-stone-500 mb-3">适用场景</div>
                    <div className="flex flex-wrap gap-2">
                      {["选调生岗前培训", "中青年干部轮训", "党校情景模拟课", "党组织活动", "干部网络学院"].map((scene, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                          {scene}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 可视化编辑器图片 */}
                <div 
                  className="h-48 border-t border-blue-100 relative"
                  style={{ 
                    backgroundImage: "url('/images/可视化编辑器1（所见即所得创新树状结构）.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-blue-50/40"></div>
                  <div className="relative z-10 h-full flex items-center justify-center">
                   
                  </div>
                </div>
              </div>

              {/* C端定位 */}
              <div className="bg-white rounded-3xl border-2 border-purple-100 shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-purple-600">面向大众玩家</div>
                        <h3 className="text-2xl font-bold text-stone-900">AI原生策略游戏</h3>
                      </div>
                    </div>
                    <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      C端
                    </span>
                  </div>

                  <p className="text-stone-600 mb-6 leading-relaxed">
                    让玩家在虚拟环境中体验基层治理的复杂挑战，在经济发展、民生保障、
                    生态保护等多重目标间进行策略平衡。通过危机谈判系统体验真实的群众工作，
                    培养系统思维与决策能力。
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-stone-700">买断制定价30-60元，DLC持续更新</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-stone-700">支持Steam、TapTap、微信小程序多平台</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-stone-700">内置AI智能体提供个性化游戏引导</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-stone-500 mb-3">玩家类型</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-700">策略谋局者</div>
                        <div className="text-xs text-purple-600 mt-1">享受系统规划</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-700">叙事沉浸者</div>
                        <div className="text-xs text-purple-600 mt-1">热爱角色故事</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-700">现实关切者</div>
                        <div className="text-xs text-purple-600 mt-1">关注社会议题</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI智能体图片 */}
                <div 
                  className="h-48 border-t border-purple-100 relative"
                  style={{ 
                    backgroundImage: "url('/images/AI智能体4-智能配置危机谈判NPC性格评分标准等.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-purple-50/40"></div>
                  <div className="relative z-10 h-full flex items-center justify-center">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 核心功能详解 */}
        <section id="core-features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                四大<span className="text-primary-red">核心功能模块</span>
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                从AI谈判到智能复盘，从动态平衡到可视化编辑，全面覆盖基层治理训练需求
              </p>
            </div>

            <div className="space-y-8">
              {coreFeatures.map((feature, index) => {
                // 为每个功能模块分配对应的图片
                const featureImages = [
                  "/images/AI智能体6-危机谈判界面.png",
                  "/images/可视化编辑器3（实时在线预览编辑效果）.png",
                  "/images/可视化编辑器2（卡牌导入功能）.png",
                  "/images/AI智能体5-直接对话.png"
                ];
                
                return (
                  <div key={index} className="bg-gradient-to-r from-stone-50 to-white rounded-3xl border border-stone-200 p-8 hover:shadow-xl transition-all duration-300">
                    <div className="grid lg:grid-cols-3 gap-8 items-center">
                      <div className="lg:col-span-2">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}>
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-stone-900">{feature.title}</h3>
                            <p className="text-stone-600 mt-1">{feature.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          {feature.stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-primary-red"></div>
                              <span className="text-stone-700">{stat}</span>
                            </div>
                          ))}
                        </div>

                        <button className="inline-flex items-center space-x-2 text-primary-red font-medium hover:text-red-700 transition-colors">
                        </button>
                      </div>

                      {/* 替换为实际图片 */}
                      <div className="relative">
                        <div 
                          className="aspect-video rounded-xl overflow-hidden border border-stone-300 bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url('${featureImages[index]}')`
                          }}
                        >
                          <div className="absolute inset-0 bg-black/10 hover:bg-black/5 transition-all duration-300"></div>
                        </div>
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary-red to-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
                          创新点
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 技术架构深度解析 */}
        <section id="technology" className="py-20 bg-gradient-to-b from-stone-900 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 font-serif">
                <span className="text-primary-red">技术架构</span>深度解析
              </h2>
              <p className="text-xl text-stone-300 max-w-3xl mx-auto">
                基于React Context状态机、RAG检索增强、LLM角色扮演等前沿技术构建
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  title: "前端架构",
                  tech: "React 18 + TypeScript",
                  description: "SVG遮罩水位图、贝塞尔曲线动画、轻量级物理引擎",
                  icon: <Code className="w-8 h-8" />,
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  title: "AI集成层",
                  tech: "DeepSeek API + RAG",
                  description: "大语言模型Few-Shot Prompting、NLP情感量化模型",
                  icon: <Brain className="w-8 h-8" />,
                  color: "from-purple-500 to-pink-500"
                },
                {
                  title: "数据存储",
                  tech: "Supabase + 向量数据库",
                  description: "22万字案例向量化索引、实时数据同步、UGC内容管理",
                  icon: <Database className="w-8 h-8" />,
                  color: "from-green-500 to-emerald-500"
                },
                {
                  title: "部署架构",
                  tech: "Vercel + Docker",
                  description: "边缘计算优化、自动CI/CD、多环境部署支持",
                  icon: <Zap className="w-8 h-8" />,
                  color: "from-orange-500 to-red-500"
                }
              ].map((tech, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-4`}>
                    {tech.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tech.title}</h3>
                  <div className="text-sm text-primary-red font-medium mb-3">{tech.tech}</div>
                  <p className="text-sm text-stone-300">{tech.description}</p>
                </div>
              ))}
            </div>

            {/* 技术架构详细描述，替换原来的架构图 */}
            <div className="bg-black/50 rounded-3xl border border-white/10 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">系统架构说明</h3>
                  <p className="text-stone-400 mt-1">双端一体架构：移动端游戏 + 网页端编辑器 + AI服务层</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-stone-800 to-black border border-white/10 rounded-xl p-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/5 p-6 rounded-lg">
                      <h4 className="text-lg font-bold mb-2">前端层</h4>
                      <p className="text-sm text-stone-400">采用React 18 + TypeScript构建，实现SVG遮罩水位图、贝塞尔曲线动画等交互效果</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-lg">
                      <h4 className="text-lg font-bold mb-2">AI服务层</h4>
                      <p className="text-sm text-stone-400">基于DeepSeek API和RAG检索增强技术，实现智能对话、案例检索等功能</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-lg">
                      <h4 className="text-lg font-bold mb-2">数据层</h4>
                      <p className="text-sm text-stone-400">使用Supabase和向量数据库，管理22万字案例库和用户生成内容</p>
                    </div>
                  </div>
                  <div className="text-center text-stone-400 text-sm">
                    <p>架构遵循微服务设计原则，各模块解耦，支持水平扩展和高可用性部署</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 市场分析 */}
        <section id="market" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                <span className="text-primary-red">市场分析</span>与竞争策略
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                基于PEST分析、波特五力模型、CPM竞争态势矩阵的深度市场研究
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-stone-900 mb-4">政策环境 (Political)</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <Award className="w-5 h-5 text-blue-500 mt-0.5" />
                    <span>《全国干部教育培训规划（2023—2027年）》强调实战化培训</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Award className="w-5 h-5 text-blue-500 mt-0.5" />
                    <span>《乡村全面振兴规划（2024—2027年）》将治理能力列为重点</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Award className="w-5 h-5 text-blue-500 mt-0.5" />
                    <span>中央组织部划拨3.18亿元党费支持干部培训</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-stone-900 mb-4">市场规模 (Economic)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-stone-900 mb-1">B/G端市场</div>
                    <div className="text-stone-600">全国各级党校年培训干部超百万人次</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900 mb-1">C端市场</div>
                    <div className="text-stone-600">策略模拟游戏全球年产值超50亿美元</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-stone-900 mb-4">竞争态势</h3>
                <div className="space-y-4">
                  <div>
                    <div className="font-bold text-stone-900 mb-1">传统培训产品</div>
                    <div className="text-sm text-stone-600">在线课程与题库，缺乏交互性</div>
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 mb-1">严肃游戏</div>
                    <div className="text-sm text-stone-600">内容生硬枯燥，参与度低</div>
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 mb-1">AI对话应用</div>
                    <div className="text-sm text-stone-600">开放话题缺乏聚焦，生成不可控</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 市场分析详细描述 */}
            <div className="bg-stone-50 rounded-3xl border border-stone-200 p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-stone-900">市场竞争优势分析</h3>
                <p className="text-stone-600 mt-1">基于SWOT模型的产品差异化优势</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-lg text-stone-900 mb-4">核心优势</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-red rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-stone-900">内容真实性：基于22万字真实案例库，确保培训内容贴近一线工作实际</p>
                        <p className="text-sm text-stone-600 mt-1">50+选调生深度访谈、15篇驻村日志、24起官方典型案例</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-red rounded-full mt=2"></div>
                      <div>
                        <p className="font-medium text-stone-900">技术先进性：AI驱动的沉浸式模拟，提供"零风险、可重复、高仿真"训练环境</p>
                        <p className="text-sm text-stone-600 mt-1">RAG检索增强、大语言模型角色扮演、四维动态平衡决策系统</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-red rounded-full mt=2"></div>
                      <div>
                        <p className="font-medium text-stone-900">模式创新性：B/C双轮驱动，既服务机构培训又满足个人学习需求</p>
                        <p className="text-sm text-stone-600 mt-1">机构按需定制 + 个人按体验学习，形成完整的产品生态</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 发展历程时间轴 */}
        <section id="timeline" className="py-20 bg-gradient-to-b from-white to-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                <span className="text-primary-red">四阶段</span>发展路径
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                从试点验证到平台拓展，构建可持续发展的产品生态
              </p>
            </div>

            <div className="space-y-8">
              {timelineData.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-red to-red-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-primary-red">{stage.phase}</div>
                          <div className="text-lg font-bold text-stone-900">{stage.title}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-600">{stage.duration}</span>
                        <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded text-sm">
                          {stage.year}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-bold text-stone-900 mb-2">关键举措</h4>
                      <ul className="space-y-1.5">
                        {stage.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-stone-600">
                            <ChevronRight className="w-4 h-4 text-primary-red mt-0.5 flex-shrink-0" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-stone-200">
                      <h4 className="font-bold text-stone-900 mb-2">预期成果</h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.achievements.map((achievement, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gradient-to-r from-primary-red/10 to-red-100 text-primary-red rounded-lg text-sm">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 团队介绍 */}
        <section id="team" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                <span className="text-primary-red">武汉大学</span>的创新团队
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                技术研发、内容策划与视觉设计三位一体
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-gradient-to-b from-stone-50 to-white rounded-2xl border-2 border-stone-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-red/20 to-red-100 flex items-center justify-center text-4xl mb-4">
                      {member.avatar}
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{member.name}</h3>
                    <div className="text-primary-red font-medium mt-1">{member.role}</div>
                    <p className="text-sm text-stone-600 mt-3">{member.background}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-stone-900 mb-3">核心专长</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900 mb-3">主要贡献</h4>
                    <ul className="space-y-2">
                      {member.contributions.slice(0, 2).map((contribution, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-stone-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-red mt-1.5"></div>
                          <span>{contribution}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* 移除获奖部分，替换为团队理念 */}
            <div className="bg-gradient-to-r from-primary-red/5 to-red-50 rounded-2xl border-2 border-primary-red/20 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-stone-900 mb-4">我们的理念</h3>
                <p className="text-lg text-stone-700 mb-6 max-w-3xl mx-auto">
                  我们相信，真正的创新源于对基层治理的深刻理解与对技术应用的敬畏之心。
                  每一行代码、每一个案例、每一个设计，都承载着我们对乡村振兴的责任与热忱。
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-red/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="font-bold text-stone-900">以实为本</div>
                    <div className="text-sm text-stone-600">扎根真实案例，解决实际问题</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-red/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <div className="font-bold text-stone-900">协同共创</div>
                    <div className="text-sm text-stone-600">跨学科协作，激发创新火花</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-red/10 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <div className="font-bold text-stone-900">长期主义</div>
                    <div className="text-sm text-stone-600">着眼长远发展，持续迭代优化</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 合作伙伴 */}
        <section id="partners" className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                期待<span className="text-primary-red">合作机构</span>
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                未来期望与政府、高校、企业建立深度合作关系，共同推动基层治理数字化
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {partners.map((partner, index) => (
                <div key={index} className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-2xl">
                      {partner.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{partner.name}</h4>
                      <div className="text-sm text-primary-red">{partner.type}</div>
                      <p className="text-xs text-stone-600 mt-1">{partner.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-stone-900 mb-4 font-serif">
                常见<span className="text-primary-red">问题解答</span>
              </h2>
              <p className="text-xl text-stone-600">关于《山河答卷》的疑问，我们为您解答</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-stone-50 transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary-red/10 flex items-center justify-center">
                        <span className="text-primary-red font-bold">{index + 1}</span>
                      </div>
                      <span className="text-lg font-medium text-stone-900">{faq.question}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${
                      expandedFAQ === index ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  <div className={`px-6 overflow-hidden transition-all duration-300 ${
                    expandedFAQ === index ? 'pb-6' : 'h-0'
                  }`}>
                    <p className="text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 底部CTA */}
        <section id="contact" className="py-20 bg-gradient-to-br from-stone-900 to-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6 font-serif">立即体验<span className="text-primary-red">《山河答卷》</span></h2>
            <p className="text-xl text-stone-300 mb-8 leading-relaxed">
              开启基层治理数字化训练新篇章，共同探索AI赋能治理能力现代化的创新路径
            </p>
              
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => window.open('https://whu.kdocs.cn/l/ccBbtdGXFDrv', '_blank')}
                className="px-8 py-4 bg-primary-red text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                申请机构试用
              </button>
              <button 
                onClick={() => window.open('https://whu.kdocs.cn/l/ctuVHh5gPu0v', '_blank')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                下载项目白皮书
              </button>
              <button 
                onClick={() => window.open('https://whu.kdocs.cn/l/ccBbtdGXFDrv', '_blank')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                预约产品演示
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 pt-12 border-t border-white/20">
              <div>
                <h4 className="font-bold text-lg mb-4">项目单位</h4>
                <p className="text-stone-300">武汉大学</p>
                <p className="text-sm text-stone-400 mt-1">新闻与传播学院</p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4">联系我们</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-stone-300">
                    <Mail className="w-4 h-4" />
                    <span>xujingyuxingwen@qq.com</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-stone-300">
                    <Phone className="w-4 h-4" />
                    <span>18120260583</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 悬浮返回按钮 - 始终可见 */}
        <button
          onClick={onBack}
          className="fixed bottom-8 right-8 z-50 flex items-center space-x-2 px-5 py-3 bg-white border-2 border-primary-red text-primary-red rounded-xl shadow-xl hover:shadow-2xl hover:bg-red-50 transition-all duration-300 group"
          style={{ animation: 'bounce 2s infinite' }}
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">返回主页</span>
        </button>

        <style>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>

        {/* 页脚 */}
        <footer className="bg-black text-white/60 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-red to-red-600 flex items-center justify-center text-white font-bold">
                  山
                </div>
                <div>
                  <div className="font-bold text-white">山河答卷</div>
                  <div className="text-xs">基层治理AI实战模拟平台</div>
                </div>
              </div>
              
              <div className="text-sm">
                <div>© 2025 山河答卷 · 武汉大学 · 保留所有权利</div>
                <div className="mt-1">本平台内容基于真实案例改编，仅供培训学习使用</div>
              </div>
              
              <div className="flex space-x-4 mt-4 md:mt-0">
                <button 
                  onClick={() => window.open('https://whu.kdocs.cn/l/cnPhzLub5OK3', '_blank')}
                  className="text-xs hover:text-white transition-colors"
                >
                  隐私政策
                </button>
                <button 
                  onClick={() => window.open('https://whu.kdocs.cn/l/ccX9aUumyqaK', '_blank')}
                  className="text-xs hover:text-white transition-colors"
                >
                  使用条款
                </button>
                <button 
                  onClick={() => window.open('https://whu.kdocs.cn/l/cfvhwftdTR8h', '_blank')}
                  className="text-xs hover:text-white transition-colors"
                >
                  免责声明
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AboutPage;