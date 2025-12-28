import React, { useState } from 'react';
// @ts-ignore
import Editor from './components/editor/Editor';
// @ts-ignore
import { GameLoopEnhanced } from './components/game/GameLoopEnhanced';
// @ts-ignore
import ResourceLibrary from './components/library/ResourceLibrary';
// @ts-ignore
import UGCSubmission from './components/ugc/UGCSubmission';
// @ts-ignore
import AdminCaseUpload from './components/admin/AdminCaseUpload';
// @ts-ignore
import AdminReview from './components/admin/AdminReview';
// @ts-ignore
import AdminBatchImport from './components/admin/AdminBatchImport';
// @ts-ignore
import AIAgent from './components/ai/AIAgent';
// @ts-ignore
import LoginModal from './components/auth/LoginModal';
// @ts-ignore
import AboutPage from './components/about/AboutPage';
// @ts-ignore
import ProfilePage from './components/profile/ProfilePage';
import { GameConfig } from './types';
import { EDITOR_SAMPLE_CONFIG } from './constants';

type AppMode = 'landing' | 'editor' | 'game' | 'game-preview' | 'library' | 'ugc' | 'admin' | 'admin-review' | 'admin-batch-import' | 'ai-agent' | 'about' | 'profile';

interface User {
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  role?: 'user' | 'admin'; // 添加角色字段
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('landing');
  const [config, setConfig] = useState<GameConfig>(EDITOR_SAMPLE_CONFIG);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLaunchGame = () => setMode('game');
  const handleLaunchEditor = () => setMode('editor');
  const handleExitGame = () => setMode('landing');
  const handleShowLibrary = () => setMode('library');
  const handleShowUGC = () => setMode('ugc');
  // 检查是否为管理员
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin') || user?.email?.includes('@admin');
  
  const handleShowAdmin = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!isAdmin) {
      alert('您没有管理员权限，请联系管理员获取访问权限。\n\n提示：管理员账号邮箱需包含 "admin" 关键字。');
      return;
    }
    setMode('admin');
  };
  
  const handleShowAdminReview = () => {
    if (!user || !isAdmin) {
      alert('您没有管理员权限');
      return;
    }
    setMode('admin-review');
  };
  const handleShowAIAgent = () => setMode('ai-agent');
  const handleShowAbout = () => setMode('about');
  const handleShowProfile = () => setMode('profile');

  // 登录处理（演示模式：本地存储）
  const handleLogin = async (email: string, password: string) => {
    // 演示模式：简单验证后存储到localStorage
    if (!email || !password) {
      throw new Error('请输入邮箱和密码');
    }
    if (password.length < 6) {
      throw new Error('密码至少需要6位');
    }
    
    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 判断是否为管理员（邮箱包含 "admin" 关键字）
    const isAdminUser = email.toLowerCase().includes('admin') || email.toLowerCase().includes('@admin');
    
    const userData: User = { 
      email, 
      name: email.split('@')[0],
      role: isAdminUser ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 注册处理（演示模式）
  const handleSignUp = async (email: string, password: string) => {
    // 演示模式：与登录相同
    await handleLogin(email, password);
  };

  // 更新用户信息
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // 登出处理
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 初始化：从localStorage恢复登录状态
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // 忽略解析错误
      }
    }
  }, []);

  // 如果访问个人主页但未登录，重定向到首页
  React.useEffect(() => {
    if (mode === 'profile' && !user) {
      setMode('landing');
    }
  }, [mode, user]);

  if (mode === 'editor') {
    return (
      <Editor 
        config={config} 
        setConfig={setConfig} 
        onLaunchPreview={() => setMode('game-preview')}
        onBack={() => setMode('landing')}
      />
    );
  }

  // 实战演练 - 使用固定的标准版游戏
  if (mode === 'game') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-red-50/30 to-stone-50 flex items-center justify-center overflow-hidden relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-red rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-stone-300 rounded-full blur-3xl"></div>
        </div>
        
        {/* 顶部返回按钮 - 在手机容器外部 */}
        <button
          onClick={handleExitGame}
          className="absolute top-6 left-6 z-50 px-4 py-2 bg-white/90 backdrop-blur-sm text-ink rounded-lg shadow-lg hover:bg-white hover:shadow-xl transition-all flex items-center gap-2 font-bold text-sm border border-stone-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首页
        </button>

        {/* 模拟手机屏幕容器 - 调整为更合适的比例 (390×760) */}
        <div className="w-full h-full md:w-[390px] md:h-[760px] md:rounded-[2rem] overflow-hidden bg-gov-paper shadow-2xl relative md:border-[8px] md:border-stone-800/20">
          <GameLoopEnhanced config={null} onExit={handleExitGame} />
          {/* 反光层 */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent z-50"></div>
        </div>
      </div>
    );
  }

  // 创作者工坊预览 - 使用用户编辑的配置
  if (mode === 'game-preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-red-50/30 to-stone-50 flex items-center justify-center overflow-hidden relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary-red rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-stone-300 rounded-full blur-3xl"></div>
        </div>
        
        {/* 顶部返回按钮 - 返回编辑器 */}
        <button
          onClick={() => setMode('editor')}
          className="absolute top-6 left-6 z-50 px-4 py-2 bg-white/90 backdrop-blur-sm text-ink rounded-lg shadow-lg hover:bg-white hover:shadow-xl transition-all flex items-center gap-2 font-bold text-sm border border-stone-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回编辑器
        </button>

        {/* 模拟手机屏幕容器 */}
        <div className="w-full h-full md:w-[390px] md:h-[760px] md:rounded-[2rem] overflow-hidden bg-gov-paper shadow-2xl relative md:border-[8px] md:border-stone-800/20">
          {/* 创作者工坊预览：使用编辑器配置 */}
          <GameLoopEnhanced config={config} onExit={() => setMode('editor')} />
          {/* 反光层 */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent z-50"></div>
        </div>
      </div>
    );
  }

  if (mode === 'library') {
    return <ResourceLibrary onBack={() => setMode('landing')} onAdminMode={() => setMode('admin')} />;
  }

  if (mode === 'ugc') {
    return <UGCSubmission onBack={() => setMode('landing')} />;
  }

  if (mode === 'admin') {
    // 再次检查管理员权限
    if (!user || !isAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ 权限不足</h2>
            <p className="text-stone-700 mb-6">您没有管理员权限，无法访问此页面。</p>
            <button
              onClick={() => setMode('landing')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }
    return (
      <AdminCaseUpload 
        onBack={() => setMode('landing')} 
        onReviewMode={() => setMode('admin-review')}
        onBatchImport={() => setMode('admin-batch-import')}
      />
    );
  }

  if (mode === 'admin-review') {
    if (!user || !isAdmin) {
      setMode('landing');
      return null;
    }
    return (
      <AdminReview 
        onBack={() => setMode('admin')} 
        onUploadMode={() => setMode('admin')}
      />
    );
  }

  if (mode === 'admin-batch-import') {
    if (!user || !isAdmin) {
      setMode('landing');
      return null;
    }
    return (
      <AdminBatchImport 
        onBack={() => setMode('admin')}
      />
    );
  }

  if (mode === 'ai-agent') {
    return <AIAgent onBack={() => setMode('landing')} />;
  }

  if (mode === 'about') {
    return <AboutPage onBack={() => setMode('landing')} />;
  }

  if (mode === 'profile') {
    if (!user) {
      // 如果未登录，显示登录提示或返回null（useEffect会处理重定向）
      return null;
    }
    return <ProfilePage user={user} onBack={() => setMode('landing')} onUpdate={handleUpdateUser} />;
  }

  return (
    <div className="min-h-screen bg-paper">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <button
              onClick={() => setMode('landing')}
              className="text-2xl font-bold text-primary-red tracking-wider flex items-center gap-2 font-serif hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl">⛰️</span>
              <span>山河答卷</span>
            </button>

            {/* 导航链接 */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleShowLibrary}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all"
              >
                资料库
              </button>
              <button 
                onClick={handleShowUGC}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all"
              >
                投稿
              </button>
              <button 
                onClick={handleShowAdmin}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all"
              >
                管理员
              </button>
              <button 
                onClick={handleShowAbout}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all"
              >
                关于
              </button>
              
              {/* 分隔线 */}
              <div className="h-6 w-px bg-stone-300 mx-2"></div>

              {/* 用户操作区 */}
              {user ? (
                <>
                  <button
                    onClick={handleShowProfile}
                    className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-red/10 text-primary-red flex items-center justify-center text-xs font-bold">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </span>
                    <span className="hidden sm:inline">{user.name || user.email.split('@')[0]}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                  >
                    登出
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-5 py-2 bg-primary-red text-white rounded-lg hover:bg-[#A0353C] transition-all text-sm font-medium shadow-sm hover:shadow-md"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Level 1 (Paper) */}
      <main className="bg-[#F7F4ED]">
        <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[#2C2C2C] mb-6 tracking-tight font-serif">
              基层治理的<br/>
              <span className="text-[#B94047]">
                沉浸式演练场
              </span>
            </h1>
            <p className="text-xl text-[#2C2C2C]/80 leading-relaxed max-w-2xl mx-auto mb-8 font-sans">
              在这里，你不仅是观察者，更是决策者。<br/>
              面对两难抉择，平衡经济、民生、生态与乡风。<br/>
              体验真实基层工作的复杂与温度。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={handleLaunchGame}
                className="px-8 py-4 bg-[#B94047] text-white rounded-lg text-lg font-bold shadow-lg hover:bg-[#A0353C] hover:shadow-xl transition-all active:scale-95 transform"
              >
                🎮 进入实战演练
              </button>
              <button 
                onClick={handleLaunchEditor}
                className="px-8 py-4 bg-white/90 backdrop-blur-sm text-[#2C2C2C] border-2 border-[#2C2C2C]/10 rounded-lg text-lg font-bold shadow-md hover:border-[#B94047] hover:bg-[#B94047]/5 transition-all active:scale-95 transform"
              >
                🛠️ 创作者工坊
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-[#2C2C2C]/70">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span>已收录 <strong className="text-[#B94047]">380+</strong> 个真实案例</span>
              </div>
              <div className="w-px h-6 bg-[#2C2C2C]/20"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <span>调研笔记 <strong className="text-[#B94047]">22万</strong> 字</span>
              </div>
            </div>
          </div>

          {/* 功能入口 Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <button
              onClick={handleShowLibrary}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-[#2C2C2C]/10 hover:-translate-y-1 transform"
            >
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-2 font-serif">资料库</h3>
              <p className="text-[#2C2C2C]/70 text-sm mb-4 font-sans">
                丰富的政策法规和典型案例，为学习提供参考
              </p>
              <span className="text-[#B94047] font-bold text-sm">查看资料库 →</span>
            </button>

            <button
              onClick={handleShowUGC}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-[#2C2C2C]/10 hover:-translate-y-1 transform"
            >
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-2 font-serif">UGC投稿</h3>
              <p className="text-[#2C2C2C]/70 text-sm mb-4 font-sans">
                分享您的真实经验，共同建设基层治理知识库
              </p>
              <span className="text-[#B94047] font-bold text-sm">立即投稿 →</span>
            </button>

            <button
              onClick={handleShowAIAgent}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-[#2C2C2C]/10 hover:-translate-y-1 transform"
            >
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-[#2C2C2C] mb-2 font-serif">AI智能体</h3>
              <p className="text-[#2C2C2C]/70 text-sm mb-4 font-sans">
                基于RAG检索的AI助手，基于案例库提供专业咨询
              </p>
              <span className="text-[#B94047] font-bold text-sm">开始对话 →</span>
            </button>
          </div>
        </section>
      </main>

      {/* Vision Section - Level 2 (White) */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* 左侧文案 */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-6 font-serif">
                🌏 打破时空限制，把"村口"搬进屏幕
              </h2>
              <p className="text-lg md:text-xl text-[#2C2C2C]/80 mb-8 leading-relaxed font-sans">
                《山河答卷》不仅是一款策略游戏，更是专为选调生、驻村干部打造的数字化练兵场。我们致力于解决传统培训中"理论脱离实践"的痛点。在这里，您是第一书记，整个村庄的命运，系于您的一念之间。
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">💼</span>
                  <div>
                    <h3 className="font-bold text-[#2C2C2C] mb-1 text-lg font-serif">沉浸式履职</h3>
                    <p className="text-[#2C2C2C]/70 font-sans">直面真实村民诉求。</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="text-4xl">🧠</span>
                  <div>
                    <h3 className="font-bold text-[#2C2C2C] mb-1 text-lg font-serif">系统化思维</h3>
                    <p className="text-[#2C2C2C]/70 font-sans">在多方利益中寻找平衡。</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="text-4xl">⚔️</span>
                  <div>
                    <h3 className="font-bold text-[#2C2C2C] mb-1 text-lg font-serif">实战化演练</h3>
                    <p className="text-[#2C2C2C]/70 font-sans">低成本试错，高效率复盘。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧视觉 - 带装饰背景 */}
            <div className="flex items-center justify-center relative">
              <div className="absolute w-64 h-64 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative text-8xl md:text-9xl space-x-4 z-10">
                <span>🏞️</span>
                <span>🔗</span>
                <span>📱</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gameplay Section - Level 1 (Paper) */}
      <section className="bg-[#F7F4ED] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            {/* 左侧说明 */}
            <div>
              <h3 className="text-3xl font-bold text-[#2C2C2C] mb-4 font-serif">极简决策</h3>
              <p className="text-lg text-[#2C2C2C]/80 mb-6 font-sans">
                👈 左滑 / 👉 右滑，深度博弈。
              </p>
              <p className="text-[#2C2C2C]/70 mb-4 font-sans">
                特色机制：模糊反馈系统。
              </p>
              <p className="text-[#2C2C2C]/70 font-sans">
                <span className="text-3xl">🔀</span> 伏笔机制 & <span className="text-3xl">🎲</span> 随机挑战。
              </p>
            </div>

            {/* 中间 - 手机外壳模拟 */}
            <div className="flex justify-center">
              <div className="border-8 border-stone-800 rounded-[2.5rem] bg-white shadow-2xl p-4 max-w-sm w-full">
                {/* 手机屏幕内容 */}
                <div className="bg-white rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🏭</div>
                    <p className="text-xl font-bold text-[#2C2C2C] font-serif">是否引进该项目？</p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <button className="px-6 py-3 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors">
                      ❌ 拒绝
                    </button>
                    <button className="px-6 py-3 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors">
                      ✅ 同意
                    </button>
                  </div>

                  {/* 底部指标 */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-2xl mb-1">💰</div>
                      <div className="text-xs text-[#2C2C2C]/70">经济</div>
                    </div>
                    <div>
                      <div className="text-2xl mb-1">👥</div>
                      <div className="text-xs text-[#2C2C2C]/70">民生</div>
                    </div>
                    <div>
                      <div className="text-2xl mb-1">🌲</div>
                      <div className="text-xs text-[#2C2C2C]/70">生态</div>
                    </div>
                    <div>
                      <div className="text-2xl mb-1">🚩</div>
                      <div className="text-xs text-[#2C2C2C]/70">乡风</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧说明 */}
            <div>
              <h3 className="text-3xl font-bold text-[#2C2C2C] mb-4 font-serif">非线性叙事</h3>
              <p className="text-lg text-[#2C2C2C]/80 font-sans">
                每一次选择都会影响后续剧情发展，体验真实的决策压力。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Crisis Section - Level 3 (Dark) */}
      <section className="bg-[#2C2C2C] text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* 左侧 */}
            <div>
              <div className="text-7xl mb-6">🚨</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">指标归零报警！</h2>
              <p className="text-xl mb-8 text-white/90 font-sans">
                触发独创"熔断保护机制"。
              </p>
            </div>

            {/* 右侧对话模拟 - 改进的聊天气泡样式 */}
            <div className="space-y-4">
              {/* NPC 消息 - 左对齐，白底黑字 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">👨‍🌾</span>
                  <div className="flex-1">
                    <p className="font-bold text-[#2C2C2C] mb-1 font-serif">村民</p>
                    <p className="text-[#2C2C2C]/90 font-sans">"书记！俺鱼塘的鱼全翻白肚了！"</p>
                  </div>
                </div>
              </div>

              {/* Player 消息 - 右对齐，绿底白字 */}
              <div className="bg-green-600 rounded-2xl p-6 shadow-lg ml-auto max-w-[85%]">
                <div className="flex items-start gap-4">
                  <div className="flex-1 text-right">
                    <p className="font-bold text-white mb-1 font-serif">您</p>
                    <p className="text-white/90 font-sans">"大爷您先别急..."</p>
                  </div>
                  <span className="text-4xl">👨‍💼</span>
                </div>
              </div>

              {/* AI 分析条 */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🤖</span>
                  <div className="flex-1">
                    <p className="font-bold mb-2 font-serif">AI 判官分析</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm font-sans">共情度</span>
                        <span className="text-green-400 font-bold">高</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <div className="flex gap-4 text-sm mt-3">
                        <span className="text-red-400">❌ 打官腔? 扣分!</span>
                        <span className="text-green-400">✅ 真诚? 怒气消解。</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Report Section - Level 2 (White) */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-6 font-serif">
              📝 不仅仅是游戏，更是一份深度体检报告
            </h2>
            <p className="text-xl text-[#2C2C2C]/80 max-w-3xl mx-auto leading-relaxed font-sans">
              AI 会精准识别您的关键失误，并智能匹配 22 万字调研库中的真实案例。（如：自动推送"两山理论在安吉的实践"）。
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#F7F4ED] rounded-xl p-8 shadow-lg border border-[#2C2C2C]/10">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4 font-serif">治理画像</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#2C2C2C]/70 font-sans">激进发展型</span>
                    <span className="font-bold text-[#B94047]">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-[#B94047] h-3 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F7F4ED] rounded-xl p-8 shadow-lg border border-[#2C2C2C]/10">
              <div className="text-5xl mb-4">📉</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4 font-serif">关键复盘</h3>
              <p className="text-[#2C2C2C]/70 font-sans">
                案例映射：自动匹配相关真实案例，提供学习参考。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions & Ecosystem Section - Level 1 (Paper) */}
      <section className="bg-[#F7F4ED] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] text-center mb-16 font-serif">
            解决方案与生态
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-8 border border-[#2C2C2C]/10 shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4 font-serif">To B/G 定制引擎</h3>
              <p className="text-[#2C2C2C]/80 leading-relaxed font-sans">
                专为培训打造的"中央厨房"。上传 PDF → AI 解析 → 生成剧本。
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-8 border border-[#2C2C2C]/10 shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4 font-serif">深度仿真配置</h3>
              <p className="text-[#2C2C2C]/80 leading-relaxed font-sans">
                自定义 NPC 性格 / 考核 KPI / 判分权重。
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-8 border border-[#2C2C2C]/10 shadow-lg hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl mb-4">🌊</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4 font-serif">活水化智慧大脑</h3>
              <p className="text-[#2C2C2C]/80 leading-relaxed font-sans">
                <strong>22万字</strong> 核心调研库。RAG 检索增强。UGC 众筹共建。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Level 3 (Darker) */}
      <footer className="bg-[#1F1F1F] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-8">
            <p className="text-lg font-sans">
              <span className="text-2xl">👥</span> 主创团队：俞乐怡 · 徐靖豫 · 郭芷岑
            </p>
            <p className="text-lg text-white/80 font-sans">
              <span className="text-2xl">🎓</span> 项目归属：© 2025 山河答卷项目组 | 武汉大学新闻与传播学院
            </p>
            <p className="text-lg text-white/80 font-sans">
              <span className="text-2xl">📧</span> 联系我们：2209523089@qq.com
            </p>
          </div>
        </div>
      </footer>

      {/* 登录模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />
    </div>
  );
}

export default App;
