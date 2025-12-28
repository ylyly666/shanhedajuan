-- 修复 author_display 列问题
-- 如果遇到 "Could not find the 'author_display' column" 错误，执行此脚本

-- 1. 验证列是否存在
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'knowledge_base' 
  AND column_name IN ('author_display', 'expert_comment');

-- 2. 如果列不存在，添加它们
DO $$
BEGIN
    -- 添加 author_display 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'knowledge_base' AND column_name = 'author_display'
    ) THEN
        ALTER TABLE knowledge_base ADD COLUMN author_display TEXT;
        RAISE NOTICE '已添加 author_display 列';
    ELSE
        RAISE NOTICE 'author_display 列已存在';
    END IF;

    -- 添加 expert_comment 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'knowledge_base' AND column_name = 'expert_comment'
    ) THEN
        ALTER TABLE knowledge_base ADD COLUMN expert_comment TEXT;
        RAISE NOTICE '已添加 expert_comment 列';
    ELSE
        RAISE NOTICE 'expert_comment 列已存在';
    END IF;
END $$;

-- 3. 刷新 Supabase schema cache
-- 注意：Supabase会自动刷新，但可能需要几分钟
-- 如果仍然报错，可以尝试：
-- 1. 在 Supabase Dashboard 中进入 Table Editor，查看 knowledge_base 表
-- 2. 或者等待 1-2 分钟后重试

-- 4. 验证列已添加
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'knowledge_base' 
  AND column_name IN ('author_display', 'expert_comment')
ORDER BY column_name;

