# 案例库字段结构说明

## 📋 核心数据结构

### 1. KnowledgeBaseCase 接口（TypeScript）

**位置**: `services/database/supabase.ts:7-20`

```typescript
export interface KnowledgeBaseCase {
  id: string;                    // UUID，主键，自动生成
  title: string;                 // 案例标题（必填，<=20字）
  tags: string[];                // 标签数组（3-5个关键词）
  category: StatKey;             // 类别：'economy' | 'people' | 'environment' | 'civility'
  context_summary: string;        // 背景摘要（必填）
  conflict_detail: string;       // 矛盾详情（必填）
  resolution_outcome: string;    // 解决结果（必填）
  expert_comment?: string;       // 专家点评（可选）
  source: CaseSource;            // 来源类型（见下方）
  original_text?: string;        // 原始文本（可选，用于追溯）
  status?: 'draft' | 'published' | 'archived';  // 状态
  embedding?: number[];          // 向量嵌入（1536维，用于RAG搜索）
}
```

### 2. CaseSource 类型

**位置**: `services/database/supabase.ts:5`

```typescript
export type CaseSource = 
  | 'official_report'      // 📋 官方报告
  | 'field_experience'     // 🏘️ 一线经验
  | 'user_upload'          // 👤 用户上传
  | 'expert_contribution'; // 🎓 专家贡献
```

### 3. StatKey 类型（类别）

**位置**: `types/game.ts:13`

```typescript
export type StatKey = 
  | 'economy'      // 💰 经济发展
  | 'people'       // 👥 民生福祉
  | 'environment'  // 🌲 生态环保
  | 'civility';    // 🚩 乡风民俗
```

---

## 🔄 数据流程

### UGC上传流程

**文件**: `components/ugc/UGCSubmission.tsx`

1. **用户输入原始文本** → `rawText` (string)
2. **AI智能提取** → 调用 `extractCaseFromText(rawText)`
   - **位置**: `utils/file/caseExtractor.ts:25-91`
   - **提取字段**:
     ```typescript
     {
       title: string,              // 简洁标题（<=20字）
       tags: string[],             // 3-5个关键词
       category: StatKey,          // economy|people|environment|civility
       context_summary: string,    // 背景摘要
       conflict_detail: string,    // 矛盾详情
       resolution_outcome: string,// 解决结果
       expert_comment?: string    // 专家点评（可选）
     }
     ```
3. **填充表单** → 用户可以手动编辑AI提取的结果
4. **提交保存** → 调用 `saveCaseToSupabase(caseData, embedding)`
   - **默认状态**: `status: 'draft'` (待审核)
   - **默认来源**: `source: 'user_upload'`
   - **保存原始文本**: `original_text: rawText`

### 管理员审核流程

**文件**: `components/admin/AdminReview.tsx`

1. **加载待审核案例** → `getCasesFromSupabase({ status: 'draft' })`
2. **审核操作**:
   - **批准**: `updateCaseInSupabase(id, { status: 'published' })`
   - **拒绝**: `updateCaseInSupabase(id, { status: 'archived' })`
   - **编辑**: 可以修改所有字段，然后保存
3. **已发布的案例** → 在资料库中可见，可用于RAG搜索

### 管理员直接录入流程

**文件**: `components/admin/AdminCaseUpload.tsx`

1. **输入原始文本** → 可选AI提取，或手动填写
2. **提交保存** → `saveCaseToSupabase(caseData, embedding)`
   - **默认状态**: `status: 'published'` (直接发布)
   - **默认来源**: `source: 'official_report'` 或 `'expert_contribution'`

---

## 🤖 AI解析提取字段详情

### extractCaseFromText() 函数

**位置**: `utils/file/caseExtractor.ts:25-91`

**System Prompt** (第26-35行):
```
你是基层治理案例分析师，请从用户文本中提取结构化信息并返回 JSON：
字段：
- title: 简洁标题（<=20字）
- tags: 3-5 个关键词
- category: economy|people|environment|civility
- context_summary: 背景摘要
- conflict_detail: 矛盾详情
- resolution_outcome: 解决结果
- expert_comment: 专家点评（可选）
要求：不编造；若缺失则留空；仅返回 JSON 可被 JSON.parse 解析。
```

**返回的AIExtractedCase接口** (第75-83行):
```typescript
{
  title: string,                    // 提取或默认'未命名案例'
  tags: string[],                   // 数组，空则返回[]
  category: StatKey,                // 验证后默认'civility'
  context_summary: string,           // 提取或空字符串
  conflict_detail: string,          // 提取或空字符串
  resolution_outcome: string,       // 提取或空字符串
  expert_comment?: string           // 可选，未提取则为undefined
}
```

**验证逻辑** (第85-88行):
- `category` 必须是 `['economy', 'people', 'environment', 'civility']` 之一
- 如果无效，默认设置为 `'civility'`

---

## 💾 Supabase数据库表结构

**位置**: `docs/supabase_schema.sql`

### knowledge_base 表字段

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 主键，自动生成 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 更新时间 |
| `title` | TEXT | NOT NULL | 案例标题 |
| `tags` | TEXT[] | DEFAULT '{}' | 标签数组 |
| `category` | TEXT | NOT NULL, CHECK | 类别：economy/people/environment/civility |
| `context_summary` | TEXT | NOT NULL | 背景摘要 |
| `conflict_detail` | TEXT | NOT NULL | 矛盾详情 |
| `resolution_outcome` | TEXT | NOT NULL | 解决结果 |
| `expert_comment` | TEXT | NULL | 专家点评（可选） |
| `source` | TEXT | NOT NULL, CHECK | 来源类型 |
| `original_text` | TEXT | NULL | 原始文本（可选） |
| `status` | TEXT | DEFAULT 'draft', CHECK | 状态：draft/published/archived |
| `created_by` | UUID | REFERENCES auth.users | 创建者ID（可选） |
| `embedding` | vector(1536) | NULL | 向量嵌入（用于RAG） |

### 索引

- `idx_knowledge_base_category` - 类别索引
- `idx_knowledge_base_tags` - 标签GIN索引
- `idx_knowledge_base_status` - 状态索引
- `idx_knowledge_base_source` - 来源索引
- `idx_knowledge_base_created_at` - 创建时间索引
- `idx_knowledge_base_embedding` - 向量相似度搜索索引（ivfflat）
- `idx_knowledge_base_fulltext` - 全文搜索索引（GIN）

---

## 🔗 连接关系

### 1. UGC上传 → 案例库

```
UGCSubmission.tsx (用户上传)
  ↓
extractCaseFromText() (AI提取)
  ↓
saveCaseToSupabase(caseData, embedding)
  ↓
status: 'draft' (待审核)
  ↓
knowledge_base 表
```

### 2. 管理员审核 → 案例库

```
AdminReview.tsx (管理员审核)
  ↓
getCasesFromSupabase({ status: 'draft' }) (加载待审核)
  ↓
updateCaseInSupabase(id, { status: 'published' }) (批准)
  ↓
status: 'published' (已发布)
  ↓
ResourceLibrary.tsx (资料库显示)
```

### 3. 管理员录入 → 案例库

```
AdminCaseUpload.tsx (管理员录入)
  ↓
extractCaseFromText() (可选AI提取)
  ↓
saveCaseToSupabase(caseData, embedding)
  ↓
status: 'published' (直接发布)
  ↓
knowledge_base 表
```

### 4. 案例库 → RAG搜索

```
AIAgent.tsx (AI智能体)
  ↓
searchSimilarCases(queryText) (向量搜索)
  ↓
generateEmbedding(queryText) (生成查询向量)
  ↓
match_knowledge_base() (Supabase RPC函数)
  ↓
knowledge_base 表 (status='published')
```

---

## 📝 字段使用场景

### 必填字段（所有场景）

- `title` - 案例标题
- `category` - 类别
- `context_summary` - 背景摘要
- `conflict_detail` - 矛盾详情
- `resolution_outcome` - 解决结果
- `source` - 来源类型

### 可选字段

- `tags` - 标签（AI提取或手动添加）
- `expert_comment` - 专家点评（AI可能提取，也可手动添加）
- `original_text` - 原始文本（UGC上传时保存，管理员录入可选）

### 系统字段（自动管理）

- `id` - 自动生成UUID
- `created_at` - 自动设置
- `updated_at` - 自动更新
- `status` - 根据来源自动设置：
  - UGC上传：`'draft'`
  - 管理员录入：`'published'`
- `embedding` - 自动生成（如果配置了OpenAI API）

---

## 🔧 字段微调建议

如需调整字段，需要修改以下文件：

1. **TypeScript接口**: `services/database/supabase.ts:7-20`
2. **AI提取Prompt**: `utils/file/caseExtractor.ts:26-35`
3. **数据库表结构**: `docs/supabase_schema.sql`
4. **UI表单**: 
   - `components/ugc/UGCSubmission.tsx`
   - `components/admin/AdminCaseUpload.tsx`
   - `components/admin/AdminReview.tsx`

---

*最后更新: 2024年*

