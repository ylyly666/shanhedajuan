# GitHub 推送指南

## 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `shanhe-dajuan` (或你喜欢的名称)
   - Description: 山河答卷 - 基层治理沉浸式策略平台
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
3. 点击 "Create repository"

## 步骤 2：配置远程仓库并推送

创建仓库后，GitHub 会显示仓库地址，格式类似：
- HTTPS: `https://github.com/your-username/shanhe-dajuan.git`
- SSH: `git@github.com:your-username/shanhe-dajuan.git`

### 使用 HTTPS（推荐，简单）

```bash
# 添加远程仓库
git remote add origin https://github.com/your-username/shanhe-dajuan.git

# 推送代码
git push -u origin master
```

如果遇到认证问题，GitHub 现在需要使用 Personal Access Token 而不是密码：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：至少勾选 `repo`
4. 生成后复制 token，在输入密码时使用这个 token

### 使用 SSH（需要配置 SSH key）

如果你已经配置了 SSH key：

```bash
# 添加远程仓库
git remote add origin git@github.com:your-username/shanhe-dajuan.git

# 推送代码
git push -u origin master
```

## 步骤 3：验证推送

推送成功后，访问你的 GitHub 仓库页面，应该能看到所有代码文件。

## 当前提交历史

```
3b9183a - refactor: 重构landing页面视觉设计
ed69912 - refactor: 将LandingPage组件内容合并到App.tsx
1c22eea - feat: 添加批量导入、管理员认证、RAG修复等功能
e8bc80c - refactor: 清理未使用的core/index.ts文件
31ee3ee - feat: 完善登录功能、个人主页和导航栏优化
```

## 注意事项

- 确保 `.env.local` 文件在 `.gitignore` 中（包含敏感信息）
- 首次推送可能需要输入 GitHub 用户名和密码/token
- 如果仓库已存在内容，可能需要先 `git pull` 合并

