import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createId } from '@paralleldrive/cuid2'
import { text } from 'drizzle-orm/pg-core'

import { CHARACTER_COUNTED_LANGUAGES, LEETSPEAK_MAP, RESTRICTED_WORDS } from '$lib/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null }

export function getTimeframeDuration(timeframe: string): number {
  const durations: Record<string, number> = {
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 30,
    year: 1000 * 60 * 60 * 24 * 365,
  }
  return durations[timeframe] ?? 0
}

export function containsRestrictedWord(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[0123456789@$!+]/g, (char) => LEETSPEAK_MAP[char] ?? char)

  const words = normalized.match(/\p{L}+/gu) ?? []

  return words.some((word) => RESTRICTED_WORDS.has(word))
}

export function computeWordCount(content: string, language: string): number {
  const normalized = language.trim().toLowerCase()
  return CHARACTER_COUNTED_LANGUAGES.has(normalized)
    ? content.length
    : content.trim().split(/\s+/).filter(Boolean).length
}

export const cuid = (name = 'id') => text(name).$defaultFn(createId).primaryKey()
