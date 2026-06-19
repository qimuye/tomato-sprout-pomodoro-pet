import { describe, expect, it } from 'vitest'
import {
  completeTimer,
  createInitialTimerState,
  getRemainingMs,
  pauseTimer,
  resetTimer,
  skipTimer,
  startTimer,
  tickTimer
} from './timer'
import type { TimerDurations } from './types'

const durations: TimerDurations = {
  focus: 1000,
  shortBreak: 200,
  longBreak: 400
}

describe('timer state machine', () => {
  it('starts a focus session with a deadline', () => {
    const state = startTimer(createInitialTimerState(), 100, durations)

    expect(state.status).toBe('running')
    expect(state.mode).toBe('focus')
    expect(state.deadline).toBe(1100)
  })

  it('pauses and resumes without losing remaining time', () => {
    const running = startTimer(createInitialTimerState(), 100, durations)
    const paused = pauseTimer(running, 400, durations)
    const resumed = startTimer(paused, 900, durations)

    expect(paused.status).toBe('paused')
    expect(paused.pausedRemainingMs).toBe(700)
    expect(resumed.deadline).toBe(1600)
  })

  it('moves from focus to short break on deadline', () => {
    const running = startTimer(createInitialTimerState(), 0, durations)
    const finished = tickTimer(running, 1000, durations)

    expect(finished.status).toBe('finished')
    expect(finished.mode).toBe('shortBreak')
    expect(finished.completedFocusSessions).toBe(1)
    expect(finished.focusRound).toBe(2)
    expect(getRemainingMs(finished, 1000, durations)).toBe(200)
  })

  it('enters long break after four completed focus sessions', () => {
    let state = createInitialTimerState()

    for (let index = 0; index < 4; index += 1) {
      state = completeTimer({ ...state, mode: 'focus' }, durations)
      if (index < 3) {
        state = skipTimer(state, durations)
      }
    }

    expect(state.mode).toBe('longBreak')
    expect(state.focusRound).toBe(1)
    expect(state.completedFocusSessions).toBe(4)
  })

  it('returns to focus after a break finishes', () => {
    const focusDone = completeTimer(createInitialTimerState(), durations)
    const breakDone = completeTimer(focusDone, durations)

    expect(breakDone.mode).toBe('focus')
    expect(breakDone.status).toBe('finished')
    expect(breakDone.completedFocusSessions).toBe(1)
  })

  it('reset returns to the initial state', () => {
    expect(resetTimer()).toEqual(createInitialTimerState())
  })
})
