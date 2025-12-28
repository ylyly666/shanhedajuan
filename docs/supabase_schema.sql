-- 山河答卷知识库表结构 (Supabase)
-- 用于存储结构化案例，支持RAG向量检索

-- 创建知识库表
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 基本信息
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('economy', 'people', 'environment', 'civility')),
  author_display TEXT, -- 上传者/来源身份（如"政府"、"基层干部"、"村民"等），用于展示
  
  -- 结构化内容
  context_summary TEXT NOT NULL, -- 背景摘要
  conflict_detail TEXT NOT NULL, -- 矛盾详情
  resolution_outcome TEXT NOT NULL, -- 解决结果
  expert_comment TEXT, -- 专家点评
  
  -- 元数据
  source TEXT NOT NULL CHECK (source IN ('official_report', 'field_experience', 'user_upload', 'expert_contribution')),
  original_text TEXT, -- 原始文本（可选，用于追溯）
  
  -- 状态管理
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES auth.users(id), -- 创建者
  
  -- 向量嵌入（用于RAG）
  embedding vector(1536) -- OpenAI embedding维度，或根据使用的模型调整
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_status ON knowledge_base(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source ON knowledge_base(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at DESC);

-- 向量相似度搜索索引（使用pgvector的ivfflat）
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 更新updated_at的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_base_updated_at 
  BEFORE UPDATE ON knowledge_base 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 启用Row Level Security (RLS)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS策略：所有人可以查看已发布的案例
CREATE POLICY "任何人都可以查看已发布的案例"
  ON knowledge_base
  FOR SELECT
  USING (status = 'published');

-- RLS策略：只有认证用户可以创建案例
CREATE POLICY "认证用户可以创建案例"
  ON knowledge_base
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS策略：只有创建者可以更新自己的案例
CREATE POLICY "创建者可以更新自己的案例"
  ON knowledge_base
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS策略：管理员可以管理所有案例
CREATE POLICY "管理员可以管理所有案例"
  ON knowledge_base
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 创建全文搜索索引（可选，用于文本搜索）
CREATE INDEX IF NOT EXISTS idx_knowledge_base_fulltext ON knowledge_base 
USING GIN (
  to_tsvector('simple', 
    coalesce(title, '') || ' ' || 
    coalesce(author_display, '') || ' ' ||
    coalesce(context_summary, '') || ' ' || 
    coalesce(conflict_detail, '') || ' ' || 
    coalesce(resolution_outcome, '')
  )
);

-- 向量相似度搜索函数（用于RAG）
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
  FROM knowledge_base kb
  WHERE 
    kb.status = 'published'
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 注释
COMMENT ON TABLE knowledge_base IS '乡村振兴知识库，存储结构化案例数据，支持RAG向量检索';
COMMENT ON COLUMN knowledge_base.embedding IS '向量嵌入，用于语义相似度搜索（RAG）';
COMMENT ON COLUMN knowledge_base.source IS '案例来源：official_report(官方报告), field_experience(一线经验), user_upload(用户上传), expert_contribution(专家贡献)';
COMMENT ON COLUMN knowledge_base.author_display IS '上传者/来源身份（如"政府"、"基层干部"、"村民"等），用于展示，区别于系统层面的source字段';




