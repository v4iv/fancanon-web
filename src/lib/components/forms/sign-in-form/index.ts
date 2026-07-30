import * as v from 'valibot'

export const schema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.toLowerCase(),
    v.nonEmpty('Email is required'),
    v.email('Please enter a valid email.'),
  ),
  _password: v.pipe(v.string(), v.nonEmpty('Password is required')),
})

export { default as SignInForm } from './sign-in-form.svelte'
