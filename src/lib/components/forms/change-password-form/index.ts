import * as v from 'valibot'

export const schema = v.pipe(
  v.object({
    _currentPassword: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(8, 'Current Password should have at least 8 characters'),
      v.nonEmpty('Password is required'),
    ),
    _newPassword: v.pipe(
      v.string(),
      v.trim(),
      v.minLength(8, 'New Password must have at least 8 characters'),
      v.nonEmpty('Password is required'),
    ),
    _confirmPassword: v.pipe(v.string(), v.trim()),
  }),
  v.forward(
    v.partialCheck(
      [['_currentPassword'], ['_newPassword']],
      (input) => input._currentPassword !== input._newPassword,
      'New password cannot be the same as the current password.',
    ),
    ['_newPassword'],
  ),
  v.forward(
    v.partialCheck(
      [['_newPassword'], ['_confirmPassword']],
      (input) => input._newPassword === input._confirmPassword,
      'The two passwords do not match.',
    ),
    ['_confirmPassword'],
  ),
)

export { default as ChangePasswordForm } from './change-password-form.svelte'
