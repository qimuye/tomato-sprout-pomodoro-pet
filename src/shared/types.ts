export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export type PetAnimationState =
  | 'idle'
  | 'running'
  | 'waving'
  | 'jumping'
  | 'failed'
  | 'waiting'
  | 'review'
  | 'running-left'
  | 'running-right'

export interface TimerDurations {
  focus: number
  shortBreak: number
  longBreak: number
}

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  focusRound: number
  completedFocusSessions: number
  startedAt: number | null
  deadline: number | null
  pausedRemainingMs: number | null
  lastCompletedMode: TimerMode | null
}

export interface TimerSnapshot extends TimerState {
  now: number
  remainingMs: number
  totalMs: number
  progress: number
}

export interface PetManifestState {
  row: number
  frames: number
  fps: number
  animation: PetAnimationState
}

export interface PetManifest {
  id: string
  displayName: string
  description: string
  renderMode: 'svg' | 'atlas'
  spritesheetPath: string
  frameSize: {
    width: number
    height: number
  }
  states: Record<PetAnimationState, PetManifestState>
}

export interface WindowBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface PetPomodoroApi {
  timer: {
    start: () => Promise<TimerSnapshot>
    pause: () => Promise<TimerSnapshot>
    reset: () => Promise<TimerSnapshot>
    skip: () => Promise<TimerSnapshot>
    getState: () => Promise<TimerSnapshot>
  }
  pet: {
    getBounds: () => Promise<WindowBounds>
    setPosition: (position: Pick<WindowBounds, 'x' | 'y'>) => void
    showContextMenu: () => void
  }
  onTimerState: (handler: (state: TimerSnapshot) => void) => () => void
}
