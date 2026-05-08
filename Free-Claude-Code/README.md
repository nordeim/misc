# 本期视频所需资源链接 & 终端指令代码

## 🌐 演示网站
- **猫咪照片网页**: [test-github-repo.vercel.app/cat-showcase.html](https://test-github-repo.vercel.app/cat-showcase.html)
- **树生长的动态网页**: [test-github-repo.vercel.app/growing_tree.html](https://test-github-repo.vercel.app/growing_tree.html)
- **夜晚烟花动态网页**: [test-github-repo.vercel.app/firework.html](https://test-github-repo.vercel.app/firework.html)
- **YouTube 近期视频自动更新主页**: [wow-site-steel.vercel.app](https://wow-site-steel.vercel.app/)

---

## 🛠️ 必备工具官方链接
- **Claude-code 官方 GitHub**: [github.com/anthropics/claude-code](https://github.com/anthropics/claude-code)
- **Free-claude-code GitHub**: [github.com/Alishahryar1/free-claude-code](https://github.com/Alishahryar1/free-claude-code)
- **NVIDIA 免费 API 申请**: [build.nvidia.com](https://build.nvidia.com/)

---

## 💻 终端指令代码

### 安装 Homebrew
> ⚠️ 首次安装完成后需运行提示的两条命令
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 安装 Claude Code
```bash
brew install --cask claude-code
```

### 安装 uv 工具链 & Python 3.14
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv self update
uv python install 3.14
```

### 克隆并配置 free-claude-code
```bash
git clone https://github.com/Alishahryar1/free-claude-code.git
cd free-claude-code
cp .env.example .env
sudo nano .env
```

### 启动本地代理服务
> 🖥️ 在 **终端 A** 中运行
```bash
# 注意：请将 /Users/eight/ 替换为你的实际 macOS 用户名路径
cd /Users/eight/free-claude-code
uv run uvicorn server:app --host 0.0.0.0 --port 8082
```

### 启动免配置版 Claude Code
> 🖥️ 在 **终端 B** 中运行
```bash
ANTHROPIC_AUTH_TOKEN="freecc" ANTHROPIC_BASE_URL="http://localhost:8082" claude
```
