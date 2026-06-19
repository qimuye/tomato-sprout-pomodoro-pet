import './styles.css'
import type { PetAnimationState, TimerMode, TimerSnapshot, TimerStatus, WindowBounds } from '../shared/types'

const modeLabels: Record<TimerMode, string> = {
  focus: '专注',
  shortBreak: '短休息',
  longBreak: '长休息'
}

const statusLabels: Record<TimerStatus, string> = {
  idle: '待命',
  running: '进行中',
  paused: '暂停',
  finished: '完成'
}

const hoverLines = [
  { text: '别调戏我，番茄会害羞。', animation: 'waving' },
  { text: '好好工作，我在旁边盯番茄。', animation: 'review' },
  { text: '摸鱼被我发现啦。', animation: 'jumping' },
  { text: '戳我可以，别忘了专注。', animation: 'waiting' },
  { text: '我眨一下，你继续。', animation: 'idle' }
] satisfies Array<{ text: string; animation: PetAnimationState }>

const focusStartLines = [
  '开干了，番茄芽团就位。',
  '撸起袖子吧，我陪你冲一轮。',
  '进入专注，小芽开始计时。',
  '把注意力收回来，轻轻开始。'
]

const breakStartLines = [
  '休息一下，眼睛也要喘口气。',
  '喝口水吧，小番茄批准了。',
  '站起来伸个懒腰，我守着时间。',
  '短休息到，先离开屏幕一小会儿。'
]

const focusDoneLines = [
  '休息了，做得不错。',
  '这一颗番茄熟啦，喝水去。',
  '专注完成，起来抖抖肩。',
  '番茄收工，给脑袋放个假。'
]

const breakDoneLines = [
  '开干了，小芽回到岗位。',
  '休息结束，慢慢进入下一轮。',
  '撸起袖子吧，番茄二号准备。',
  '回来啦，我们继续。'
]

const petShell = document.querySelector<HTMLElement>('#pet-shell')
const petHitbox = document.querySelector<HTMLElement>('#pet-hitbox')
const petImage = document.querySelector<HTMLImageElement>('#pet-image')
const headZone = document.querySelector<HTMLButtonElement>('#head-zone')
const bodyZone = document.querySelector<HTMLButtonElement>('#body-zone')
const statusBubble = document.querySelector<HTMLElement>('#status-bubble')
const speechBubble = document.querySelector<HTMLElement>('#speech-bubble')
const modeLabel = document.querySelector<HTMLElement>('#mode-label')
const timeLabel = document.querySelector<HTMLElement>('#time-label')
const progressFill = document.querySelector<HTMLElement>('#progress-fill')
const roundLabel = document.querySelector<HTMLElement>('#round-label')
const statusLabel = document.querySelector<HTMLElement>('#status-label')
const primaryAction = document.querySelector<HTMLButtonElement>('#primary-action')
const skipAction = document.querySelector<HTMLButtonElement>('#skip-action')
const resetAction = document.querySelector<HTMLButtonElement>('#reset-action')

if (
  !petShell ||
  !petHitbox ||
  !petImage ||
  !headZone ||
  !bodyZone ||
  !statusBubble ||
  !speechBubble ||
  !modeLabel ||
  !timeLabel ||
  !progressFill ||
  !roundLabel ||
  !statusLabel ||
  !primaryAction ||
  !skipAction ||
  !resetAction
) {
  throw new Error('Renderer markup is incomplete.')
}

let currentState: TimerSnapshot | null = null
let previousState: TimerSnapshot | null = null
let timerInfoOpen = false
let dragging = false
let dragMoved = false
let activePointerZone: 'head' | 'body' | 'pet' | null = null
let dragDirection: 'left' | 'right' = 'right'
let speechText = ''
let animationOverride: PetAnimationState | null = null
let speechTimeout: number | null = null
let bodySpeechReadyAt = 0
let timerInfoHideTimeout: number | null = null
let dragStart: {
  screenX: number
  screenY: number
  bounds: WindowBounds
} | null = null
let optimisticTick: number | null = null

const petImageByAnimation: Record<PetAnimationState, string> = {
  idle: './pets/tomato-sprout/states/idle.svg',
  running: './pets/tomato-sprout/states/running.svg',
  waving: './pets/tomato-sprout/states/waving.svg',
  jumping: './pets/tomato-sprout/states/jumping.svg',
  failed: './pets/tomato-sprout/states/failed.svg',
  waiting: './pets/tomato-sprout/states/waiting.svg',
  review: './pets/tomato-sprout/states/review.svg',
  'running-left': './pets/tomato-sprout/states/running-left.svg',
  'running-right': './pets/tomato-sprout/states/running-right.svg'
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getPetAnimation(state: TimerSnapshot | null): PetAnimationState {
  if (animationOverride && !dragging) {
    return animationOverride
  }

  if (dragging) {
    return dragDirection === 'left' ? 'running-left' : 'running-right'
  }

  if (timerInfoOpen) {
    return 'review'
  }

  if (!state) {
    return 'idle'
  }

  if (state.status === 'paused') {
    return 'waiting'
  }

  if (state.status === 'finished') {
    return 'jumping'
  }

  if (state.status === 'running') {
    return state.mode === 'focus' ? 'running' : 'waving'
  }

  return 'idle'
}

function render(state: TimerSnapshot | null = currentState): void {
  currentState = state

  if (state) {
    modeLabel.textContent = modeLabels[state.mode]
    timeLabel.textContent = formatRemaining(state.remainingMs)
    roundLabel.textContent = `第 ${state.focusRound}/4 轮`
    statusLabel.textContent = statusLabels[state.status]
    progressFill.style.width = `${Math.round(state.progress * 100)}%`
    primaryAction.textContent = state.status === 'running' ? '暂停' : '开始'
  }

  speechBubble.textContent = speechText
  const animation = getPetAnimation(state)
  petShell.dataset.animation = animation
  if (petImage.dataset.animation !== animation) {
    petImage.src = petImageByAnimation[animation]
    petImage.dataset.animation = animation
  }
  petShell.classList.toggle('show-timer', timerInfoOpen)
  petShell.classList.toggle('is-dragging', dragging)
  petShell.classList.toggle('has-speech', speechText.length > 0)
}

async function refreshState(): Promise<void> {
  render(await window.petPomodoro.timer.getState())
}

async function handlePrimaryAction(): Promise<void> {
  if (currentState?.status === 'running') {
    render(await window.petPomodoro.timer.pause())
    return
  }

  render(await window.petPomodoro.timer.start())
}

function pickLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}

function pickHoverLine(): { text: string; animation: PetAnimationState } {
  return hoverLines[Math.floor(Math.random() * hoverLines.length)]
}

function getPointerZone(target: EventTarget | null): 'head' | 'body' | 'pet' {
  if (!(target instanceof Element)) {
    return 'pet'
  }

  if (target.closest('#head-zone')) {
    return 'head'
  }

  if (target.closest('#body-zone')) {
    return 'body'
  }

  return 'pet'
}

function speak(text: string, animation: PetAnimationState = 'waving', durationMs = 3600): void {
  if (speechTimeout !== null) {
    window.clearTimeout(speechTimeout)
  }

  setTimerInfoOpen(false, 0)
  speechText = text
  animationOverride = animation
  render()

  speechTimeout = window.setTimeout(() => {
    speechText = ''
    animationOverride = null
    speechTimeout = null
    render()
  }, durationMs)
}

function speakPlayful(force = false): void {
  const now = Date.now()

  if (!force && now < bodySpeechReadyAt) {
    return
  }

  const line = pickHoverLine()
  speak(line.text, line.animation, 3200)
  bodySpeechReadyAt = now + (force ? 900 : 5200)
}

function setTimerInfoOpen(open: boolean, delayMs = 120): void {
  if (timerInfoHideTimeout !== null) {
    window.clearTimeout(timerInfoHideTimeout)
    timerInfoHideTimeout = null
  }

  if (open) {
    timerInfoOpen = true
    speechText = ''
    animationOverride = null
    render()
    return
  }

  timerInfoHideTimeout = window.setTimeout(() => {
    timerInfoOpen = false
    timerInfoHideTimeout = null
    render()
  }, delayMs)
}

function handleTimerMoment(state: TimerSnapshot): void {
  if (!previousState) {
    previousState = state
    return
  }

  const completedByTick = previousState.status === 'running' && state.status === 'finished'
  const startedNextMode = previousState.status !== 'running' && state.status === 'running'

  if (completedByTick) {
    if (state.lastCompletedMode === 'focus') {
      speak(pickLine(focusDoneLines), 'jumping', 5200)
    } else {
      speak(pickLine(breakDoneLines), 'jumping', 5200)
    }
  } else if (startedNextMode) {
    if (state.mode === 'focus') {
      speak(pickLine(focusStartLines), 'running', 4200)
    } else {
      speak(pickLine(breakStartLines), 'waving', 4200)
    }
  }

  previousState = state
}

function startOptimisticClock(): void {
  optimisticTick = window.setInterval(() => {
    if (!currentState || currentState.status !== 'running') {
      return
    }

    const now = Date.now()
    const remainingMs = currentState.deadline === null ? currentState.remainingMs : Math.max(0, currentState.deadline - now)
    const elapsedMs = Math.max(0, currentState.totalMs - remainingMs)

    render({
      ...currentState,
      now,
      remainingMs,
      progress: currentState.totalMs === 0 ? 1 : Math.min(1, elapsedMs / currentState.totalMs)
    })
  }, 250)
}

headZone.addEventListener('pointerenter', () => {
  setTimerInfoOpen(true)
})

headZone.addEventListener('pointerleave', () => {
  setTimerInfoOpen(false)
})

statusBubble.addEventListener('pointerenter', () => {
  setTimerInfoOpen(true)
})

statusBubble.addEventListener('pointerleave', () => {
  setTimerInfoOpen(false)
})

bodyZone.addEventListener('click', () => {
  speakPlayful(true)
})

bodyZone.addEventListener('pointerenter', () => {
  speakPlayful(false)
})

petHitbox.addEventListener('pointerdown', async (event) => {
  if (event.button !== 0) {
    return
  }

  petHitbox.setPointerCapture(event.pointerId)
  dragging = true
  dragMoved = false
  activePointerZone = getPointerZone(event.target)
  dragStart = {
    screenX: event.screenX,
    screenY: event.screenY,
    bounds: await window.petPomodoro.pet.getBounds()
  }
  render()
})

petHitbox.addEventListener('pointermove', (event) => {
  if (!dragging || !dragStart) {
    return
  }

  const deltaX = event.screenX - dragStart.screenX
  const deltaY = event.screenY - dragStart.screenY
  dragDirection = deltaX < 0 ? 'left' : 'right'
  dragMoved = dragMoved || Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4

  window.petPomodoro.pet.setPosition({
    x: dragStart.bounds.x + deltaX,
    y: dragStart.bounds.y + deltaY
  })
  render()
})

petHitbox.addEventListener('pointerup', (event) => {
  if (petHitbox.hasPointerCapture(event.pointerId)) {
    petHitbox.releasePointerCapture(event.pointerId)
  }

  dragging = false
  if (!dragMoved && activePointerZone === 'body') {
    speakPlayful(true)
  }

  activePointerZone = null
  dragMoved = false
  dragStart = null
  render()
})

petHitbox.addEventListener('contextmenu', (event) => {
  event.preventDefault()
  window.petPomodoro.pet.showContextMenu()
})

primaryAction.addEventListener('click', () => {
  void handlePrimaryAction()
})

skipAction.addEventListener('click', async () => {
  render(await window.petPomodoro.timer.skip())
})

resetAction.addEventListener('click', async () => {
  render(await window.petPomodoro.timer.reset())
})

window.petPomodoro.onTimerState((state) => {
  handleTimerMoment(state)
  render(state)
})

window.addEventListener('beforeunload', () => {
  if (optimisticTick !== null) {
    window.clearInterval(optimisticTick)
  }

  if (timerInfoHideTimeout !== null) {
    window.clearTimeout(timerInfoHideTimeout)
  }
})

void refreshState()
startOptimisticClock()
