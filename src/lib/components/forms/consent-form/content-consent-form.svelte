<script lang="ts">
  import { goto } from '$app/navigation'
  import { browser } from '$app/env'
  import { isHttpError } from '@sveltejs/kit'
  import { toast } from 'svelte-sonner'
  import * as Sentry from '@sentry/sveltekit'
  import { CircleIcon } from '@lucide/svelte'

  import { contentConsent } from '$lib/remote/user/data.remote'
  import { track } from '$lib/analytics'
  import * as Field from '$lib/components/ui/field'
  import { Button } from '$lib/components/ui/button'
  import { schema } from '$lib/components/forms/consent-form'

  interface Props {
    redirect: string
  }

  const { redirect }: Props = $props()

  let { enhance, fields, preflight } = $derived(contentConsent)

  let submitting = $state(false)
</script>

<form
  class="w-full space-y-4"
  {...preflight(schema)}
  {...enhance(async ({ element, submit }: any) => {
    try {
      submitting = true
      const res = await submit()

      if (res) {
        track('accept_explicit_consent')
        element.reset()
        goto(redirect, { replaceState: true })
      }
    } catch (err) {
      Sentry.captureException(err)

      if (isHttpError(err)) {
        toast.error('Error!', { description: err.body.message })
      } else {
        toast.error('Error!', { description: 'Something, went wrong.' })
      }
    } finally {
      submitting = false
    }
  })}
>
  <Field.Group>
    <Field.Field orientation="horizontal">
      <input id="consent" {...fields.consent.as('checkbox')} disabled={submitting} />

      <Field.Content>
        <Field.Label for="consent">
          <span>I understand and wish to continue.</span>
        </Field.Label>

        <Field.Description></Field.Description>

        {#each fields.consent.issues() as issue, idx (idx)}
          <Field.Error>{issue.message}</Field.Error>
        {/each}
      </Field.Content>
    </Field.Field>

    <Field.Field>
      <div class="flex items-center justify-end gap-2">
        <Button
          variant="secondary"
          type="button"
          onclick={() => {
            if (browser) window.history.back()
          }}>Go Back</Button
        >

        <Button type="submit" disabled={!fields.consent.value() || submitting}>
          {#if submitting}
            <CircleIcon class="mr-2 size-6 animate-ping" />
          {/if}
          Submit
        </Button>
      </div>
    </Field.Field>
  </Field.Group>
</form>
