# 🚀 Elecsim Studio Pro - GitHub Pages 部署指南

## ✅ 本地仓库已准备好！

您的项目已经成功创建 Git 仓库，并包含所有必要的文件：
- **源码**: `src/` 目录
- **构建输出**: `dist/` 目录
- **配置文件**: `package.json`, `vite.config.ts` 等

---

## 📝 快速部署步骤（约 2 分钟）

### 1️⃣ 在 GitHub 上创建新仓库

1. 访问 https://github.com/new
2. **Repository name**: 输入 `elecsim-studio`（或您喜欢的名称）
3. **Visibility**: Public（公开）或 Private（私有）都可以
4. **不要勾选** "Add a README file"
5. 点击 **"Create repository"**

### 2️⃣ 推送代码到 GitHub

在终端中执行以下命令：

```bash
cd /home/xiaolin/elecsim-studio

# 重命名分支为 main（GitHub 推荐）
git branch -M main

# 添加 GitHub 远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/elecsim-studio.git

# 推送代码
git push -u origin main
```

---

### 3️⃣ 启用 GitHub Pages

1. 进入您的仓库页面：https://github.com/YOUR_USERNAME/elecsim-studio
2. 点击 **"Settings"** → 左侧菜单 **"Pages"**
3. 在 **"Build and deployment"** 下：
   - **Source**: Select a branch
   - **Branch**: 选择 `main`
   - **Folder**: 选择 `/ (root)`
4. 点击 **"Save"**

### 4️⃣ 获取您的链接

等待 1-2 分钟后，在同一个 Pages 页面会显示您的访问链接：
```
https://YOUR_USERNAME.github.io/elecsim-studio/
```

---

## ⚡ 自动部署配置

如果您想实现自动部署（每次推送代码自动更新网站），可以创建 `_config.yml`:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🎉 完成！

部署成功后，您就可以分享链接给任何人使用了！
