# 修复Supabase连接问题

## 问题
显示"网络连接失败: Failed to fetch"，无法连接到Supabase数据库。

## 解决方案

### 步骤1：安装Supabase官方客户端库

在项目根目录运行：

```bash
npm install @supabase/supabase-js
```

这个库会自动处理CORS问题，比直接使用fetch API更可靠。

### 步骤2：检查.env.local配置

确保 `.env.local` 文件在项目根目录，格式如下：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**重要提示**：
- 变量名必须以 `VITE_` 开头
- URL格式：`https://xxxxx.supabase.co`（不要有尾随斜杠）
- Key不要加引号
- 不要有多余空格

### 步骤3：重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 步骤4：检查浏览器控制台

打开浏览器控制台（F12），应该看到：

```
[Supabase] ✅ 检测到Supabase配置，将连接真实数据库
[Supabase] 使用官方客户端库
```

如果看到：
```
[Supabase] ⚠️ 未检测到Supabase配置
```

说明环境变量没有正确加载，请检查：
1. `.env.local` 文件是否在项目根目录
2. 变量名是否正确（必须是 `VITE_SUPABASE_URL`）
3. 是否重启了开发服务器

### 步骤5：测试连接

1. 打开"资料库"页面
2. 查看控制台是否有 `[Supabase] 获取到 X 个案例` 的日志
3. 如果还是显示Mock数据，检查控制台的错误信息

## 常见错误

### 错误1：CORS问题

**症状**：控制台显示 `CORS policy` 相关错误

**解决**：安装 `@supabase/supabase-js` 库（步骤1）

### 错误2：401 Unauthorized

**症状**：`Supabase Error: 401`

**解决**：检查 `VITE_SUPABASE_ANON_KEY` 是否正确

### 错误3：404 Not Found

**症状**：`Supabase Error: 404`

**解决**：检查 `VITE_SUPABASE_URL` 是否正确，确保格式为 `https://xxxxx.supabase.co`

### 错误4：环境变量未加载

**症状**：控制台显示"未检测到Supabase配置"

**解决**：
1. 确认文件名为 `.env.local`（注意前面的点）
2. 确认文件在项目根目录（与 `package.json` 同级）
3. 重启开发服务器
4. 清除浏览器缓存

## 验证配置

在浏览器控制台运行：

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '已配置' : '未配置');
```

如果显示 `undefined`，说明环境变量未正确加载。

## 如果还是不行

1. 检查Supabase项目是否正常运行
2. 检查Supabase项目的API设置中是否启用了REST API
3. 检查网络连接
4. 尝试在浏览器中直接访问：`https://your-project.supabase.co/rest/v1/`（应该返回JSON）

