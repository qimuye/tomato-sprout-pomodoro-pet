import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  screen,
  Tray
} from 'electron'
import { join } from 'node:path'
import {
  createInitialTimerState,
  pauseTimer,
  resetTimer,
  skipTimer,
  startTimer,
  tickTimer,
  toTimerSnapshot
} from '../shared/timer'
import type { TimerMode, TimerSnapshot, TimerState, WindowBounds } from '../shared/types'
import { loadSettings, saveSettings } from './settings'

const PET_WINDOW_SIZE = {
  width: 210,
  height: 270
}

let petWindow: BrowserWindow | null = null
let tray: Tray | null = null
let timerState: TimerState = createInitialTimerState()
let tickHandle: NodeJS.Timeout | null = null
let alwaysOnTopHandle: NodeJS.Timeout | null = null
let lastBroadcastSecond = -1

function getModeLabel(mode: TimerMode): string {
  const labels: Record<TimerMode, string> = {
    focus: '专注',
    shortBreak: '短休息',
    longBreak: '长休息'
  }

  return labels[mode]
}

function getSnapshot(): TimerSnapshot {
  return toTimerSnapshot(timerState, Date.now())
}

function broadcastTimerState(): TimerSnapshot {
  const snapshot = getSnapshot()
  petWindow?.webContents.send('timer:state', snapshot)
  tray?.setToolTip(`番茄芽团 - ${getModeLabel(snapshot.mode)} ${formatRemaining(snapshot.remainingMs)}`)
  tray?.setContextMenu(buildTrayMenu())
  return snapshot
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function createTrayIcon(): Electron.NativeImage {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#f7f2e8"/>
      <circle cx="32" cy="35" r="18" fill="#e94b4b"/>
      <path d="M31 19c-5-8-13-7-17-1 7 2 12 3 17 1Z" fill="#48a868"/>
      <path d="M33 19c3-9 11-11 17-6-5 5-10 7-17 6Z" fill="#55bd78"/>
      <circle cx="25" cy="35" r="2.4" fill="#3a2d2d"/>
      <circle cx="39" cy="35" r="2.4" fill="#3a2d2d"/>
      <path d="M26 43c4 4 9 4 13 0" fill="none" stroke="#3a2d2d" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `

  return nativeImage.createFromDataURL(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`)
}

function applyAlwaysOnTopPreference(): void {
  if (!petWindow) {
    return
  }

  const { alwaysOnTop } = loadSettings()

  petWindow.setAlwaysOnTop(alwaysOnTop, alwaysOnTop ? 'screen-saver' : 'normal')
  petWindow.setVisibleOnAllWorkspaces(alwaysOnTop, { visibleOnFullScreen: alwaysOnTop })

  if (alwaysOnTop && petWindow.isVisible()) {
    petWindow.moveTop()
  }
}

function setAlwaysOnTopPreference(alwaysOnTop: boolean): void {
  saveSettings({ alwaysOnTop })
  applyAlwaysOnTopPreference()
  tray?.setContextMenu(buildTrayMenu())
}

function startAlwaysOnTopWatch(): void {
  if (alwaysOnTopHandle !== null) {
    return
  }

  alwaysOnTopHandle = setInterval(() => {
    if (loadSettings().alwaysOnTop) {
      applyAlwaysOnTopPreference()
    }
  }, 2000)
}

function buildTrayMenu(): Electron.Menu {
  const snapshot = getSnapshot()
  const running = snapshot.status === 'running'
  const { alwaysOnTop } = loadSettings()

  return Menu.buildFromTemplate([
    {
      label: running ? '暂停' : `开始${getModeLabel(snapshot.mode)}`,
      click: () => {
        timerState = running ? pauseTimer(timerState, Date.now()) : startTimer(timerState, Date.now())
        broadcastTimerState()
      }
    },
    {
      label: '重置',
      click: () => {
        timerState = resetTimer()
        broadcastTimerState()
      }
    },
    {
      label: '跳过当前阶段',
      click: () => {
        timerState = skipTimer(timerState)
        broadcastTimerState()
      }
    },
    { type: 'separator' },
    {
      label: '始终在最前端',
      type: 'checkbox',
      checked: alwaysOnTop,
      click: (menuItem) => {
        setAlwaysOnTopPreference(menuItem.checked)
      }
    },
    { type: 'separator' },
    {
      label: petWindow?.isVisible() ? '隐藏宠物' : '显示宠物',
      click: () => {
        if (!petWindow) {
          createPetWindow()
          return
        }

        if (petWindow.isVisible()) {
          petWindow.hide()
        } else {
          petWindow.showInactive()
          applyAlwaysOnTopPreference()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])
}

function createPetWindow(): void {
  const settings = loadSettings()
  const workArea = screen.getPrimaryDisplay().workArea
  const x = settings.windowBounds?.x ?? workArea.x + workArea.width - PET_WINDOW_SIZE.width - 32
  const y = settings.windowBounds?.y ?? workArea.y + workArea.height - PET_WINDOW_SIZE.height - 32

  petWindow = new BrowserWindow({
    ...PET_WINDOW_SIZE,
    x,
    y,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  applyAlwaysOnTopPreference()
  petWindow.removeMenu()

  if (process.env.ELECTRON_RENDERER_URL) {
    petWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    petWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  petWindow.once('ready-to-show', () => {
    petWindow?.showInactive()
    applyAlwaysOnTopPreference()
    broadcastTimerState()
  })

  petWindow.on('show', applyAlwaysOnTopPreference)
  petWindow.on('focus', applyAlwaysOnTopPreference)
  petWindow.on('blur', applyAlwaysOnTopPreference)
  petWindow.on('restore', applyAlwaysOnTopPreference)

  petWindow.on('move', () => {
    if (!petWindow) {
      return
    }

    const [nextX, nextY] = petWindow.getPosition()
    saveSettings({ windowBounds: { x: nextX, y: nextY } })
  })

  petWindow.on('closed', () => {
    petWindow = null
  })
}

function createTray(): void {
  tray = new Tray(createTrayIcon())
  tray.setToolTip('番茄芽团')
  tray.setContextMenu(buildTrayMenu())
  tray.on('click', () => {
    if (!petWindow) {
      return
    }

    petWindow.isVisible() ? petWindow.hide() : petWindow.showInactive()
  })
}

function notifySessionDone(completedMode: TimerMode, nextMode: TimerMode): void {
  if (!Notification.isSupported()) {
    return
  }

  const title = completedMode === 'focus' ? '专注完成' : '休息结束'
  const body =
    completedMode === 'focus'
      ? `番茄芽团在等你休息一下。下一阶段：${getModeLabel(nextMode)}。`
      : '番茄芽团准备陪你开始下一轮专注。'

  const notification = new Notification({
    title,
    body,
    silent: true
  })

  notification.on('click', () => {
    petWindow?.showInactive()
  })

  notification.show()
}

function startTicker(): void {
  if (tickHandle !== null) {
    return
  }

  tickHandle = setInterval(() => {
    const previousStatus = timerState.status
    const previousMode = timerState.mode
    timerState = tickTimer(timerState, Date.now())
    const snapshot = getSnapshot()
    const currentSecond = Math.ceil(snapshot.remainingMs / 1000)

    if (previousStatus === 'running' && timerState.status === 'finished') {
      notifySessionDone(previousMode, timerState.mode)
      broadcastTimerState()
      return
    }

    if (timerState.status === 'running' && currentSecond !== lastBroadcastSecond) {
      lastBroadcastSecond = currentSecond
      broadcastTimerState()
    }
  }, 250)
}

function registerIpc(): void {
  ipcMain.handle('timer:start', () => {
    timerState = startTimer(timerState, Date.now())
    return broadcastTimerState()
  })

  ipcMain.handle('timer:pause', () => {
    timerState = pauseTimer(timerState, Date.now())
    return broadcastTimerState()
  })

  ipcMain.handle('timer:reset', () => {
    timerState = resetTimer()
    return broadcastTimerState()
  })

  ipcMain.handle('timer:skip', () => {
    timerState = skipTimer(timerState)
    return broadcastTimerState()
  })

  ipcMain.handle('timer:getState', () => getSnapshot())

  ipcMain.handle('pet:getBounds', () => {
    const bounds = petWindow?.getBounds() ?? { x: 0, y: 0, ...PET_WINDOW_SIZE }
    return bounds satisfies WindowBounds
  })

  ipcMain.on('pet:setPosition', (_event, position: Pick<WindowBounds, 'x' | 'y'>) => {
    if (!petWindow) {
      return
    }

    const x = Math.round(position.x)
    const y = Math.round(position.y)
    petWindow.setPosition(x, y, false)
    saveSettings({ windowBounds: { x, y } })
  })

  ipcMain.on('pet:showContextMenu', () => {
    tray?.popUpContextMenu(buildTrayMenu())
  })
}

app.whenReady().then(() => {
  registerIpc()
  createPetWindow()
  createTray()
  startTicker()
  startAlwaysOnTopWatch()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createPetWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // Keep the tray process alive if the pet window is closed.
})

app.on('before-quit', () => {
  if (tickHandle !== null) {
    clearInterval(tickHandle)
  }

  if (alwaysOnTopHandle !== null) {
    clearInterval(alwaysOnTopHandle)
  }
})
