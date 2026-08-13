import * as v from 'valibot'

export const schema = v.object({
  consent: v.optional(v.boolean(), false),
})

export { default as ContentConsentForm } from './content-consent-form.svelte'
