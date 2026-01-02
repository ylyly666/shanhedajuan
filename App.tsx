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

// 增强版像素风格背景组件 - 增加中间区域方块
const PixelBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 增强的网格背景 - 更明显 */}
      <div className="absolute inset-0 opacity-[0.12]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(to right, #B94047 2px, transparent 2px),
                              linear-gradient(to bottom, #B94047 2px, transparent 2px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      
      {/* 主要主题色方块 - 带轻微浮动动画 */}
      <div className="absolute top-10 left-10 w-28 h-28 bg-[#B94047]/20 border-4 border-[#B94047]/40 shadow-lg animate-float-slow"></div>
      <div className="absolute top-12 right-12 w-32 h-32 bg-[#2C2C2C]/20 border-4 border-[#2C2C2C]/40 shadow-lg animate-float-medium"></div>
      <div className="absolute bottom-10 left-12 w-24 h-24 bg-[#B94047]/20 border-4 border-[#B94047]/40 shadow-lg animate-float-slow animation-delay-500"></div>
      <div className="absolute bottom-12 right-10 w-28 h-28 bg-[#2C2C2C]/20 border-4 border-[#2C2C2C]/40 shadow-lg animate-float-medium animation-delay-1000"></div>
      
      {/* === 新增：中间区域的核心方块 === */}
      
      {/* 中心区域左上区块 */}
      <div className="absolute top-1/3 left-1/3 w-18 h-18 bg-[#B94047]/15 border-3 border-[#B94047]/25 animate-float-slow animation-delay-300"></div>
      <div className="absolute top-2/5 left-2/5 w-12 h-12 bg-[#2C2C2C]/10 border-2 border-[#2C2C2C]/20 animate-float-medium animation-delay-700"></div>
      
      {/* 中心区域右上区块 */}
      <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-[#2C2C2C]/15 border-3 border-[#2C2C2C]/25 animate-float-slow animation-delay-400"></div>
      <div className="absolute top-2/5 right-2/5 w-14 h-14 bg-[#B94047]/10 border-2 border-[#B94047]/20 animate-float-medium animation-delay-800"></div>
      
      {/* 中心区域左下区块 */}
      <div className="absolute bottom-1/3 left-1/3 w-14 h-14 bg-[#2C2C2C]/15 border-3 border-[#2C2C2C]/25 animate-float-slow animation-delay-500"></div>
      <div className="absolute bottom-2/5 left-2/5 w-10 h-10 bg-[#B94047]/10 border-2 border-[#B94047]/20 animate-float-medium animation-delay-900"></div>
      
      {/* 中心区域右下区块 */}
      <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-[#B94047]/15 border-3 border-[#B94047]/25 animate-float-slow animation-delay-600"></div>
      <div className="absolute bottom-2/5 right-2/5 w-8 h-8 bg-[#2C2C2C]/10 border-2 border-[#2C2C2C]/20 animate-float-medium animation-delay-1000"></div>
      
      {/* 中心区域上方 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-22 h-22 bg-[#B94047]/10 border-3 border-[#B94047]/30 rotate-12 animate-float-slow animation-delay-200"></div>
      <div className="absolute top-3/8 left-2/5 w-16 h-16 bg-[#2C2C2C]/10 border-2 border-[#2C2C2C]/25 rotate-6 animate-float-medium animation-delay-600"></div>
      <div className="absolute top-3/8 right-2/5 w-16 h-16 bg-[#B94047]/10 border-2 border-[#B94047]/25 rotate-6 animate-float-medium animation-delay-1100"></div>
      
      {/* 中心区域下方 */}
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-18 h-18 bg-[#2C2C2C]/10 border-3 border-[#2C2C2C]/30 -rotate-12 animate-float-slow animation-delay-300"></div>
      <div className="absolute bottom-3/8 left-2/5 w-14 h-14 bg-[#B94047]/10 border-2 border-[#B94047]/25 -rotate-6 animate-float-medium animation-delay-700"></div>
      <div className="absolute bottom-3/8 right-2/5 w-14 h-14 bg-[#2C2C2C]/10 border-2 border-[#2C2C2C]/25 -rotate-6 animate-float-medium animation-delay-1200"></div>
      
      {/* 中心区域左侧 */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-20 h-20 bg-[#B94047]/12 border-3 border-[#B94047]/28 animate-spin-slow animation-delay-500"></div>
      <div className="absolute top-5/12 left-3/8 w-10 h-10 bg-[#2C2C2C]/8 border-1 border-[#2C2C2C]/20 animate-float-fast animation-delay-800"></div>
      <div className="absolute top-7/12 left-3/8 w-10 h-10 bg-[#B94047]/8 border-1 border-[#B94047]/20 animate-float-fast animation-delay-1300"></div>
      
      {/* 中心区域右侧 */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-16 h-16 bg-[#2C2C2C]/12 border-3 border-[#2C2C2C]/28 animate-spin-slow animation-delay-1000"></div>
      <div className="absolute top-5/12 right-3/8 w-8 h-8 bg-[#B94047]/8 border-1 border-[#B94047]/20 animate-float-fast animation-delay-300"></div>
      <div className="absolute top-7/12 right-3/8 w-8 h-8 bg-[#2C2C2C]/8 border-1 border-[#2C2C2C]/20 animate-float-fast animation-delay-1100"></div>
      
      {/* 中间区域的小方块 - 带旋转动画 */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-20 h-20 bg-[#B94047]/15 border-3 border-[#B94047]/25 rotate-45 animate-spin-slow"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-20 h-20 bg-[#2C2C2C]/15 border-3 border-[#2C2C2C]/25 rotate-45 animate-spin-slow animation-delay-1500"></div>
      
      {/* 更多随机分布的装饰方块 */}
      {/* 第一组随机方块 */}
      <div className="absolute top-24 left-32 w-16 h-16 bg-[#B94047]/10 border-2 border-[#B94047]/25 animate-float-slow animation-delay-200"></div>
      <div className="absolute top-36 right-36 w-14 h-14 bg-[#2C2C2C]/10 border-2 border-[#2C2C2C]/25 animate-float-medium animation-delay-400"></div>
      <div className="absolute bottom-28 left-36 w-12 h-12 bg-[#B94047]/10 border-2 border-[#B94047]/25 animate-float-slow animation-delay-600"></div>
      <div className="absolute bottom-32 right-28 w-18 h-18 bg-[#2C2C2C]/10 border-2 border-[#2C2C2C]/25 animate-float-medium animation-delay-800"></div>
      
      {/* 第二组随机方块 */}
      <div className="absolute top-16 left-48 w-10 h-10 bg-[#B94047]/15 border-2 border-[#B94047]/30 animate-pulse"></div>
      <div className="absolute top-48 left-16 w-12 h-12 bg-[#2C2C2C]/15 border-2 border-[#2C2C2C]/30 animate-pulse animation-delay-300"></div>
      <div className="absolute bottom-16 right-48 w-14 h-14 bg-[#B94047]/15 border-2 border-[#B94047]/30 animate-pulse animation-delay-600"></div>
      <div className="absolute bottom-48 right-16 w-16 h-16 bg-[#2C2C2C]/15 border-2 border-[#2C2C2C]/30 animate-pulse animation-delay-900"></div>
      
      {/* 第三组微小方块 - 分布更广 */}
      <div className="absolute top-8 left-1/3 w-6 h-6 bg-[#B94047]/20 border border-[#B94047]/30 animate-float-fast"></div>
      <div className="absolute top-1/4 right-24 w-8 h-8 bg-[#2C2C2C]/20 border border-[#2C2C2C]/30 animate-float-fast animation-delay-100"></div>
      <div className="absolute bottom-1/4 left-24 w-7 h-7 bg-[#B94047]/20 border border-[#B94047]/30 animate-float-fast animation-delay-200"></div>
      <div className="absolute bottom-8 right-1/3 w-5 h-5 bg-[#2C2C2C]/20 border border-[#2C2C2C]/30 animate-float-fast animation-delay-300"></div>
      
      {/* 第四组方块 - 靠近中间边缘 */}
      <div className="absolute top-40 left-20 w-9 h-9 bg-[#B94047]/10 border-1 border-[#B94047]/20 animate-float-slow animation-delay-700"></div>
      <div className="absolute top-20 right-40 w-11 h-11 bg-[#2C2C2C]/10 border-1 border-[#2C2C2C]/20 animate-float-slow animation-delay-900"></div>
      <div className="absolute bottom-40 left-40 w-8 h-8 bg-[#B94047]/10 border-1 border-[#B94047]/20 animate-float-slow animation-delay-1100"></div>
      <div className="absolute bottom-20 right-20 w-10 h-10 bg-[#2C2C2C]/10 border-1 border-[#2C2C2C]/20 animate-float-slow animation-delay-1300"></div>
      
      {/* === 新增：中心区域的微小装饰方块 === */}
      <div className="absolute top-1/2 left-2/5 w-6 h-6 bg-[#B94047]/15 border border-[#B94047]/25 animate-float-fast animation-delay-100"></div>
      <div className="absolute top-1/2 right-2/5 w-6 h-6 bg-[#2C2C2C]/15 border border-[#2C2C2C]/25 animate-float-fast animation-delay-300"></div>
      <div className="absolute top-3/5 left-2/5 w-5 h-5 bg-[#2C2C2C]/12 border border-[#2C2C2C]/20 animate-float-fast animation-delay-500"></div>
      <div className="absolute top-3/5 right-2/5 w-5 h-5 bg-[#B94047]/12 border border-[#B94047]/20 animate-float-fast animation-delay-700"></div>
      <div className="absolute top-2/5 left-2/5 w-4 h-4 bg-[#B94047]/10 border border-[#B94047]/15 animate-pulse animation-delay-200"></div>
      <div className="absolute top-2/5 right-2/5 w-4 h-4 bg-[#2C2C2C]/10 border border-[#2C2C2C]/15 animate-pulse animation-delay-400"></div>
      
      {/* 增强的对角线装饰 - 带动画 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-1.5 bg-gradient-to-r from-transparent via-[#B94047]/40 to-transparent rotate-45 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-1.5 bg-gradient-to-r from-transparent via-[#2C2C2C]/40 to-transparent -rotate-45 animate-pulse animation-delay-500"></div>
      
      {/* 水平装饰线 - 带动画 */}
      <div className="absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B94047]/30 to-transparent animate-pulse animation-delay-200"></div>
      <div className="absolute bottom-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2C2C2C]/30 to-transparent animate-pulse animation-delay-700"></div>
      
      {/* 垂直装饰线 - 新增 */}
      <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#B94047]/25 to-transparent animate-pulse animation-delay-300"></div>
      <div className="absolute right-1/3 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#2C2C2C]/25 to-transparent animate-pulse animation-delay-800"></div>
      
      {/* 像素点装饰 - 更多更明显，带动画 */}
      <div className="absolute top-32 left-32 w-3 h-3 bg-[#B94047]/40 animate-bounce"></div>
      <div className="absolute top-40 right-40 w-3 h-3 bg-[#B94047]/40 animate-bounce animation-delay-200"></div>
      <div className="absolute bottom-32 left-40 w-3 h-3 bg-[#2C2C2C]/40 animate-bounce animation-delay-400"></div>
      <div className="absolute bottom-40 right-32 w-3 h-3 bg-[#2C2C2C]/40 animate-bounce animation-delay-600"></div>
      
      {/* 中心区域的像素点 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#B94047]/30 animate-ping"></div>
      <div className="absolute top-1/2 left-45% w-1.5 h-1.5 bg-[#2C2C2C]/25 animate-pulse animation-delay-100"></div>
      <div className="absolute top-1/2 right-45% w-1.5 h-1.5 bg-[#B94047]/25 animate-pulse animation-delay-300"></div>
      
      <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 bg-[#B94047]/30 animate-ping"></div>
      <div className="absolute top-2/3 right-2/3 w-2.5 h-2.5 bg-[#B94047]/30 animate-ping animation-delay-300"></div>
      <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-[#2C2C2C]/30 animate-ping animation-delay-600"></div>
      <div className="absolute bottom-2/3 right-1/3 w-2.5 h-2.5 bg-[#2C2C2C]/30 animate-ping animation-delay-900"></div>
      
      {/* 网格交叉点装饰 */}
      <div className="absolute top-16 left-16 w-1.5 h-1.5 bg-[#B94047]/50 rotate-45 animate-pulse"></div>
      <div className="absolute top-16 right-16 w-1.5 h-1.5 bg-[#B94047]/50 rotate-45 animate-pulse animation-delay-250"></div>
      <div className="absolute bottom-16 left-16 w-1.5 h-1.5 bg-[#2C2C2C]/50 rotate-45 animate-pulse animation-delay-500"></div>
      <div className="absolute bottom-16 right-16 w-1.5 h-1.5 bg-[#2C2C2C]/50 rotate-45 animate-pulse animation-delay-750"></div>
      
      {/* 增强的渐变遮罩 - 中间更干净，边缘保留装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7F4ED]/70 via-[#F7F4ED]/50 to-[#F7F4ED]/70"></div>
      
      {/* 中心聚焦遮罩 - 调整为更透明，让中间方块更可见 */}
      <div className="absolute inset-0 bg-radial-gradient(circle at center, transparent 45%, rgba(247, 244, 237, 0.7) 85%)"></div>
      
      {/* 中心保护层 - 确保文字区域完全干净 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-radial-gradient(circle, transparent 30%, rgba(247, 244, 237, 0.9) 70%)"></div>
    </div>
  );
};

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

  // 登录处理（使用 Supabase Auth）
  const handleLogin = async (email: string, password: string) => {
    const { getCurrentUser, getSession } = await import('@/utils/authHelper');
    
    // 获取当前用户信息（LoginModal已经处理了登录，这里只需要获取用户信息）
    const authUser = await getCurrentUser();
    const session = await getSession();
    
    if (!authUser || !session) {
      throw new Error('登录失败，请检查邮箱和密码');
    }
    
    // 判断是否为管理员（邮箱包含 "admin" 关键字）
    const isAdminUser = email.toLowerCase().includes('admin') || email.toLowerCase().includes('@admin');
    
    const userData: User = { 
      email: authUser.email || email, 
      name: email.split('@')[0],
      role: isAdminUser ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    setUser(userData);
    // 不再使用localStorage存储，Supabase会自动管理session
  };

  // 注册处理（使用 Supabase Auth）
  const handleSignUp = async (email: string, password: string) => {
    // 注册逻辑已经在LoginModal中处理，这里只需要获取用户信息
    const { getCurrentUser, getSession } = await import('@/utils/authHelper');
    
    // 等待一下，确保注册完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const authUser = await getCurrentUser();
    const session = await getSession();
    
    if (!authUser || !session) {
      // 可能需要邮箱验证，这里不抛出错误，让用户知道需要验证
      return;
    }
    
    // 判断是否为管理员
    const isAdminUser = email.toLowerCase().includes('admin') || email.toLowerCase().includes('@admin');
    
    const userData: User = { 
      email: authUser.email || email, 
      name: email.split('@')[0],
      role: isAdminUser ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    setUser(userData);
  };

  // 更新用户信息
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Supabase会自动管理用户信息，这里只更新本地状态
  };

  // 登出处理（使用 Supabase Auth）
  const handleLogout = async () => {
    const { signOut } = await import('@/utils/authHelper');
    await signOut();
    setUser(null);
  };

  // 初始化：从Supabase恢复登录状态
  React.useEffect(() => {
    const initAuth = async () => {
      const { getCurrentUser, getSession } = await import('@/utils/authHelper');
      const { supabase } = await import('@/utils/supabaseClient');
      
      // 检查是否有session
      const session = await getSession();
      if (session) {
        const authUser = await getCurrentUser();
        if (authUser && authUser.email) {
          // 判断是否为管理员
          const isAdminUser = authUser.email.toLowerCase().includes('admin') || 
                             authUser.email.toLowerCase().includes('@admin');
          
          const userData: User = { 
            email: authUser.email, 
            name: authUser.email.split('@')[0],
            role: isAdminUser ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };
          setUser(userData);
        }
      }
      
      // 监听认证状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          // 用户登录或session恢复
          const authUser = await getCurrentUser();
          if (authUser && authUser.email) {
            const isAdminUser = authUser.email.toLowerCase().includes('admin') || 
                               authUser.email.toLowerCase().includes('@admin');
            
            const userData: User = { 
              email: authUser.email, 
              name: authUser.email.split('@')[0],
              role: isAdminUser ? 'admin' : 'user',
              createdAt: new Date().toISOString()
            };
            setUser(userData);
          }
        } else {
          // 用户登出
          setUser(null);
        }
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
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
            <img 
    src="/images/logo.png"  // public目录下的路径
    alt="山河答卷Logo" 
    className="h-9 w-9 object-contain"
            />
            <span>山河答卷</span>
            <span className="text-sm font-normal text-black">-基层治理沉浸式平台</span>
            </button>

            {/* 导航链接 */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleLaunchGame}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all"
              >
                实战演练
              </button>
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
<main className="relative min-h-[80vh] flex items-center justify-center bg-[#F7F4ED]">
  {/* 简洁像素背景 */}
  <PixelBackground />
  
  <section className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative z-10 w-full">
    <div className="text-center">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2C2C2C] mb-6 tracking-tight font-serif">
        基层治理的<br className="hidden sm:block" />
        <span className="text-[#B94047] block mt-2">
          沉浸式演练场
        </span>
      </h1>
      
      <p className="text-xl md:text-2xl text-[#2C2C2C]/80 leading-relaxed max-w-3xl mx-auto mb-10 md:mb-12 font-sans">
        在这里，你不仅是观察者，更是决策者。
        <br className="hidden md:block" />
        面对两难抉择，平衡经济、民生、生态与乡风。
        <br className="hidden md:block" />
        体验真实基层工作的复杂与温度。
      </p>

      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12">
        <button 
          onClick={handleLaunchGame}
          className="px-8 py-4 bg-[#B94047] text-white rounded-lg text-lg font-bold shadow-lg hover:bg-[#A0353C] hover:shadow-xl transition-all active:scale-95 transform"
        >
          🎮 进入实战演练
        </button>
        <button 
          onClick={handleLaunchEditor}
          className="px-8 py-4 bg-white text-[#2C2C2C] border-2 border-[#2C2C2C]/10 rounded-lg text-lg font-bold shadow-md hover:border-[#B94047] hover:bg-[#B94047]/5 transition-all active:scale-95 transform"
        >
          🛠️ 创作者工坊
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm md:text-base text-[#2C2C2C]/70">
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg">
          <span className="text-2xl">📊</span>
          <span>已收录 <strong className="text-[#B94047]">380+</strong> 个真实案例</span>
        </div>
        <div className="hidden sm:block w-px h-6 bg-[#2C2C2C]/20"></div>
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg">
          <span className="text-2xl">🏢</span>
          <span>调研笔记 <strong className="text-[#B94047]">22万</strong> 字</span>
        </div>
      </div>
    </div>

    {/* 功能入口 Bento Grid */}
    <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <button
        onClick={handleShowLibrary}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all border border-[#2C2C2C]/10 hover:-translate-y-1 transform group"
      >
        <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform">📚</div>
        <h3 className="text-xl md:text-2xl font-bold text-[#2C2C2C] mb-3 font-serif">资料库</h3>
        <p className="text-[#2C2C2C]/70 text-sm md:text-base mb-4 font-sans">
          丰富的政策法规和典型案例，为学习提供参考
        </p>
        <span className="text-[#B94047] font-bold text-sm md:text-base inline-flex items-center gap-2">
          查看资料库 <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </button>

      <button
        onClick={handleShowUGC}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all border border-[#2C2C2C]/10 hover:-translate-y-1 transform group"
      >
        <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform">📝</div>
        <h3 className="text-xl md:text-2xl font-bold text-[#2C2C2C] mb-3 font-serif">UGC投稿</h3>
        <p className="text-[#2C2C2C]/70 text-sm md:text-base mb-4 font-sans">
          分享您的真实经验，共同建设基层治理知识库
        </p>
        <span className="text-[#B94047] font-bold text-sm md:text-base inline-flex items-center gap-2">
          立即投稿 <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </button>

      <button
        onClick={handleShowAIAgent}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all border border-[#2C2C2C]/10 hover:-translate-y-1 transform group"
      >
        <div className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
        <h3 className="text-xl md:text-2xl font-bold text-[#2C2C2C] mb-3 font-serif">AI智能体</h3>
        <p className="text-[#2C2C2C]/70 text-sm md:text-base mb-4 font-sans">
          基于RAG检索的AI助手，基于案例库提供专业咨询
        </p>
        <span className="text-[#B94047] font-bold text-sm md:text-base inline-flex items-center gap-2">
          开始对话 <span className="group-hover:translate-x-1 transition-transform">→</span>
        </span>
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

       {/* 真实人物案例 Section */}
<section className="bg-white py-20 md:py-32">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      {/* 左侧文字内容 */}
      <div>
        <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-6 font-serif">
          📚 真实人物案例
        </h2>
        <p className="text-lg md:text-xl text-[#2C2C2C]/80 leading-relaxed mb-8 font-sans">
          每一个决策背后，都是真实的基层故事。
          <br />
          我们的游戏脚本源于全国各地430+个真实案例，
          <br />
          人物性格鲜明，情感丰富，让演练不再纸上谈兵。
        </p>
        
        <div className="flex items-center gap-4 text-sm text-[#2C2C2C]/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#B94047]/10 flex items-center justify-center">
              <span className="text-[#B94047] text-lg">📖</span>
            </div>
            <span>22万字真实调研</span>
          </div>
          <div className="w-px h-6 bg-[#2C2C2C]/20"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#B94047]/10 flex items-center justify-center">
              <span className="text-[#B94047] text-lg">🗣️</span>
            </div>
            <span>1对1深度访谈</span>
          </div>
        </div>
      </div>
      
      {/* 右侧三列滚动展示 */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#F7F4ED] to-[#F7F4ED]/50 p-6 border border-[#2C2C2C]/10">
        
        {/* 三列容器 */}
        <div className="flex justify-between gap-6 h-full">
          
          {/* 第一列 - 展示人物1-7，滚动最慢 */}
          <div className="flex-1">
            <div className="relative h-full overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent z-10"></div>
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white/70 to-transparent z-10"></div>
              
              <div className="animate-scroll-slow space-y-6 pt-4">
                {/* 第一组：人物1-7 */}
                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                  <div 
                    key={`col1-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border-4 border-white shadow-lg bg-white">
                      <img
                        src={`/images/avatars/avatar${index}.png`}
                        alt={`真实案例 ${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold">
                              ${index}
                            </div>
                          `;
                        }}
                      />
                      {/* 像素边框效果 */}
                      <div className="absolute inset-0 border border-black/10"></div>
                      <div className="absolute inset-1 border border-white/50"></div>
                    </div>
                  </div>
                ))}
                
                {/* 重复一遍实现无缝滚动 */}
                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                  <div 
                    key={`col1-duplicate-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border-4 border-white shadow-lg bg-white">
                      <img
                        src={`/images/avatars/avatar${index}.png`}
                        alt={`真实案例 ${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 border border-black/10"></div>
                      <div className="absolute inset-1 border border-white/50"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 第二列 - 展示人物8-14，滚动中等速度 */}
          <div className="flex-1 mt-12">
            <div className="relative h-full overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent z-10"></div>
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white/70 to-transparent z-10"></div>
              
              <div className="animate-scroll-medium space-y-6 pt-4">
                {/* 第二组：人物8-14 */}
                {[8, 9, 10, 11, 12, 13, 14].map((index) => (
                  <div 
                    key={`col2-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border-4 border-white shadow-lg bg-white">
                      <img
                        src={`/images/avatars/avatar${index}.png`}
                        alt={`真实案例 ${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold">
                              ${index}
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 border border-black/10"></div>
                      <div className="absolute inset-1 border border-white/50"></div>
                    </div>
                  </div>
                ))}
                
                {/* 重复一遍实现无缝滚动 */}
                {[8, 9, 10, 11, 12, 13, 14].map((index) => (
                  <div 
                    key={`col2-duplicate-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border-4 border-white shadow-lg bg-white">
                      <img
                        src={`/images/avatars/avatar${index}.png`}
                        alt={`真实案例 ${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 border border-black/10"></div>
                      <div className="absolute inset-1 border border-white/50"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 第三列 - 展示人物15-21，滚动最快 */}
          <div className="flex-1 mt-24">
            <div className="relative h-full overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent z-10"></div>
              <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white/70 to-transparent z-10"></div>
              
              <div className="animate-scroll-fast space-y-6 pt-4">
                {/* 第三组：人物15-21 */}
                {[15, 16, 17, 18, 19, 20, 21].map((index) => (
                  <div 
                    key={`col3-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border-4 border-white shadow-lg bg-white">
                      <img
                        src={`/images/avatars/avatar${index}.png`}
                        alt={`真实案例 ${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-bold">
                              ${index}
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 border border-black/10"></div>
                      <div className="absolute inset-1 border border-white/50"></div>
                    </div>
                  </div>
                ))}
                
                {/* 重复一遍实现无缝滚动 */}
                {[15, 16, 17, 18, 19, 20, 21].map((index) => (
                  <div 
                    key={`col3-duplicate-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-lg border-4 border-white shadow-lg bg-white">
                      <img
                        src={`/images/avatars/avatar${index}.png`}
                        alt={`真实案例 ${index}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 border border-black/10"></div>
                      <div className="absolute inset-1 border border-white/50"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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

            {/* 极简提示条 */}
      <div className="bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center gap-3 text-lg text-[#2C2C2C]">
            <span className="text-2xl">💡</span>
            <span>详细介绍可参阅</span>
            <button
              onClick={handleShowAbout}
              className="text-[#B94047] font-bold hover:text-[#A0353C] underline underline-offset-4 transition-colors text-xl"
            >
              关于界面
            </button>
          </div>
        </div>
      </div>
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
