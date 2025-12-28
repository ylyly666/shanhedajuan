# 登录认证和 RAG 功能修复说明

## 🔐 问题 1：登录信息持久化和管理员认证

### 问题描述
- 每次打开页面都会自动恢复上次的登录状态（从 localStorage）
- 任何人都可以进入管理员模式，没有权限检查

### 已修复 ✅

#### 1. **管理员权限检查**
- 只有邮箱包含 `admin` 关键字的用户才能进入管理员模式
- 例如：`admin@example.com`、`user@admin.com` 等
- 未登录用户点击"管理员"会弹出登录框
- 非管理员用户会显示权限不足提示

#### 2. **清除登录信息**
如果需要清除登录信息，有以下方法：

**方法 1：浏览器控制台**
```javascript
localStorage.removeItem('user');
location.reload();
```

**方法 2：登出按钮**
- 如果已登录，可以在个人资料页面点击"登出"

**方法 3：清除浏览器数据**
- Chrome/Edge: 设置 → 隐私和安全 → 清除浏览数据 → 选择"Cookie 和其他网站数据"

---

## 🤖 问题 2：RAG 功能未连接 SilicoFlow API

### 问题描述
- RAG 搜索只检查了 `VITE_OPENAI_API_KEY`，没有检查 `VITE_SILICOFLOW_API_KEY`
- 即使配置了 SilicoFlow，也不会使用向量搜索

### 已修复 ✅

#### 1. **更新了 RAG 搜索逻辑**
- 现在会同时检查 `VITE_SILICOFLOW_API_KEY` 和 `VITE_OPENAI_API_KEY`
- 优先使用 SilicoFlow（如果配置了）

#### 2. **向量搜索流程**
```
用户提问
  ↓
生成查询向量（使用 SilicoFlow/OpenAI）
  ↓
在 Supabase 中搜索相似案例（向量相似度）
  ↓
将相关案例注入 AI Prompt
  ↓
调用 SilicoFlow API 生成回答
```

---

## ✅ 使用说明

### 管理员登录

1. **注册/登录管理员账号**
   - 邮箱必须包含 `admin` 关键字
   - 例如：`admin@test.com`、`test@admin.com`、`admin_user@example.com`

2. **访问管理员功能**
   - 点击"管理员"按钮
   - 如果未登录，会弹出登录框
   - 如果已登录但不是管理员，会显示权限提示

3. **清除登录状态**
   - 在浏览器控制台执行：`localStorage.removeItem('user'); location.reload();`
   - 或使用个人资料页面的"登出"按钮

### RAG 功能测试

1. **确保配置正确**
   ```env
   # .env.local
   VITE_SILICOFLOW_API_KEY=your_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **确保数据库向量维度匹配**
   - 如果使用 SilicoFlow 的 `BAAI/bge-large-en-v1.5`（1024维）
   - 需要执行 `docs/fix_vector_dimension.sql` 修改数据库 schema

3. **测试 RAG 搜索**
   - 进入"AI 智能体"页面
   - 提问相关问题，例如："如何处理村民纠纷？"
   - 查看控制台日志，应该看到：
     ```
     [Embedding] SilicoFlow 成功生成向量（模型: BAAI/bge-large-en-v1.5），维度: 1024
     [RAG] 找到 X 个相关案例
     ```

---

## 🔍 调试方法

### 检查登录状态
```javascript
// 浏览器控制台
console.log(JSON.parse(localStorage.getItem('user') || '{}'));
```

### 检查管理员权限
```javascript
// 浏览器控制台
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user.email?.toLowerCase().includes('admin');
console.log('是否为管理员:', isAdmin);
```

### 检查 RAG 配置
打开浏览器控制台，查看日志：
- `[RAG]` 开头的日志显示 RAG 搜索状态
- `[Embedding]` 开头的日志显示向量生成状态

### 常见问题

**Q: 为什么我还是能进入管理员模式？**
A: 可能是浏览器缓存了旧的登录信息。清除 localStorage 后重新登录。

**Q: RAG 搜索还是用文本搜索？**
A: 检查：
1. `.env.local` 中是否配置了 `VITE_SILICOFLOW_API_KEY`
2. 数据库向量维度是否匹配（1024 或 1536）
3. 控制台是否有错误日志

**Q: 如何完全清除登录信息？**
A: 在浏览器控制台执行：
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📝 后续改进建议

1. **更完善的管理员认证**
   - 可以添加密码验证
   - 可以连接 Supabase Auth 实现真正的用户认证
   - 可以在数据库中存储管理员列表

2. **RAG 功能优化**
   - 添加向量搜索缓存
   - 优化搜索阈值和结果数量
   - 添加搜索结果的置信度显示

