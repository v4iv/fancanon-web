import * as v from 'valibot'

export const schema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.email('Please enter a valid email.'),
    v.nonEmpty('Email is required'),
  ),
})

export { default as ForgotPasswordForm } from './forgot-password-form.svelte'
