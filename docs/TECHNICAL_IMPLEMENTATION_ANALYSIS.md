# 《山河答卷》核心功能技术实现分析报告

> 用于PPT演示的技术实现方案总结

---

## 1. 四维平衡决策系统 (PPT页5)

### 实现状态
**已实现** ✅

### 关键文件/函数
- `core/GameEngine.ts` - `applyDelta()` (157-166行)
- `core/GameEngine.ts` - `makeChoice()` (114-152行)
- `components/game/Dashboard.tsx` - `MetricIcon` 组件 (39-109行)
- `types/game.ts` - `GameStats` 接口 (6-11行)

### 技术逻辑摘要
1. **指标定义**：使用 `GameStats` 接口定义四个维度（`economy`, `people`, `environment`, `civility`），初始值均为50（定义在 `constants.ts` 的 `INITIAL_STATS`）。

2. **数值计算**：
   - 在 `applyDelta()` 中，通过 `Math.max(0, Math.min(100, currentValue + delta))` 实现上下限钳制（0-100）。
   - 每次滑卡时，`makeChoice()` 调用 `applyDelta()` 将选项的 `delta`（如 `{economy: 10, people: -5}`）累加到当前指标。

3. **实时可视化**：
   - `Dashboard.tsx` 使用 SVG 路径 + `clipPath` 实现液体容器效果。
   - 液体高度通过 `liquidY = 24 - (24 * (liquidHeight / 100))` 计算，使用 `framer-motion` 的 `animate` 实现平滑过渡。
   - 临界值（<20）时触发脉冲动画。

4. **状态管理**：游戏状态存储在 `GameState.currentStats`，通过 React Context 或 Props 传递给 UI 组件。

---

## 2. 卡牌叙事与分支系统 (PPT页6)

### 实现状态
**已实现** ✅

### 关键文件/函数
- `core/GameEngine.ts` - `makeChoice()` (114-152行)
- `core/GameEngine.ts` - `buildInitialCardQueue()` (47-62行)
- `core/GameEngine.ts` - `processStageCards()` (185-200行)
- `types/card.ts` - `CardOption.followUpCardId` (7行)
- `components/game/CardDeck.tsx` - `handleSwipe()` (109-158行)

### 技术逻辑摘要
1. **卡牌队列管理**：
   - 使用 `GameState.cardQueue: Card[]` 数组存储当前待处理的卡牌。
   - 初始化时，`buildInitialCardQueue()` 从阶段配置中提取第一层卡牌（排除 `followUpCard`）和随机池抽取的卡牌。

2. **左滑/右滑逻辑**：
   - `CardDeck.tsx` 使用 `framer-motion` 的 `useMotionValue` 和 `useTransform` 监听拖拽偏移量。
   - 当 `info.offset.x > 120` 时触发右滑，`< -120` 时触发左滑。
   - `handleSwipe()` 调用 `GameEngine.makeChoice()`，传入方向（`'left'|'right'`）和对应的 `delta`。

3. **后续卡牌插入**：
   - `CardOption.followUpCardId` 字段存储分支卡牌ID。
   - 在 `makeChoice()` 中，如果选项包含 `followUpCardId`，通过 `findCardById()` 查找卡牌，并使用 `cardQueue.unshift()` 插入到队列最前面（立即触发）。

4. **阶段推进**：
   - 当队列为空时，`processStageCards()` 检查当前阶段是否还有未处理的卡牌。
   - 如果阶段完成，调用 `advanceToNextStage()` 进入下一阶段，并重新构建队列。

5. **随机池机制**：
   - `RandomPool` 类型支持从 `randomEventLibrary` 中随机抽取指定数量的卡牌。
   - 抽取逻辑在 `drawRandomCards()` 中实现，使用 `Math.random()` 打乱数组并取前N个。

---

## 3. 危机谈判系统 (PPT页7)

### 实现状态
**已实现** ✅（部分使用Mock数据兜底）

### 关键文件/函数
- `core/GameEngine.ts` - `checkGameOver()` (315-327行)
- `core/GameEngine.ts` - `triggerCrisis()` (304-310行)
- `core/GameEngine.ts` - `submitNegotiationReply()` (332-371行)
- `components/game/CrisisNegotiation.tsx` - `handleSend()` (52-74行)
- `services/gameGeminiService.ts` - `startCrisisNegotiation()` (54-195行)
- `services/ai/aiService.ts` - `evaluateNegotiation()` (199-274行)

### 技术逻辑摘要
1. **触发机制**：
   - `checkGameOver()` 在每次选择后检查，如果任意指标 `<= 0`，调用 `triggerCrisis()`。
   - 阶段KPI未达标时，`checkStageKPI()` 返回失败，也会触发危机（282-299行）。

2. **AI扮演NPC**：
   - `startCrisisNegotiation()` 根据 `metric`（维度）选择对应的 `CRISIS_PROMPTS`（27-32行），构建系统提示词。
   - 使用 `callSilicoFlowAPI()` 或 Gemini API，传入对话历史和用户回复，生成NPC回应。

3. **怒气值计算**：
   - 初始怒气值100，存储在 `CrisisNegotiation` 组件的 `anger` state。
   - AI返回 `newAngerLevel`（0-100），通过 `framer-motion` 的进度条动画显示。
   - 评估标准：共情度、实际性、策略性、合规性（在 `evaluateNegotiation()` 的 Prompt 中定义，219-248行）。

4. **回合制逻辑**：
   - `negotiationTurns` 计数器，最多3次机会。
   - 如果 `newAngerLevel <= 0` 或 `negotiationStatus === 'SUCCESS'`，谈判成功，指标恢复到30，继续游戏。
   - 如果3次都失败，游戏结束。

5. **AI评分逻辑**：
   - `evaluateNegotiation()` 调用 LLM，要求返回 JSON：`{npcResponse, score, feedback, isPass}`。
   - 使用 `responseSchema`（Gemini）或正则提取（SilicoFlow）解析JSON。
   - 违规关键词（如"转账"、"贿赂"）直接判负。

---

## 4. AI个性化报告生成 (PPT页8)

### 实现状态
**已实现** ✅（需要配置API Key）

### 关键文件/函数
- `components/game/GameReport.tsx` - `startReport()` (160-189行)
- `services/gameGeminiService.ts` - `generateGameReport()` (197-269行)
- `services/ai/aiService.ts` - `generateGameReport()` (277-341行)
- `components/game/GameLoopEnhanced.tsx` - `handleBriefingComplete()` (191-204行)

### 技术逻辑摘要
1. **触发时机**：
   - 所有阶段完成后，`handleBriefingComplete()` 调用 `startReport()`。
   - 游戏失败时也会生成报告（`handleCrisisResult()` 中，223行）。

2. **数据汇总**：
   - 从 `GameState` 提取：`currentStats`（最终指标）、`history`（决策历史）、`currentStageIndex`（阶段数）。
   - 传递给 `generateGameReport()`，转换为 Prompt 中的文本描述。

3. **Prompt构建**：
   - 系统提示词：定义角色为"基层治理培训专家"。
   - 用户提示词：包含最终指标、关键决策历史（最近10条）、报告结构要求（治理画像、关键决策复盘、专家建议、案例推荐）。
   - 要求返回 Markdown 格式。

4. **RAG案例匹配**：
   - **当前实现**：Prompt 中要求AI推荐案例（如"安吉两山理论"），但**未实际调用向量数据库**。
   - **潜在实现路径**：可在生成报告前调用 `searchSimilarCases()`（`services/database/supabase.ts` 176-216行），将相似案例注入 Prompt。

5. **报告渲染**：
   - `GameReport.tsx` 使用 `react-markdown` 渲染 Markdown。
   - 使用 SVG 绘制雷达图（14-69行），展示四个维度的最终值。

---

## 5. 可视化游戏编辑器 (PPT页9)

### 实现状态
**已实现** ✅（时间线编辑，非拖拽式）

### 关键文件/函数
- `components/editor/Editor.tsx` - 主编辑器入口 (19-107行)
- `components/editor/TimelineEditor.tsx` - 时间线编辑器 (20-546行)
- `components/cardEditor/CardTree.tsx` - 卡牌树形结构展示
- `components/cardEditor/CardNode.tsx` - 单个卡牌节点
- `components/editor/ContextPanel.tsx` - 右侧属性面板

### 技术逻辑摘要
1. **编辑器架构**：
   - 采用"时间线 + 属性面板"布局，非拖拽式。
   - 左侧：阶段标签页（`TimelineEditor.tsx` 370-420行）+ 卡牌树形列表（`CardListController`）。
   - 右侧：`ContextPanel` 显示选中卡牌的编辑表单。

2. **卡牌树管理**：
   - 使用 `CardNode` 组件递归渲染，支持展开/折叠（`expandedCards` Set）。
   - `handleCreateFollowUp()` 创建后续卡牌，自动建立父子关系（86-101行）。
   - `collectAllFollowUpIds()` 递归收集所有后续卡ID，用于删除时级联清理（41-66行）。

3. **零代码配置**：
   - 通过表单输入：卡牌文本、选项文本、delta数值、NPC选择。
   - 支持批量导入：`CardImport.tsx` 解析Excel/CSV，自动生成卡牌和NPC（见功能6）。

4. **实时预览**：
   - 编辑器修改后，通过 `GameEngine.updateConfig()` 更新配置，可在预览模式中实时查看效果。

5. **数据持久化**：
   - 使用 `localStorage` 自动保存（`useGameState.ts` 26-28行），1秒防抖。

---

## 6. AI辅助创作功能 (PPT页10)

### 实现状态
**部分实现** ⚠️（文档解析已实现，AI生成卡牌JSON已实现，但未完全集成到编辑器）

### 关键文件/函数
- `components/editor/CardImport.tsx` - Excel/CSV导入 (92-289行)
- `utils/file/fileParser.ts` - 文档解析 (74-108行)
- `services/ai/aiService.ts` - `generateCardsFromDoc()` (129-189行)
- `utils/file/caseExtractor.ts` - 案例提取 (25-91行)
- `components/library/AssetsDrawer.tsx` - 资源库侧边栏（可能包含文档上传入口）

### 技术逻辑摘要
1. **文档解析**：
   - `fileParser.ts` 支持 PDF（使用 `pdfjs-dist` CDN）、Word（使用 `mammoth` CDN）、TXT。
   - 异步加载解析库，避免本地依赖问题。

2. **AI生成卡牌JSON**：
   - `generateCardsFromDoc()` 接收文本，调用 LLM（SilicoFlow/Gemini）。
   - Prompt 要求：提取1-3个"两难抉择"场景，生成标准 `Card[]` JSON。
   - 返回格式：`[{id, npcName, text, options: {left, right: {text, delta}}}]`。
   - 使用正则提取 JSON（处理 Markdown 代码块）。

3. **Excel/CSV导入**：
   - `CardImport.tsx` 使用 `xlsx` 库解析文件。
   - 字段映射：`卡牌名称`→`text`，`左滑选项影响`→`parseDelta()` 解析为 `delta`。
   - 自动创建/匹配NPC（`findOrCreateNpc()` 64-83行）。
   - 根据"卡牌类型"分配到 `anchorCards`（阶段）或 `randomCards`（随机库）。

4. **案例提取**：
   - `extractCaseFromText()` 从文档中提取结构化案例（标题、标签、类别、背景、冲突、解决方案）。
   - 返回 `AIExtractedCase`，可保存到知识库（`saveCaseToSupabase()`）。

5. **集成状态**：
   - **已实现**：Excel导入、文档解析、AI生成JSON。
   - **未完全集成**：文档上传后自动调用 `generateCardsFromDoc()` 并插入编辑器（需要手动触发）。

---

## 7. 基层治理智能体 / RAG架构 (PPT页11)

### 实现状态
**已实现** ✅（向量检索已实现，但需要配置Supabase和OpenAI Embedding API）

### 关键文件/函数
- `services/ai/aiAgent.ts` - `generateResponseWithRAG()` (11-88行)
- `services/database/supabase.ts` - `searchSimilarCases()` (176-216行)
- `services/database/supabase.ts` - `generateEmbedding()` (135-174行)
- `components/ai/AIAgent.tsx` - 对话界面 (32-325行)

### 技术逻辑摘要
1. **RAG流程**：
   - 用户提问 → `generateResponseWithRAG()` 接收 `userQuery`。
   - 调用 `searchSimilarCases()` 进行向量检索（优先）或文本搜索（兜底）。
   - 将检索到的案例注入 Prompt，调用 LLM 生成回答。

2. **向量数据库**：
   - 使用 Supabase + `pgvector` 扩展存储向量。
   - `generateEmbedding()` 调用 OpenAI Embedding API（`text-embedding-3-small`）生成查询向量。
   - `searchSimilarCases()` 调用 Supabase RPC 函数 `match_knowledge_base`，使用余弦相似度搜索。

3. **检索逻辑**：
   - **向量优先**：`searchSimilarCases()` 生成查询向量，调用 `match_knowledge_base` RPC（193-209行）。
   - **文本兜底**：如果向量搜索失败，使用 `getCasesFromSupabase()` 获取所有案例，通过 `includes()` 进行关键词匹配（26-40行）。
   - 支持按类别过滤（`category` 参数）。

4. **Prompt构建**：
   - 系统提示词：定义角色为"基层治理AI助手"。
   - 用户提示词：包含用户问题 + 相关案例库内容（标题、类别、背景、矛盾、解决、点评、标签）。
   - 要求引用案例时注明"案例X"。

5. **对话界面**：
   - `AIAgent.tsx` 实现聊天UI，使用 `useState` 管理消息列表。
   - 每条消息可包含 `relatedCases`，点击案例卡片弹出详情模态框。
   - 支持快速问题模板（95-100行）。

6. **配置要求**：
   - 需要设置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（Supabase）。
   - 需要设置 `VITE_OPENAI_API_KEY`（用于生成Embedding）。
   - 如果未配置，向量搜索会失败并回退到文本搜索。

---

## 总结

| 功能模块 | 实现状态 | 核心技术栈 |
|---------|---------|------------|
| 四维平衡决策系统 | ✅ 已实现 | React + TypeScript + Framer Motion |
| 卡牌叙事与分支系统 | ✅ 已实现 | 队列管理 + 递归查找 |
| 危机谈判系统 | ✅ 已实现 | LLM API + 回合制状态机 |
| AI个性化报告生成 | ✅ 已实现 | LLM + Markdown渲染 |
| 可视化游戏编辑器 | ✅ 已实现 | React组件树 + localStorage |
| AI辅助创作功能 | ⚠️ 部分实现 | 文档解析 + LLM生成JSON |
| RAG架构 | ✅ 已实现 | Supabase + pgvector + OpenAI Embedding |

---

## 技术债务与待优化点

1. **RAG报告生成**：当前报告生成未实际调用向量数据库，仅依赖LLM推荐案例。
2. **AI创作集成**：文档上传后需要手动触发AI生成，未实现自动流程。
3. **拖拽编辑器**：当前为时间线编辑，非拖拽式，用户体验可优化。
4. **向量检索配置**：需要手动配置Supabase和OpenAI API，缺少配置向导。

---

*报告生成时间：2024年*
*技术栈：React 19 + TypeScript + Vite + Framer Motion + Supabase + OpenAI/Gemini/SilicoFlow*

