import React from 'react';

interface LandingPageProps {
  onLaunchGame: () => void;
  onLaunchEditor: () => void;
  onShowLibrary: () => void;
  onShowUGC: () => void;
  onShowAIAgent: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchGame,
  onLaunchEditor,
  onShowLibrary,
  onShowUGC,
  onShowAIAgent,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F4ED]">
      {/* Vision Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* 左侧文案 */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-6">
              🌏 打破时空限制，把"村口"搬进屏幕
            </h2>
            <p className="text-lg md:text-xl text-[#2C2C2C]/80 mb-8 leading-relaxed">
              《山河答卷》不仅是一款策略游戏，更是专为选调生、驻村干部打造的数字化练兵场。我们致力于解决传统培训中"理论脱离实践"的痛点。在这里，您是第一书记，整个村庄的命运，系于您的一念之间。
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-3xl">💼</span>
                <div>
                  <h3 className="font-bold text-[#2C2C2C] mb-1">沉浸式履职</h3>
                  <p className="text-[#2C2C2C]/70">直面真实村民诉求。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-3xl">🧠</span>
                <div>
                  <h3 className="font-bold text-[#2C2C2C] mb-1">系统化思维</h3>
                  <p className="text-[#2C2C2C]/70">在多方利益中寻找平衡。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚔️</span>
                <div>
                  <h3 className="font-bold text-[#2C2C2C] mb-1">实战化演练</h3>
                  <p className="text-[#2C2C2C]/70">低成本试错，高效率复盘。</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧视觉 */}
          <div className="flex items-center justify-center">
            <div className="text-8xl md:text-9xl space-x-4">
              <span>🏞️</span>
              <span>🔗</span>
              <span>📱</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gameplay Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* 左侧说明 */}
          <div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">极简决策</h3>
            <p className="text-lg text-[#2C2C2C]/80 mb-6">
              👈 左滑 / 👉 右滑，深度博弈。
            </p>
            <p className="text-[#2C2C2C]/70 mb-4">
              特色机制：模糊反馈系统。
            </p>
            <p className="text-[#2C2C2C]/70">
              <span className="text-2xl">🔀</span> 伏笔机制 & <span className="text-2xl">🎲</span> 随机挑战。
            </p>
          </div>

          {/* 中间卡片模拟 */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🏭</div>
                <p className="text-xl font-bold text-[#2C2C2C]">是否引进该项目？</p>
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

          {/* 右侧说明 */}
          <div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">非线性叙事</h3>
            <p className="text-lg text-[#2C2C2C]/80">
              每一次选择都会影响后续剧情发展，体验真实的决策压力。
            </p>
          </div>
        </div>
      </section>

      {/* AI Crisis Section */}
      <section className="bg-[#2C2C2C] text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* 左侧 */}
            <div>
              <div className="text-6xl mb-6">🚨</div>
              <h2 className="text-4xl font-bold mb-6">指标归零报警！</h2>
              <p className="text-xl mb-8 opacity-90">
                触发独创"熔断保护机制"。
              </p>
            </div>

            {/* 右侧对话模拟 */}
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-2">
                  <span className="text-3xl">👨‍🌾</span>
                  <div>
                    <p className="font-bold mb-1">村民</p>
                    <p className="opacity-90">"书记！俺鱼塘的鱼全翻白肚了！"</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-2">
                  <span className="text-3xl">👨‍💼</span>
                  <div>
                    <p className="font-bold mb-1">您</p>
                    <p className="opacity-90">"大爷您先别急..."</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-2">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <p className="font-bold mb-1">AI 判官</p>
                    <p className="opacity-90">
                      <span className="text-red-400">❌ 打官腔? 扣分!</span> | <span className="text-green-400">✅ 真诚? 怒气消解。</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Report Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-6">
            📝 不仅仅是游戏，更是一份深度体检报告
          </h2>
          <p className="text-xl text-[#2C2C2C]/80 max-w-3xl mx-auto leading-relaxed">
            AI 会精准识别您的关键失误，并智能匹配 22 万字调研库中的真实案例。（如：自动推送"两山理论在安吉的实践"）。
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-[#2C2C2C]/10">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">治理画像</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#2C2C2C]/70">激进发展型</span>
                  <span className="font-bold text-[#B94047]">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-[#B94047] h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-[#2C2C2C]/10">
            <div className="text-4xl mb-4">📉</div>
            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">关键复盘</h3>
            <p className="text-[#2C2C2C]/70">
              案例映射：自动匹配相关真实案例，提供学习参考。
            </p>
          </div>
        </div>
      </section>

      {/* Solutions & Ecosystem Section */}
      <section className="bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] text-center mb-16">
            解决方案与生态
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-[#F7F4ED] rounded-xl p-8 border border-[#2C2C2C]/10">
              <div className="text-5xl mb-4">🏗️</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">To B/G 定制引擎</h3>
              <p className="text-[#2C2C2C]/80 leading-relaxed">
                专为培训打造的"中央厨房"。上传 PDF → AI 解析 → 生成剧本。
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F7F4ED] rounded-xl p-8 border border-[#2C2C2C]/10">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">深度仿真配置</h3>
              <p className="text-[#2C2C2C]/80 leading-relaxed">
                自定义 NPC 性格 / 考核 KPI / 判分权重。
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F7F4ED] rounded-xl p-8 border border-[#2C2C2C]/10">
              <div className="text-5xl mb-4">🌊</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">活水化智慧大脑</h3>
              <p className="text-[#2C2C2C]/80 leading-relaxed">
                <strong>22万字</strong> 核心调研库。RAG 检索增强。UGC 众筹共建。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-4 mb-8">
            <p className="text-lg">
              <span className="text-2xl">👥</span> 主创团队：俞乐怡 · 徐靖豫 · 郭芷岑
            </p>
            <p className="text-lg opacity-90">
              <span className="text-2xl">🎓</span> 项目归属：© 2025 山河答卷项目组 | 武汉大学新闻与传播学院
            </p>
            <p className="text-lg opacity-90">
              <span className="text-2xl">📧</span> 联系我们：2209523089@qq.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

