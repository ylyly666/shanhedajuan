-- 修复向量维度不匹配问题
-- 问题：SilicoFlow 的 BAAI/bge-large-en-v1.5 模型生成 1024 维向量
-- 但数据库配置为 1536 维（OpenAI 标准）

-- 方案 1：修改为 1024 维（推荐，如果使用 SilicoFlow）
-- 注意：这会修改所有现有数据的向量类型
ALTER TABLE knowledge_base 
  ALTER COLUMN embedding TYPE vector(1024);

-- 更新向量搜索函数
DROP FUNCTION IF EXISTS match_knowledge_base(vector, float, int, text);
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1024),  -- 改为 1024
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
  expert_comment text,
  author_display text,
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
    kb.expert_comment,
    kb.author_display,
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

-- 重建向量索引
DROP INDEX IF EXISTS idx_knowledge_base_embedding;
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 方案 2：修改为不限制维度（更灵活，但可能影响性能）
-- ALTER TABLE knowledge_base 
--   ALTER COLUMN embedding TYPE vector;

-- 验证修改
SELECT 
  column_name, 
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'knowledge_base' 
  AND column_name = 'embedding';

