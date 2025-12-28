# Supabase 配置说明（可选）

## 功能说明

《山河答卷》的资料库和RAG对话功能支持两种模式：

1. **Mock数据模式**（默认）：无需配置，使用内置的示例案例数据
2. **Supabase模式**（可选）：连接真实的Supabase数据库，支持向量搜索和完整的数据管理

## 当前状态

✅ **已实现Mock数据兜底**：即使未配置Supabase，资料库和RAG对话功能也能正常工作，使用内置的6个示例案例。

## 配置Supabase（可选）

如果您想使用真实的Supabase数据库，需要配置以下环境变量：

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件：

```env
# Supabase配置（可选）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI Embedding API（用于向量搜索，可选）
VITE_OPENAI_API_KEY=sk-your-openai-key
```

### 2. 获取Supabase配置

1. 访问 [Supabase](https://supabase.com) 并创建项目
2. 在项目设置中找到：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 3. 创建数据库表

在Supabase SQL编辑器中执行以下SQL（参考 `docs/supabase_schema.sql`）：

```sql
-- 创建知识库表
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('economy', 'people', 'environment', 'civility')),
  context_summary TEXT NOT NULL,
  conflict_detail TEXT,
  resolution_outcome TEXT,
  expert_comment TEXT,
  source TEXT NOT NULL CHECK (source IN ('official_report', 'field_experience', 'user_upload', 'expert_contribution')),
  original_text TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  embedding vector(1536), -- OpenAI embedding维度
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建向量搜索函数（需要pgvector扩展）
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  tags text[],
  category text,
  context_summary text,
  conflict_detail text,
  resolution_outcome text,
  expert_comment text,
  source text,
  original_text text,
  status text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.tags,
    kb.category,
    kb.context_summary,
    kb.conflict_detail,
    kb.resolution_outcome,
    kb.expert_comment,
    kb.source,
    kb.original_text,
    kb.status,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE 
    kb.embedding IS NOT NULL
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND kb.status = 'published'
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 4. 启用pgvector扩展

在Supabase SQL编辑器中执行：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 功能对比

| 功能 | Mock模式 | Supabase模式 |
|------|----------|--------------|
| 查看案例 | ✅ 6个示例案例 | ✅ 所有已发布案例 |
| 搜索案例 | ✅ 文本搜索 | ✅ 向量搜索 + 文本搜索 |
| RAG对话 | ✅ 基于示例案例 | ✅ 基于完整案例库 |
| 上传案例 | ❌ | ✅ |
| 管理员审核 | ❌ | ✅ |

## 注意事项

1. **Mock模式已足够使用**：对于演示和开发，Mock数据模式已经可以满足基本需求
2. **向量搜索需要OpenAI API**：如果要使用向量搜索功能，需要配置 `VITE_OPENAI_API_KEY`
3. **网络问题**：如果Supabase连接失败，系统会自动回退到Mock数据模式
4. **数据安全**：`.env.local` 文件不应提交到Git仓库

## 故障排查

### 问题：资料库显示"加载失败"

**解决方案**：
1. 检查网络连接
2. 如果使用Supabase，检查 `.env.local` 配置是否正确
3. 系统会自动回退到Mock数据，刷新页面即可

### 问题：RAG对话无法检索案例

**解决方案**：
1. 检查Supabase配置（如果使用）
2. 检查OpenAI API Key（如果使用向量搜索）
3. 系统会自动使用文本搜索，功能仍然可用

### 问题：向量搜索失败

**可能原因**：
- 未配置 `VITE_OPENAI_API_KEY`
- Supabase未启用pgvector扩展
- 数据库中没有带embedding的案例

**解决方案**：
- 系统会自动回退到文本搜索，功能仍然可用

