import { browser, dev } from '$app/env'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (
      command: 'config' | 'event' | 'js',
      target: string | Date,
      params?: Record<string, unknown>,
    ) => void
  }
}

export type AnalyticsEvent =
  | 'sign_up'
  | 'login'
  | 'forgot_password'
  | 'create_fandom'
  | 'create_story'
  | 'edit_story'
  | 'delete_story'
  | 'like_story'
  | 'add_to_reading_list'
  | 'create_chapter'
  | 'edit_chapter'
  | 'delete_chapter'
  | 'bookmark_chapter'
  | 'comment'
  | 'like_comment'
  | 'delete_comment'
  | 'follow'
  | 'unfollow'
  | 'search'
  | 'report_user'
  | 'report_story'
  | 'report_chapter'
  | 'report_comment'
  | 'shared'
  | 'shared_mobile'
  | 'shared_desktop'
  | 'started_narration'
  | 'accept_explicit_consent'
  | 'delete_history'
  | 'clear_history'

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  if (!browser || dev) return

  if (typeof window.gtag !== 'function') return

  window.gtag('event', event, params)
}
