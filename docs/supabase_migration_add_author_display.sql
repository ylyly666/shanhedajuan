-- ============================================
-- Migration: 添加 author_display 字段
-- 日期: 2024年
-- 说明: 根据真实Excel表格结构，添加"上传者/来源身份"字段
-- ============================================

-- 1. 添加 author_display 列
ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS author_display TEXT;

-- 2. 添加注释
COMMENT ON COLUMN knowledge_base.author_display IS '上传者/来源身份（如"政府"、"基层干部"、"村民"等），用于展示，区别于系统层面的source字段';

-- 3. 更新全文搜索索引（包含新字段）
DROP INDEX IF EXISTS idx_knowledge_base_fulltext;
CREATE INDEX idx_knowledge_base_fulltext ON knowledge_base 
USING GIN (
  to_tsvector('simple', 
    coalesce(title, '') || ' ' || 
    coalesce(author_display, '') || ' ' ||
    coalesce(context_summary, '') || ' ' || 
    coalesce(conflict_detail, '') || ' ' || 
    coalesce(resolution_outcome, '')
  )
);

-- 4. 验证 category 约束（确保包含所有类别）
-- 如果约束已存在且正确，此操作不会报错
DO $$
BEGIN
  -- 检查约束是否存在
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'knowledge_base_category_check'
  ) THEN
    ALTER TABLE knowledge_base 
    ADD CONSTRAINT knowledge_base_category_check 
    CHECK (category IN ('economy', 'people', 'environment', 'civility'));
  END IF;
END $$;

-- 5. 验证 tags 是数组类型（如果已经是text[]则无需操作）
-- 此操作仅用于确认，如果类型不匹配会报错
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'knowledge_base' AND column_name = 'tags') != 'ARRAY' THEN
    RAISE EXCEPTION 'tags列必须是数组类型(text[])';
  END IF;
END $$;

-- 6. 可选：为 author_display 创建索引（如果经常用于搜索）
CREATE INDEX IF NOT EXISTS idx_knowledge_base_author_display 
ON knowledge_base(author_display) 
WHERE author_display IS NOT NULL;

-- ============================================
-- 回滚脚本（如果需要）
-- ============================================
-- ALTER TABLE knowledge_base DROP COLUMN IF EXISTS author_display;
-- DROP INDEX IF EXISTS idx_knowledge_base_author_display;

