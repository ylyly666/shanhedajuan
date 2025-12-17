-- 简化版：创建 knowledge_base 表（先执行这个）
-- 如果遇到错误，请先执行下面的扩展和权限设置

-- 1. 启用 pgvector 扩展（必需，用于向量搜索）
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 创建知识库表
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 基本信息
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('economy', 'people', 'environment', 'governance')),
  
  -- 结构化内容
  context_summary TEXT NOT NULL,
  conflict_detail TEXT NOT NULL,
  resolution_outcome TEXT NOT NULL,
  expert_comment TEXT,
  
  -- 元数据
  source TEXT NOT NULL CHECK (source IN ('official_report', 'field_experience', 'user_upload', 'expert_contribution')),
  original_text TEXT,
  
  -- 状态管理
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID,
  
  -- 向量嵌入（用于RAG，可选）
  embedding vector(1536)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_status ON public.knowledge_base(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source ON public.knowledge_base(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON public.knowledge_base(created_at DESC);

-- 4. 更新updated_at的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at 
  BEFORE UPDATE ON public.knowledge_base 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. 配置 Row Level Security (RLS)
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "允许匿名插入" ON public.knowledge_base;
DROP POLICY IF EXISTS "允许匿名查看" ON public.knowledge_base;
DROP POLICY IF EXISTS "任何人都可以查看已发布的案例" ON public.knowledge_base;
DROP POLICY IF EXISTS "认证用户可以创建案例" ON public.knowledge_base;
DROP POLICY IF EXISTS "创建者可以更新自己的案例" ON public.knowledge_base;
DROP POLICY IF EXISTS "管理员可以管理所有案例" ON public.knowledge_base;

-- 创建新策略：允许匿名用户插入和查看（用于开发测试）
CREATE POLICY "允许匿名插入" ON public.knowledge_base
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "允许匿名查看" ON public.knowledge_base
  FOR SELECT
  TO anon
  USING (true);

-- 允许匿名用户更新（用于开发测试）
CREATE POLICY "允许匿名更新" ON public.knowledge_base
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 6. 向量相似度搜索索引（可选，如果使用向量搜索）
-- 注意：只有在有数据后才能创建这个索引
-- CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON public.knowledge_base 
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- 7. 向量相似度搜索函数（用于RAG，可选）
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  context_summary text,
  conflict_detail text,
  resolution_outcome text,
  category text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.context_summary,
    kb.conflict_detail,
    kb.resolution_outcome,
    kb.category,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM public.knowledge_base kb
  WHERE 
    kb.status = 'published'
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 完成！现在表已经创建好了
-- 如果遇到权限错误，请检查 RLS 策略是否正确设置


