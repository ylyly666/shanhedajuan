# API 配置说明

游戏支持多种 AI 服务提供商，包括硅基流动、Gemini 和 OpenAI。

## 环境变量配置

在项目根目录创建 `.env` 文件（或 `.env.local`），配置以下环境变量之一：

### 选项 1：硅基流动（推荐）
```env
VITE_SILICOFLOW_API_KEY=your_silicoflow_api_key
VITE_SILICOFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

### 选项 2：Google Gemini
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 选项 3：OpenAI
```env
VITE_OPENAI_API_KEY=your_openai_api_key
```

## API 优先级

系统会按以下顺序检测可用的 API：
1. 硅基流动 (VITE_SILICOFLOW_API_KEY)
2. Gemini (VITE_GEMINI_API_KEY)
3. OpenAI (VITE_OPENAI_API_KEY)

如果同时配置多个，会优先使用硅基流动。

## 游戏中的 API 使用

### 1. 危机谈判 (Crisis Negotiation)
- **功能**：玩家与愤怒的 NPC 进行谈判
- **API 调用**：`startCrisisNegotiation()`
- **返回**：NPC 回应、愤怒值变化、谈判状态

### 2. 游戏报告生成 (Game Report)
- **功能**：游戏结束后生成治理报告
- **API 调用**：`generateGameReport()`
- **返回**：Markdown 格式的治理分析报告

## 注意事项

1. **API Key 安全**：`.env` 文件已添加到 `.gitignore`，不会被提交到版本控制
2. **重启服务**：修改环境变量后需要重启开发服务器
3. **错误处理**：如果 API 调用失败，系统会返回默认响应，不会中断游戏

## 测试 API 连接

在浏览器控制台查看 API 调用日志，确认：
- API Key 是否正确加载
- 使用的 API 提供商
- API 调用是否成功





