import type { PetPomodoroApi } from '../shared/types'

declare global {
  interface Window {
    petPomodoro: PetPomodoroApi
  }
}

export {}
