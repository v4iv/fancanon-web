import * as v from 'valibot'

import { containsRestrictedWord } from '$lib/utils'

export const schema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty('Name is required'),
      v.minLength(3, 'Name must have at least 3 characters'),
      v.maxLength(20, 'Name must be up to 20 characters'),
      v.regex(/^[a-zA-Z0-9 ]+$/, 'No special characters allowed!'),
      v.check((value) => !containsRestrictedWord(value), 'Contains prohibited language.'),
    ),
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
    email: v.pipe(
      v.string(),
      v.trim(),
      v.toLowerCase(),
      v.nonEmpty('Email is required'),
      v.email('Please enter a valid email.'),
      v.maxLength(254, 'Email is too long.'),
    ),
    _newPassword: v.pipe(
      v.string(),
      v.nonEmpty('Password is required'),
      v.minLength(8, 'Password must have at least 8 characters'),
      v.maxLength(72, 'Password must be 72 characters or fewer.'),
    ),
    _confirmPassword: v.pipe(
      v.string(),
      v.nonEmpty('Confirm Password is required'),
      v.minLength(8, 'Password must have at least 8 characters'),
      v.maxLength(72, 'Password must be 72 characters or fewer.'),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['_newPassword'], ['_confirmPassword']],
      (input) => input._newPassword === input._confirmPassword,
      'The two passwords do not match.',
    ),
    ['_confirmPassword'],
  ),
)

export { default as SignUpForm } from './sign-up-form.svelte'
