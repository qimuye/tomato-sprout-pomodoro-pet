# 番茄芽团

一个 Windows 优先的轻量桌宠番茄钟 MVP。它使用 Electron + TypeScript + Vite，提供透明悬浮宠物窗、经典 `25/5/15` 番茄钟、托盘控制、悬停状态气泡和温柔系统通知。

## 本地运行

推荐使用 Node.js LTS。确认本机可以正常运行：

```bash
node --version
npm --version
```

安装依赖并启动开发环境：

```bash
npm install
npm run dev
```

Windows 上如果没有安装 Node.js，或者当前终端里的 `node`、`npm` 不可用，也可以使用项目内置的便携 Node 辅助脚本：

```powershell
.\scripts\install-portable-node.ps1
.\dev.ps1
```

也可以直接用包装脚本，不依赖当前终端 PATH：

```powershell
.\scripts\npm-portable.ps1 install
.\scripts\npm-portable.ps1 run dev
```

## 常用命令

```bash
npm run dev
npm run test
npm run typecheck
npm run build
```

如果普通 `npm` 不可用，可以把上面的命令换成便携脚本：

```powershell
.\scripts\npm-portable.ps1 run test
.\scripts\npm-portable.ps1 run typecheck
.\scripts\npm-portable.ps1 run build
```

## 功能

- 透明、无边框、置顶的小宠物窗口。
- 鼠标悬停显示模式、剩余时间、轮次和控制按钮。
- 拖动宠物移动位置，窗口位置会保存。
- 托盘菜单支持开始/暂停、重置、跳过、显示/隐藏和退出。
- 番茄钟使用 deadline 时间戳计算剩余时间，降低计时漂移。
- 到点后切换到提醒动画并发送系统通知。

## 宠物资产

当前内置的是可运行的 SVG 版“番茄芽团”占位资产，位置在 `public/pets/tomato-sprout/`。正式 9 状态精灵图的生成说明见 `docs/hatch-pet-assets.md`。

## 仓库内容说明

这个 GitHub 仓库只包含项目源码和运行所需的必要资料：

- `src/`：Electron 主进程、预加载脚本、渲染层和共享逻辑。
- `public/`：桌宠运行时使用的静态宠物资源。
- `docs/`：宠物资产接入和生成说明。
- `scripts/`：本项目运行、安装便携 Node、生成宠物资产所需脚本。

以下内容只保留在本地工作区，不上传到 GitHub：

- `wechat-articles/`：公众号文章草稿和配图。
- `vedio/`：视频脚本、素材、渲染结果等创作过程文件。
- `video-showcase/`：视频展示工程和导出结果。
- `renders/`：本地渲染或 QA 图片。
- `.claude/`、`.tools/`、`node_modules/`、`out/`、`release/`：本地工具、依赖、构建产物。

后续如果要继续做文章或视频，建议仍然把这些内容放在上述本地目录中；`.gitignore` 已经把它们隔离，避免误提交到公开仓库。
