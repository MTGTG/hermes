# 🐛 GitHub Pages 空白页面 - 快速诊断脚本

## 🔍 诊断步骤

### 1. 确认版本已更新

```bash
cd /home/xiaolin/elecsim-studio
git log --oneline -3
```

应该看到最新的 commit: `93b44a9 Fix: Add base path for GitHub Pages deployment`

### 2. 验证构建产物

```bash
cat dist/index.html | grep "hermes"
```

应该看到类似这样的内容：
```html
<link rel="icon" type="image/svg+xml" href="/hermes/favicon.svg" />
<script type="module" crossorigin src="/hermes/assets/index-E_022AE-.js"></script>
```

### 3. 测试本地构建

```bash
cd /home/xiaolin/elecsim-studio
npm run dev
```

然后在浏览器打开 `http://localhost:5173`，如果能看到应用，说明代码没问题。

---

## ⚡ 强制重新部署

GitHub Pages 可能需要手动触发才能生效。执行以下步骤：

### 方法 A: 提交空提交（最简单）

```bash
cd /home/xiaolin/elecsim-studio
echo "# Trigger deploy" >> README.md
git add README.md
git commit -m "Trigger: Force GitHub Pages rebuild"
git push origin main
```

### 方法 B: 更新 CNAME

```bash
cd /home/xiaolin/elecsim-studio
echo "elecsim.github.io" > CNAME
git add CNAME
git commit -m "Config: Add custom domain placeholder"
git push origin main
```

---

## 🔧 替代方案：直接上传到 Netlify

如果觉得 GitHub Pages 太慢，可以改用 Netlify：

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
cd /home/xiaolin/elecsim-studio/dist
netlify deploy --prod
```

会生成一个类似的链接：https://xxxxx.netlify.app

---

## 📊 检查部署进度

### 查看 GitHub Actions

访问：https://github.com/MTGTG/hermes/actions

查找最近的 workflow run:
- ✅ Green check mark = 成功
- ❌ Red X = 失败，点击查看错误
- ⏳ Yellow spinner = 正在运行

### 查看 Pages 设置

访问：https://github.com/MTGTG/hermes/settings/pages

查看底部的 "Your site is published at" 部分

---

## 💻 使用临时隧道（立即生效）

在本地运行开发服务器并暴露到公网：

```bash
cd /home/xiaolin/elecsim-studio

# 启动开发服务器
npm run dev

# 新开一个终端，安装 localtunnel
npm install -g localtunnel

# 暴露到公网
lt --port 5173
```

会得到一个临时的公网链接，如：https://abc123.loca.lt

---

## 🎯 当前建议

根据您的情况，我推荐按以下顺序操作：

1. **立即验证**: 用 incognito/private 窗口访问 https://mtgtg.github.io/hermes/
2. **强制刷新**: Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
3. **等待 5 分钟**: GitHub 可能需要时间 CDN 刷新
4. **如果还是空白**: 使用上面的诊断步骤排查

---

**最新代码已推送**: ✅  
**Commit**: 8540565  
**Fix**: base path configured to '/hermes/'  
**Status**: Waiting for GitHub Pages to pick up changes
