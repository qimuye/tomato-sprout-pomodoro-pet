import { contextBridge, ipcRenderer } from 'electron'
import type { PetPomodoroApi, TimerSnapshot, WindowBounds } from '../shared/types'

const api: PetPomodoroApi = {
  timer: {
    start: () => ipcRenderer.invoke('timer:start'),
    pause: () => ipcRenderer.invoke('timer:pause'),
    reset: () => ipcRenderer.invoke('timer:reset'),
    skip: () => ipcRenderer.invoke('timer:skip'),
    getState: () => ipcRenderer.invoke('timer:getState')
  },
  pet: {
    getBounds: () => ipcRenderer.invoke('pet:getBounds'),
    setPosition: (position: Pick<WindowBounds, 'x' | 'y'>) => ipcRenderer.send('pet:setPosition', position),
    showContextMenu: () => ipcRenderer.send('pet:showContextMenu')
  },
  onTimerState: (handler: (state: TimerSnapshot) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: TimerSnapshot): void => handler(state)

    ipcRenderer.on('timer:state', listener)

    return () => {
      ipcRenderer.removeListener('timer:state', listener)
    }
  }
}

contextBridge.exposeInMainWorld('petPomodoro', api)
