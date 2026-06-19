import type { TimerDurations, TimerMode, TimerSnapshot, TimerState } from './types'

export const DEFAULT_TIMER_DURATIONS: TimerDurations = {
  focus: 25 * 60 * 1000,
  shortBreak: 5 * 60 * 1000,
  longBreak: 15 * 60 * 1000
}

export function createInitialTimerState(): TimerState {
  return {
    mode: 'focus',
    status: 'idle',
    focusRound: 1,
    completedFocusSessions: 0,
    startedAt: null,
    deadline: null,
    pausedRemainingMs: null,
    lastCompletedMode: null
  }
}

export function getDurationForMode(
  mode: TimerMode,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): number {
  return durations[mode]
}

export function getRemainingMs(
  state: TimerState,
  now: number,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): number {
  if (state.status === 'running' && state.deadline !== null) {
    return Math.max(0, state.deadline - now)
  }

  if (state.pausedRemainingMs !== null) {
    return Math.max(0, state.pausedRemainingMs)
  }

  return getDurationForMode(state.mode, durations)
}

export function startTimer(
  state: TimerState,
  now: number,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): TimerState {
  if (state.status === 'running') {
    return state
  }

  const remainingMs = getRemainingMs(state, now, durations)

  return {
    ...state,
    status: 'running',
    startedAt: now,
    deadline: now + remainingMs,
    pausedRemainingMs: null,
    lastCompletedMode: null
  }
}

export function pauseTimer(
  state: TimerState,
  now: number,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): TimerState {
  if (state.status !== 'running') {
    return state
  }

  return {
    ...state,
    status: 'paused',
    startedAt: null,
    deadline: null,
    pausedRemainingMs: getRemainingMs(state, now, durations),
    lastCompletedMode: null
  }
}

export function resetTimer(): TimerState {
  return createInitialTimerState()
}

export function completeTimer(
  state: TimerState,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): TimerState {
  const completedMode = state.mode

  if (completedMode === 'focus') {
    const completedFocusSessions = state.completedFocusSessions + 1
    const nextMode: TimerMode = completedFocusSessions % 4 === 0 ? 'longBreak' : 'shortBreak'

    return {
      mode: nextMode,
      status: 'finished',
      focusRound: (completedFocusSessions % 4) + 1,
      completedFocusSessions,
      startedAt: null,
      deadline: null,
      pausedRemainingMs: getDurationForMode(nextMode, durations),
      lastCompletedMode: completedMode
    }
  }

  return {
    ...state,
    mode: 'focus',
    status: 'finished',
    startedAt: null,
    deadline: null,
    pausedRemainingMs: getDurationForMode('focus', durations),
    lastCompletedMode: completedMode
  }
}

export function skipTimer(
  state: TimerState,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): TimerState {
  return completeTimer(state, durations)
}

export function tickTimer(
  state: TimerState,
  now: number,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): TimerState {
  if (state.status !== 'running') {
    return state
  }

  if (getRemainingMs(state, now, durations) > 0) {
    return state
  }

  return completeTimer(state, durations)
}

export function toTimerSnapshot(
  state: TimerState,
  now: number,
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS
): TimerSnapshot {
  const totalMs = getDurationForMode(state.mode, durations)
  const remainingMs = getRemainingMs(state, now, durations)
  const elapsedMs = Math.max(0, totalMs - remainingMs)

  return {
    ...state,
    now,
    remainingMs,
    totalMs,
    progress: totalMs === 0 ? 1 : Math.min(1, elapsedMs / totalMs)
  }
}
