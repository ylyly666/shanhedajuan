# 数据上传流程说明

## 📍 数据保存位置

### 情况 1：配置了 Supabase（云端数据库）✅
- **位置**：数据保存到 **Supabase 云端数据库**
- **条件**：在 `.env.local` 中配置了：
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- **结果**：
  - ✅ 数据永久保存在云端
  - ✅ 可以在 Supabase Dashboard 中查看
  - ✅ 所有用户都能访问（如果设置了 RLS 策略）
  - ✅ 数据不会丢失

### 情况 2：未配置 Supabase（本地 Mock 数据）⚠️
- **位置**：数据只在**浏览器内存**中（临时）
- **结果**：
  - ⚠️ 刷新页面后数据消失
  - ⚠️ 无法持久化保存
  - ⚠️ 其他用户看不到你的数据

---

## 🔑 为什么需要 API？

### 1. **Supabase API**（必须的）🌐
**作用**：将数据保存到云端数据库

```
你的浏览器 → Supabase REST API → Supabase 云端数据库
```

- **为什么需要**：
  - Supabase 是云端数据库服务，不能直接访问
  - 必须通过 HTTP API 来操作数据库（增删改查）
  - 这是所有云端数据库的标准方式（Firebase、MongoDB Atlas 等都需要）

- **配置位置**：`.env.local`
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

- **如果没有配置**：
  - 数据不会保存到云端
  - 只会使用 Mock 数据（临时，刷新就没了）

---

### 2. **Embedding API**（可选的）🤖
**作用**：生成向量嵌入，用于 RAG 智能搜索

```
案例文本 → SilicoFlow/OpenAI API → 向量数组 → 保存到数据库
```

- **为什么需要**：
  - 向量嵌入用于语义搜索（RAG）
  - 让 AI 助手能够根据相似度找到相关案例
  - 不是必须的，但能提升搜索质量

- **配置位置**：`.env.local`
  ```env
  VITE_SILICOFLOW_API_KEY=your_key  # 推荐
  或
  VITE_OPENAI_API_KEY=your_key
  ```

- **如果没有配置**：
  - ✅ 案例仍然可以保存到数据库
  - ⚠️ 但没有向量嵌入
  - ⚠️ 无法使用向量相似度搜索（RAG）
  - ✅ 仍然可以使用文本搜索

---

## 📊 完整上传流程

```
1. 用户上传 Excel 文件
   ↓
2. 解析 Excel，提取案例数据
   ↓
3. 【可选】调用 Embedding API 生成向量
   ├─ 如果配置了 SilicoFlow/OpenAI → 生成向量
   └─ 如果未配置 → 跳过，不生成向量
   ↓
4. 【必须】调用 Supabase API 保存数据
   ├─ 如果配置了 Supabase → 保存到云端 ✅
   └─ 如果未配置 → 使用 Mock 数据（临时）⚠️
   ↓
5. 完成！
```

---

## ✅ 检查你的配置

打开浏览器控制台（F12），查看日志：

### 如果看到：
```
[Supabase] ✅ 检测到Supabase配置，将连接真实数据库
```
→ **数据会保存到云端** ✅

### 如果看到：
```
[Supabase] ⚠️ 未检测到Supabase配置，将使用Mock数据
```
→ **数据只存在内存中，刷新就没了** ⚠️

---

## 🎯 总结

| 功能 | 需要什么 | 是否必须 | 作用 |
|:---|:---|:---|:---|
| **保存案例到数据库** | Supabase API | ✅ **必须** | 数据持久化保存 |
| **生成向量嵌入** | SilicoFlow/OpenAI API | ❌ 可选 | 启用 RAG 智能搜索 |

**简单说**：
- **Supabase API** = 保存数据（必须）
- **Embedding API** = 智能搜索（可选，但推荐）

---

## 💡 常见问题

**Q: 为什么不能直接保存到本地文件？**
A: 因为这是 Web 应用，浏览器出于安全考虑不能直接写文件。而且本地文件无法实现多用户共享和云端同步。

**Q: 为什么需要 Supabase，不能用其他数据库吗？**
A: 可以用其他数据库（如 Firebase、MongoDB Atlas），但都需要通过 API 访问。Supabase 的优势是：
- 免费额度大
- 支持 PostgreSQL（功能强大）
- 内置向量搜索（pgvector）
- 有完善的 RLS 安全策略

**Q: 如果我不想用 API，能本地保存吗？**
A: 可以，但需要：
- 使用 IndexedDB（浏览器本地数据库）
- 数据只存在你的浏览器中
- 其他用户看不到
- 清除浏览器数据会丢失

