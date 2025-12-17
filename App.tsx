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
import AIAgent from './components/ai/AIAgent';
// @ts-ignore
import LoginModal from './components/auth/LoginModal';
// @ts-ignore
import AboutPage from './components/about/AboutPage';
// @ts-ignore
import ProfilePage from './components/profile/ProfilePage';
import { GameConfig } from './types';
import { EDITOR_SAMPLE_CONFIG } from './constants';

type AppMode = 'landing' | 'editor' | 'game' | 'game-preview' | 'library' | 'ugc' | 'admin' | 'admin-review' | 'ai-agent' | 'about' | 'profile';

interface User {
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
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
  const handleShowAdmin = () => setMode('admin');
  const handleShowAdminReview = () => setMode('admin-review');
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
    
    const userData: User = { 
      email, 
      name: email.split('@')[0],
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
    return (
      <AdminCaseUpload 
        onBack={() => setMode('landing')} 
        onReviewMode={() => setMode('admin-review')}
      />
    );
  }

  if (mode === 'admin-review') {
    return (
      <AdminReview 
        onBack={() => setMode('admin')} 
        onUploadMode={() => setMode('admin')}
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

      <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-ink mb-6 tracking-tight font-serif">
                基层治理的<br/>
                <span className="text-primary-red">
                  沉浸式演练场
                </span>
              </h1>
              <p className="text-xl text-ink-medium leading-relaxed max-w-2xl mx-auto mb-8">
                在这里，你不仅是观察者，更是决策者。<br/>
                面对两难抉择，平衡经济、民生、生态与党建。<br/>
                体验真实基层工作的复杂与温度。
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button 
                  onClick={handleLaunchGame}
                  className="px-8 py-4 bg-primary-red text-white rounded-md text-lg font-bold shadow-paper-lg hover:bg-[#A0353C] hover:shadow-paper transition-all active:scale-95 transform"
                >
                  🎮 进入实战演练
                </button>
                <button 
                  onClick={handleLaunchEditor}
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-ink border-2 border-ink-light rounded-md text-lg font-bold shadow-paper hover:border-primary-red hover:bg-primary-red/5 transition-all active:scale-95 transform"
                >
                  🛠️ 创作者工坊
                </button>
              </div>

          <div className="flex items-center justify-center gap-8 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span>已收录 <strong className="text-red-800">1,240</strong> 个真实案例</span>
            </div>
            <div className="w-px h-6 bg-stone-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <span>合作机构 <strong className="text-red-800">56</strong> 家</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass rounded-md shadow-paper p-6 hover:shadow-paper-lg transition-all border border-ink-light">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-ink mb-2 font-serif">资料库</h3>
            <p className="text-ink-medium text-sm mb-4">
              丰富的政策法规和典型案例，为学习提供参考
            </p>
            <button
              onClick={handleShowLibrary}
              className="text-primary-red font-bold text-sm hover:underline"
            >
              查看资料库 →
            </button>
          </div>

          <div className="glass rounded-md shadow-paper p-6 hover:shadow-paper-lg transition-all border border-ink-light">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-ink mb-2 font-serif">UGC投稿</h3>
            <p className="text-ink-medium text-sm mb-4">
              分享您的真实经验，共同建设基层治理知识库
            </p>
            <button
              onClick={handleShowUGC}
              className="text-primary-red font-bold text-sm hover:underline"
            >
              立即投稿 →
            </button>
          </div>

          <div className="glass rounded-md shadow-paper p-6 hover:shadow-paper-lg transition-all border border-ink-light">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-ink mb-2 font-serif">AI智能体</h3>
            <p className="text-ink-medium text-sm mb-4">
              基于RAG检索的AI助手，基于案例库提供专业咨询
            </p>
            <button
              onClick={handleShowAIAgent}
              className="text-primary-red font-bold text-sm hover:underline"
            >
              开始对话 →
            </button>
          </div>
        </div>

            {/* Stats Section */}
            <div className="bg-primary-red rounded-md p-8 text-white text-center shadow-paper-lg">
              <h2 className="text-2xl font-bold mb-6 font-serif">平台数据</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold mb-2 font-serif">1,240+</div>
                  <div className="text-white/80 text-sm">真实案例</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 font-serif">56</div>
                  <div className="text-white/80 text-sm">合作机构</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 font-serif">5,000+</div>
                  <div className="text-white/80 text-sm">学员使用</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2 font-serif">98%</div>
                  <div className="text-white/80 text-sm">满意度</div>
                </div>
              </div>
            </div>
          </main>

          <footer className="bg-ink text-white/60 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-6 text-center text-sm">
              <p>© 2024 山河答卷 - 基层治理沉浸式策略学习平台</p>
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
