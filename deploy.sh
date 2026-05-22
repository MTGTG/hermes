#!/bin/bash
# Elecsim Studio Pro - GitHub Pages 一键部署脚本
# 用法：./deploy.sh "您的优化说明"

set -e

PROJECT_PATH="/home/xiaolin/elecsim-studio"

echo "========================================"
echo " ⚡ Elecsim Studio Pro - 一键部署工具"
echo "========================================"
echo ""

# 检查是否在正确目录
if [ ! -d "$PROJECT_PATH/package.json" ]; then
    echo "❌ 错误：未找到项目文件"
    echo "   请运行：cd $PROJECT_PATH"
    exit 1
fi

cd "$PROJECT_PATH"

# 检查参数
if [ -z "$1" ]; then
    echo "⚠️  未提供优化说明"
    echo "   使用默认说明：'常规优化更新'"
    OPTIMIZE_MSG="常规优化更新"
else
    OPTIMIZE_MSG="$1"
fi

echo "📦 开始部署流程..."
echo ""

# 步骤 1: 构建项目
echo "🔨 步骤 1/4: 构建生产版本..."
npm run build
BUILD_STATUS=$?
if [ $BUILD_STATUS -ne 0 ]; then
    echo "❌ 构建失败！请检查错误信息"
    exit 1
fi
echo "✅ 构建成功！"
echo ""

# 步骤 2: 提交变更
echo "📝 步骤 2/4: 提交变更到 Git..."
git add -A
git commit -m "优化：$OPTIMIZE_MSG"
echo "✅ 已本地提交！"
echo ""

# 步骤 3: 推送到 GitHub
echo "📤 步骤 3/4: 推送到 GitHub..."
git push origin main
echo "✅ 已推送到 GitHub!"
echo ""

# 步骤 4: 完成提示
echo "✨ 部署成功！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 📍 项目地址："
echo "    ──────────────────────────────────"
echo "    GitHub 仓库：https://github.com/MTGTG/hermes"
echo "    GitHub 源码：https://github.com/MTGTG/hermes/tree/main"
echo ""
echo "    固定链接（待启用）：https://mtgtg.github.io/hermes/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👉 下一步操作："
echo "   1. 访问 https://github.com/MTGTG/hermes/settings/pages"
echo "   2. Source 选择：Deploy from a branch"
echo "   3. Branch 选择：main, Folder 选择：/ (root)"
echo "   4. 点击 Save"
echo "   5. 等待 1-2 分钟，然后访问上述固定链接查看效果"
echo ""
echo "💡 提示：下次优化只需运行："
echo "        ./deploy.sh \"您的优化说明\""
echo ""
