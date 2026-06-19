import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { WindowBounds } from '../shared/types'

export interface AppSettings {
  windowBounds: Pick<WindowBounds, 'x' | 'y'> | null
  alwaysOnTop: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  windowBounds: null,
  alwaysOnTop: true
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function loadSettings(): AppSettings {
  const path = settingsPath()

  if (!existsSync(path)) {
    return DEFAULT_SETTINGS
  }

  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(readFileSync(path, 'utf8'))
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<AppSettings>): void {
  const path = settingsPath()
  const nextSettings = {
    ...loadSettings(),
    ...settings
  }

  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(nextSettings, null, 2)}\n`, 'utf8')
}
