import * as v from 'valibot'

import { containsRestrictedWord } from '$lib/utils'

export const updateNameFormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Name is required'),
    v.minLength(3, 'Name must have at least 3 characters'),
    v.maxLength(20, 'Name must be up to 20 characters'),
    v.regex(/^[a-zA-Z0-9 ]+$/, 'No special characters allowed!'),
    v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
  ),
})

export const updateUsernameFormSchema = v.object({
  username: v.pipe(
    v.string(),
    v.trim(),
    v.toLowerCase(),
    v.nonEmpty('Username is required'),
    v.minLength(3, 'Username must have at least 3 characters'),
    v.maxLength(20, 'Username must be up to 20 characters'),
    v.regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, _ & . allowed!'),
    v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
  ),
})

export const updateEmailFormSchema = v.object({
  newEmail: v.pipe(
    v.string(),
    v.trim(),
    v.toLowerCase(),
    v.nonEmpty('Email is required'),
    v.email('Please enter a valid email.'),
    v.maxLength(254, 'Email is too long.'),
  ),
})

export { default as UpdateNameForm } from './update-name-form.svelte'
export { default as UpdateUsernameForm } from './update-username-form.svelte'
export { default as UpdateEmailForm } from './update-email-form.svelte'
