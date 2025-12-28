# 案例库字段结构更新说明

## 📋 更新内容

根据真实Excel表格结构，已添加 `author_display` 字段（上传者/来源身份）。

## 🔄 字段映射表（Excel → 数据库）

| Excel 表头 | 数据库字段 | 类型 | 说明 | 必填 |
|:---|:---|:---|:---|:---|
| **事件名称** | `title` | TEXT | 案例标题 | ✅ |
| **所属类别** | `category` | ENUM | economy/people/environment/civility | ✅ |
| **上传者** | `author_display` | TEXT | 上传者/来源身份（如"政府/基层干部"） | ❌ |
| **背景摘要** | `context_summary` | TEXT | 事件起因、背景 | ✅ |
| **矛盾详情** | `conflict_detail` | TEXT | 核心冲突、困难点 | ✅ |
| **解决结果** | `resolution_outcome` | TEXT | 处理措施及成效 | ✅ |
| **专家点评** | `expert_comment` | TEXT | 经验总结或警示意义 | ❌ |
| **标签** | `tags` | TEXT[] | Excel格式"#标签1 #标签2"，需解析为数组 | ❌ |

## 📝 类别映射（中文 → 英文）

| Excel中的中文 | 数据库值 | 说明 |
|:---|:---|:---|
| 经济发展 | `economy` | 💰 |
| 民生福祉 | `people` | 👥 |
| 生态环境 | `environment` | 🌲 |
| 乡风民俗/基层治理 | `civility` | 🚩 |

## 🔧 已更新的文件

### 1. TypeScript 类型定义

**文件**: `services/database/supabase.ts:7-20`
```typescript
export interface KnowledgeBaseCase {
  id: string;
  title: string;
  tags: string[];
  category: StatKey;
  author_display?: string; // ✅ 新增字段
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
  source: CaseSource;
  original_text?: string;
  status?: 'draft' | 'published' | 'archived';
  embedding?: number[];
}
```

**文件**: `types/ai.ts`
```typescript
export interface AIExtractedCase {
  title: string;
  tags: string[];
  category: StatKey;
  author_display?: string; // ✅ 新增字段
  context_summary: string;
  conflict_detail: string;
  resolution_outcome: string;
  expert_comment?: string;
}
```

### 2. AI提取逻辑

**文件**: `utils/file/caseExtractor.ts:26-35`

**更新后的System Prompt**:
```
你是基层治理案例分析师，请从用户文本中提取结构化信息并返回 JSON：
字段：
- title: 简洁标题（<=20字）
- tags: 3-5 个关键词（数组格式）
- category: economy(经济发展)|people(民生福祉)|environment(生态环境)|civility(乡风民俗/基层治理)
- author_display: 上传者/来源身份（如"政府"、"基层干部"、"村民"等，如果文本中有提及身份则提取，否则留空）
- context_summary: 背景摘要（事件起因、背景）
- conflict_detail: 矛盾详情（核心冲突、困难点）
- resolution_outcome: 解决结果（处理措施及成效）
- expert_comment: 专家点评（经验总结或警示意义，可选）
要求：不编造；若缺失则留空；仅返回 JSON 可被 JSON.parse 解析。
```

### 3. UI表单组件

**已更新**:
- ✅ `components/ugc/UGCSubmission.tsx` - 添加了 `author_display` 输入框
- ✅ `components/admin/AdminCaseUpload.tsx` - 添加了 `author_display` 输入框
- ✅ `components/admin/AdminReview.tsx` - 编辑表单中添加了 `author_display` 字段

### 4. 数据库Schema

**文件**: `docs/supabase_schema.sql`

已添加：
```sql
author_display TEXT, -- 上传者/来源身份（如"政府"、"基层干部"、"村民"等），用于展示
```

**迁移脚本**: `docs/supabase_migration_add_author_display.sql`

包含：
- 添加 `author_display` 列
- 更新全文搜索索引（包含新字段）
- 验证约束
- 创建索引（可选）

### 5. Mock数据

**文件**: `services/database/mockCases.ts`

已为所有Mock案例添加 `author_display` 字段示例。

## 🔗 数据流程（保持不变）

```
Excel表格
  ↓
导入解析（需实现Excel导入功能）
  ↓
映射字段（中文→英文，如"经济发展"→"economy"）
  ↓
保存到Supabase (author_display字段)
  ↓
管理员审核
  ↓
发布到资料库
  ↓
RAG搜索
```

## 📌 注意事项

1. **字段区别**:
   - `author_display`: 用于展示的上传者身份（如"政府"、"基层干部"）
   - `source`: 系统层面的来源类型（`official_report`/`field_experience`/`user_upload`/`expert_contribution`）

2. **Excel标签解析**:
   - Excel格式: `"#标签1 #标签2"`
   - 需要解析为: `["标签1", "标签2"]`
   - 建议使用正则: `/#(\w+)/g` 或 `/#([^#\s]+)/g`

3. **类别映射**:
   - Excel中的"乡风民俗"或"基层治理"都映射为 `civility`
   - 需要在导入时进行映射转换

## 🚀 下一步：Excel导入功能

如需实现Excel批量导入，需要：
1. 解析Excel文件（已有 `xlsx` 库）
2. 映射中文类别到英文（`category`）
3. 解析标签字符串为数组（`tags`）
4. 调用 `saveCaseToSupabase()` 批量保存

---

*最后更新: 2024年*

