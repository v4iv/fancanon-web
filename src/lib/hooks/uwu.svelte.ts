import { browser } from '$app/env'

export const uwuState = $state({
  enabled: false,
  initialized: false
})

export function initUwu(urlParam?: string | null) {
  if (!browser || uwuState.initialized) return

  if (urlParam !== undefined && urlParam !== null) {
    setUwu(urlParam === 'true')
  } else {
    const saved = localStorage.getItem('uwu')
    if (saved !== null) {
      uwuState.enabled = saved === 'true'
    }
  }

  uwuState.initialized = true
}

export function setUwu(val: boolean) {
  uwuState.enabled = val
  if (browser) {
    localStorage.setItem('uwu', String(val))
  }
}

export function toggleUwu() {
  setUwu(!uwuState.enabled)
}
