# GitHub 推送指南（手动操作）

## 当前状态

✅ 远程仓库已配置：`https://github.com/ylyly666/shanhedajuan.git`
✅ 本地代码已全部提交
✅ 分支已重命名为 `main`

## 推送步骤

### 方法 1：使用命令行（如果网络正常）

```bash
git push -u origin main
```

如果遇到认证问题，GitHub 需要使用 **Personal Access Token** 而不是密码：

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：至少勾选 `repo`
4. 生成后复制 token
5. 在推送时，用户名输入 `ylyly666`，密码输入刚才复制的 token

### 方法 2：使用 GitHub Desktop（图形界面，推荐）

1. 下载安装 GitHub Desktop：https://desktop.github.com/
2. 打开 GitHub Desktop
3. 选择 "File" → "Add Local Repository"
4. 选择项目文件夹：`D:\dashijian\山河答卷---基层治理沉浸式策略平台`
5. 点击 "Publish repository"
6. 输入仓库名称：`shanhedajuan`
7. 选择账户：`ylyly666`
8. 点击 "Publish repository"

### 方法 3：配置代理（如果在中国大陆）

如果网络连接 GitHub 困难，可以配置代理：

```bash
# 设置 HTTP 代理（如果有）
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# 然后推送
git push -u origin main

# 推送完成后，可以取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 方法 4：使用 SSH（如果已配置 SSH key）

```bash
# 更改远程地址为 SSH
git remote set-url origin git@github.com:ylyly666/shanhedajuan.git

# 推送
git push -u origin main
```

## 验证推送

推送成功后，访问：https://github.com/ylyly666/shanhedajuan

应该能看到所有代码文件。

## 当前提交历史

```
3b9183a - refactor: 重构landing页面视觉设计
ed69912 - refactor: 将LandingPage组件内容合并到App.tsx
1c22eea - feat: 添加批量导入、管理员认证、RAG修复等功能
e8bc80c - refactor: 清理未使用的core/index.ts文件
31ee3ee - feat: 完善登录功能、个人主页和导航栏优化
```

## 注意事项

- `.env.local` 文件已在 `.gitignore` 中，不会被推送
- 首次推送可能需要输入 GitHub 用户名和 Personal Access Token
- 如果仓库是空的，直接推送即可
- 如果仓库已有内容，可能需要先 `git pull` 合并

