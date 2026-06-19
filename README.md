# 番茄芽团

一个 Windows 优先的轻量桌宠番茄钟 MVP。它使用 Electron + TypeScript + Vite，提供透明悬浮宠物窗、经典 `25/5/15` 番茄钟、托盘控制、悬停状态气泡和温柔系统通知。

## 本地运行

Windows 上推荐直接用项目内置的便携 Node 启动，避免系统里旧的 `H:\nodejs\npm.ps1` 抢先被命中：

```powershell
.\dev.ps1
```

首次运行如果还没有下载便携 Node：

```powershell
.\scripts\install-portable-node.ps1
.\dev.ps1
```

如果你已经安装了标准 Node.js LTS，并且 `node --version`、`npm --version` 都正常，也可以用普通 npm：

```bash
npm install
npm run dev
```

如果当前终端里的 `node` 缺失，或者 `npm.ps1` 指向 `H:\nodejs` 但那里没有 `node.exe`，可以在每个新 PowerShell 里先启用项目本地便携 Node：

```powershell
.\scripts\use-portable-node.ps1
npm install
npm run dev
```

也可以直接用包装脚本，不依赖当前终端 PATH：

```powershell
.\scripts\npm-portable.ps1 install
.\scripts\npm-portable.ps1 run dev
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
