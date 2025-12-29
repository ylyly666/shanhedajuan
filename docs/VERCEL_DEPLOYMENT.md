# Vercel 部署配置指南

## 🔧 必需的环境变量

在 Vercel 部署时，必须在 Vercel Dashboard 中配置以下环境变量：

### Supabase 数据库配置

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### AI 服务配置（至少配置一个）

```
VITE_SILICOFLOW_API_KEY=your-silicoflow-key
VITE_SILICOFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

或者

```
VITE_OPENAI_API_KEY=your-openai-key
```

或者

```
VITE_GEMINI_API_KEY=your-gemini-key
```

## 📝 在 Vercel 中配置环境变量

### 步骤 1：登录 Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 选择你的项目

### 步骤 2：添加环境变量

1. 进入项目设置：**Settings** → **Environment Variables**
2. 点击 **Add New**
3. 依次添加以下变量：

| 变量名 | 值 | 环境 |
|:---|:---|:---|
| `VITE_SUPABASE_URL` | 你的 Supabase URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key | Production, Preview, Development |
| `VITE_SILICOFLOW_API_KEY` | 你的 SilicoFlow API Key | Production, Preview, Development |
| `VITE_SILICOFLOW_BASE_URL` | `https://api.siliconflow.cn/v1` | Production, Preview, Development |

### 步骤 3：重新部署

配置完环境变量后，需要重新部署：

1. 进入 **Deployments** 页面
2. 点击最新部署右侧的 **...** 菜单
3. 选择 **Redeploy**
4. 或者推送新的代码触发自动部署

## 🔍 验证配置

部署后，打开浏览器控制台（F12），应该能看到：

```
[Supabase] ✅ 检测到Supabase配置，将连接真实数据库
[Embedding] SilicoFlow 成功生成向量...
```

如果看到：

```
[Supabase] ⚠️ 未检测到Supabase配置，将使用Mock数据
```

说明环境变量没有正确配置。

## ⚠️ 常见问题

### 1. 环境变量名称错误

确保变量名以 `VITE_` 开头，Vite 只会暴露以 `VITE_` 开头的环境变量到客户端。

### 2. 环境变量没有应用到所有环境

在 Vercel 中添加环境变量时，确保勾选：
- ✅ Production
- ✅ Preview  
- ✅ Development

### 3. 需要重新部署

修改环境变量后，必须重新部署才能生效。

### 4. 检查环境变量值

确保：
- Supabase URL 格式正确：`https://xxxxx.supabase.co`
- API Key 完整且没有多余空格
- 没有使用引号包裹值（Vercel 会自动处理）

## 📋 快速检查清单

- [ ] `VITE_SUPABASE_URL` 已配置
- [ ] `VITE_SUPABASE_ANON_KEY` 已配置
- [ ] `VITE_SILICOFLOW_API_KEY` 已配置（或 OpenAI/Gemini）
- [ ] 环境变量已应用到 Production 环境
- [ ] 已重新部署项目
- [ ] 浏览器控制台显示连接成功

## 🔗 相关链接

- Vercel 环境变量文档：https://vercel.com/docs/concepts/projects/environment-variables
- Supabase 项目设置：https://app.supabase.com/project/_/settings/api

