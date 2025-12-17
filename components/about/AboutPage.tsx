import React from 'react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-2xl font-bold text-primary-red tracking-wider flex items-center gap-2 font-serif hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl">⛰️</span>
              <span>山河答卷</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 tracking-tight font-serif">
            关于<span className="text-primary-red">山河答卷</span>
          </h1>
          <p className="text-xl text-ink-medium leading-relaxed">
            基层治理的沉浸式演练场
          </p>
        </div>

        <div className="space-y-8 mb-12">
          <section className="glass rounded-lg shadow-paper p-8 border border-ink-light">
            <h2 className="text-2xl font-bold text-ink mb-4 font-serif">项目简介</h2>
            <p className="text-ink-medium leading-relaxed mb-4">
              《山河答卷》是一款专为选调生与基层干部培训设计的AI原生策略卡牌叙事游戏与可视化编辑器。平台通过沉浸式交互体验，帮助学员在虚拟环境中面对真实基层治理中的两难抉择，平衡经济、民生、生态与党建等多重因素。
            </p>
            <p className="text-ink-medium leading-relaxed">
              在这里，你不仅是观察者，更是决策者。通过决策卡牌游戏的形式，体验真实基层工作的复杂与温度，培养综合决策能力。
            </p>
          </section>

          <section className="glass rounded-lg shadow-paper p-8 border border-ink-light">
            <h2 className="text-2xl font-bold text-ink mb-4 font-serif">核心功能</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <h3 className="font-bold text-ink mb-1">实战演练</h3>
                  <p className="text-sm text-ink-medium">
                    基于真实案例的决策卡牌游戏，体验基层治理的复杂情境
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🛠️</span>
                <div>
                  <h3 className="font-bold text-ink mb-1">创作者工坊</h3>
                  <p className="text-sm text-ink-medium">
                    零代码可视化编辑器，轻松创建自定义培训内容
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <h3 className="font-bold text-ink mb-1">资料库</h3>
                  <p className="text-sm text-ink-medium">
                    丰富的政策法规和典型案例库，为学习提供参考
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-bold text-ink mb-1">AI智能体</h3>
                  <p className="text-sm text-ink-medium">
                    基于RAG检索的AI助手，提供专业咨询和案例推荐
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="glass rounded-lg shadow-paper p-8 border border-ink-light">
            <h2 className="text-2xl font-bold text-ink mb-4 font-serif">技术特色</h2>
            <ul className="space-y-3 text-ink-medium">
              <li className="flex items-start gap-3">
                <span className="text-primary-red font-bold">•</span>
                <span><strong className="text-ink">AI原生设计</strong>：集成大语言模型，支持智能内容生成和分析</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-red font-bold">•</span>
                <span><strong className="text-ink">向量检索（RAG）</strong>：基于案例库的语义搜索，精准匹配相关案例</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-red font-bold">•</span>
                <span><strong className="text-ink">零代码编辑</strong>：可视化卡牌树编辑器，无需编程即可创建培训内容</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-red font-bold">•</span>
                <span><strong className="text-ink">危机谈判系统</strong>：模拟真实危机场景的谈判训练</span>
              </li>
            </ul>
          </section>

          <section className="glass rounded-lg shadow-paper p-8 border border-ink-light">
            <h2 className="text-2xl font-bold text-ink mb-4 font-serif">平台数据</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-red mb-2 font-serif">1,240+</div>
                <div className="text-sm text-ink-medium">真实案例</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-red mb-2 font-serif">56</div>
                <div className="text-sm text-ink-medium">合作机构</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-red mb-2 font-serif">5,000+</div>
                <div className="text-sm text-ink-medium">学员使用</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-red mb-2 font-serif">98%</div>
                <div className="text-sm text-ink-medium">满意度</div>
              </div>
            </div>
          </section>

          <section className="glass rounded-lg shadow-paper p-8 border border-ink-light">
            <h2 className="text-2xl font-bold text-ink mb-4 font-serif">联系我们</h2>
            <div className="space-y-2 text-ink-medium">
              <p>
                <strong className="text-ink">项目名称：</strong>山河答卷 - 基层治理沉浸式策略平台
              </p>
              <p>
                <strong className="text-ink">项目定位：</strong>AI原生策略卡牌叙事游戏与可视化编辑器
              </p>
              <p>
                <strong className="text-ink">目标用户：</strong>选调生与基层干部
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-ink text-white/60 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <p>© 2024 山河答卷 - 基层治理沉浸式策略学习平台</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;

