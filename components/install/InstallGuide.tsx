import React, { useState, useEffect } from 'react';

interface InstallGuideProps {
  onBack: () => void;
  onEnterWeb?: () => void;
}

const InstallGuide: React.FC<InstallGuideProps> = ({ onBack, onEnterWeb }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 使用本地二维码图片
  // 在Vite中，public目录下的文件可以直接用绝对路径访问
  const qrCodeImageUrl = '/images/二维码.png';

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative overflow-hidden">
      {/* 水印背景 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute top-20 left-10 text-6xl font-bold text-[#2C2C2C] transform -rotate-12">
          AI 治理
        </div>
        <div className="absolute top-40 right-20 text-6xl font-bold text-[#2C2C2C] transform rotate-12">
          真实案例
        </div>
        <div className="absolute bottom-40 left-1/4 text-6xl font-bold text-[#2C2C2C] transform -rotate-6">
          沉浸体验
        </div>
      </div>

      {/* 网格背景 */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #B94047 1px, transparent 1px),
                          linear-gradient(to bottom, #B94047 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 内容区域 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* 返回按钮 */}
        <button
          onClick={onBack}
          className="mb-8 text-stone-600 hover:text-stone-800 transition-colors font-bold flex items-center gap-2"
        >
          <span>←</span>
          <span>返回</span>
        </button>

        {/* 主标题 */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C2C2C] mb-4 font-serif">
            山河答卷：基层治理沉浸式策略平台
          </h1>
          <p className="text-lg md:text-xl text-[#2C2C2C]/80 max-w-3xl mx-auto leading-relaxed">
            平衡经济、民生、生态与乡风，在两难抉择中书写你的驻村答卷。
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-8 md:gap-12`}>
          {/* 左侧：二维码和网页版入口 */}
          {!isMobile && (
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-200 w-full max-w-sm">
                <div className="aspect-square bg-white rounded-xl border-2 border-stone-300 flex items-center justify-center mb-6 overflow-hidden p-4">
                  <img 
                    src={qrCodeImageUrl} 
                    alt="扫描二维码访问 https://shanhedajuan.netlify.app/" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error('二维码图片加载失败:', qrCodeImageUrl);
                      // 如果加载失败，显示占位符
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `
                          <div class="text-center text-stone-400">
                            <div class="text-6xl mb-2">📱</div>
                            <p class="text-sm">二维码加载中...</p>
                            <p class="text-xs mt-1">请访问: https://shanhedajuan.netlify.app/</p>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <button
                  onClick={onEnterWeb || onBack}
                  className="w-full py-4 bg-gradient-to-r from-[#B91C1C] to-[#A0353C] text-white font-bold rounded-xl hover:shadow-xl transition-all shadow-lg"
                  style={{ letterSpacing: '0.5px' }}
                >
                  立即进入网页版
                </button>
                <p className="text-xs text-stone-500 text-center mt-4">
                  PC 端访问建议缩放浏览器窗口以获得最佳视觉效果
                </p>
              </div>
            </div>
          )}

          {/* 移动端：网页版入口置顶 */}
          {isMobile && (
            <div className="mb-8">
              <button
                onClick={onEnterWeb || onBack}
                className="w-full py-4 bg-gradient-to-r from-[#B91C1C] to-[#A0353C] text-white font-bold rounded-xl hover:shadow-xl transition-all shadow-lg"
                style={{ letterSpacing: '0.5px' }}
              >
                立即进入网页版
              </button>
            </div>
          )}

          {/* 右侧：PWA安装指引 */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-6 font-serif">
              获取最佳沉浸体验 <span className="text-primary-red">(强烈建议)</span>
            </h2>

            {/* Tab切换 */}
            <div className="flex gap-2 mb-6 border-b border-stone-200">
              <button
                onClick={() => setActiveTab('ios')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'ios'
                    ? 'text-primary-red border-b-2 border-primary-red'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                iOS 苹果用户
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'android'
                    ? 'text-primary-red border-b-2 border-primary-red'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Android 安卓用户
              </button>
            </div>

            {/* iOS指引内容 */}
            <div
              className={`transition-all duration-300 ${
                activeTab === 'ios' ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ①
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      使用 <strong className="text-primary-red">Safari 浏览器</strong> 打开本站。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ②
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      点击底部工具栏中间的 <strong className="text-primary-red">"分享"</strong> 按钮（向上箭头的方框）。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ③
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      在弹出的菜单中下滑，找到并点击 <strong className="text-primary-red">"添加到主屏幕"</strong>。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ④
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      点击右上角的"添加"，<strong className="text-primary-red">[山河答卷]</strong> 图标即刻出现在你的桌面。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Android指引内容 */}
            <div
              className={`transition-all duration-300 ${
                activeTab === 'android' ? 'opacity-100 block' : 'opacity-0 hidden'
              }`}
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ①
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      使用 <strong className="text-primary-red">Chrome 或系统自带浏览器</strong> 打开本站。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ②
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      点击右上角或右下角的 <strong className="text-primary-red">"更多/菜单"</strong> 图标（通常是三个点）。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ③
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      选择 <strong className="text-primary-red">"安装应用"</strong> 或 <strong className="text-primary-red">"添加到主屏幕"</strong>。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-red/10 flex items-center justify-center text-primary-red font-bold text-lg">
                    ④
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2C2C2C] leading-relaxed">
                      确认后，即可从桌面一键开启演练。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;

