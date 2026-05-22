# ⚡ Elecsim Studio Pro - 快速开始指南

## 📍 项目信息

- **GitHub 仓库**: https://github.com/MTGTG/hermes
- **本地路径**: `/home/xiaolin/elecsim-studio`
- **固定链接**: `https://mtgtg.github.io/hermes/` (待启用)
- **临时链接**: `https://lovely-pens-push.loca.lt` (随时可能过期)

---

## 🎯 目标

1. ✅ 启用 GitHub Pages 获取固定链接
2. ✅ 建立持续优化工作流
3. ✅ 确保每次更新都能自动部署到公网

---

## 📦 第一步：启用 GitHub Pages

### 立即操作：

1. **访问设置页面**
   ```
   https://github.com/MTGTG/hermes/settings/pages
   ```

2. **配置 Pages**
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`
   - 点击 **Save**

3. **等待部署**（约 1-2 分钟）

4. **验证访问**
   ```
   https://mtgtg.github.io/hermes/
   ```

---

## 🔄 第二步：日常优化工作流

### 开发流程：

```bash
# 1. 本地开发
cd /home/xiaolin/elecsim-studio
npm run dev
# 在 http://localhost:5173 预览和测试

# 2. 进行优化...
# - 添加新功能
# - 修复 bug
# - 性能优化
# - UI/UX 改进

# 3. 构建生产版本
npm run build

# 4. 提交并推送
git add -A
git commit -m "优化：详细描述您的改进"
git push origin main

# 5. 等待自动部署
# GitHub Actions 会在 2-3 分钟内完成部署
```

---

## 📋 第三步：创建自动化部署

### 方案 A: 使用 GitHub Actions（推荐）

1. **重新生成 Token**（带 workflow 权限）
   - 访问 https://github.com/settings/tokens
   - 创建新 Token，勾选 `workflow` 权限
   - 复制新 Token

2. **更新 Git 远程地址**
   ```bash
   cd /home/xiaolin/elecsim-studio
   git remote set-url origin https://NEW_TOKEN@github.com/MTGTG/hermes.git
   git push origin main
   ```

3. **创建工作流文件**
   ```bash
   mkdir -p .github/workflows
   ```
   
   创建 `.github/workflows/deploy.yml`（见下方模板）

4. **提交并推送**
   ```bash
   git add .
   git commit -m "CI/CD: Add auto-deploy workflow"
   git push origin main
   ```

### 方案 B: 手动部署（当前可用）

如果暂时无法更新 Token，使用以下方式：

1. 优化代码
2. 运行 `npm run build`
3. 提交并推送
4. 等待 1-2 分钟
5. 刷新 GitHub Pages 查看更新

---

## 📝 工作流模板：deploy.yml

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

保存为 `.github/workflows/deploy.yml`

---

## 🔧 常用命令参考

```bash
# 开发模式（实时预览）
npm run dev

# 构建生产版本
npm run build

# 查看构建产物大小
cd dist && du -sh * && cd ..

# 检查 Git 状态
git status

# 查看最近的提交
git log --oneline -5

# 回滚到上一个版本
git reset --hard HEAD~1
git push origin main --force
```

---

## 🌐 部署状态检查

### 检查部署进度：

1. **GitHub Actions**
   ```
   https://github.com/MTGTG/hermes/actions
   ```
   查看最新的 Workflow run 是否成功

2. **Pages 设置**
   ```
   https://github.com/MTGTG/hermes/settings/pages
   ```
   查看部署状态和错误信息

3. **Pages Custom Domain**
   ```
   https://mtgtg.github.io/hermes/
   ```
   强制刷新浏览器：Ctrl+Shift+R

---

## 🎨 后续优化建议

根据您的需求，建议优先关注以下方向：

1. **核心功能完善**
   - 更多电路元件库
   - 仿真算法优化
   - 实时计算性能提升

2. **用户体验提升**
   - 响应式设计优化
   - 加载动画和过渡效果
   - 错误处理和提示

3. **高级功能**
   - 电路保存/加载
   - 导出电路图
   - 协作功能

4. **性能和 SEO**
   - Bundle 大小优化
   - Lazy loading
   - Meta 标签完善

---

## 📞 遇到问题？

### 常见问题排查：

| 问题 | 解决方法 |
|------|---------|
| 页面不显示 | 清除缓存，Ctrl+Shift+R |
| 部署失败 | 检查 GitHub Actions 日志 |
| 连接超时 | 尝试其他网络环境 |
| Token 错误 | 重新生成 Token 并更新 |

### 获取更多帮助：

- 查看 `DEPLOYMENT_GUIDE.md` 详细指南
- 访问 GitHub 文档：https://docs.github.com/en/pages
- 检查项目根目录的 `TOKEN_SETUP.md`

---

**最后更新**: 2026-05-22  
**版本**: v1.0.0  
**维护者**: xiaolin@elecsim.com
