<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { isHttpError, type RemoteForm } from '@sveltejs/kit'
  import * as Sentry from '@sentry/sveltekit'
  import { CircleIcon } from '@lucide/svelte'

  import { REASONS } from '$lib/constants'
  import { track } from '$lib/analytics'
  import * as Field from '$lib/components/ui/field'
  import * as RadioGroup from '$lib/components/ui/radio-group'
  import { Button } from '$lib/components/ui/button'
  import { Textarea } from '$lib/components/ui/textarea'
  import { reportStorySchema } from '$lib/components/forms/reporting-forms'

  interface Props {
    form: RemoteForm<any, any>
    storyId: string
    onOpenChange: () => boolean
  }

  const { form, storyId, onOpenChange }: Props = $props()

  let reportStoryForm = $derived(form.for(storyId))

  let { enhance, fields, preflight } = $derived(reportStoryForm)

  let reason = $state('')

  let submitting = $state(false)
</script>

<form
  class="space-y-4"
  {...preflight(reportStorySchema)}
  {...enhance(async ({ element, submit }: any) => {
    try {
      submitting = true

      const res = await submit()

      if (res) {
        track('report_story', {
          reason: fields.reason.value(),
        })
        element.reset()
        toast('Success!', { description: 'Reported successfully!' })
        onOpenChange()
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
    <!-- Hidden Fields -->
    <input {...fields.reason.as('hidden', reason)} />
    <input {...fields.storyId.as('hidden', storyId)} />

    <!-- Reason -->
    <Field.Set>
      <Field.Legend>Reason*</Field.Legend>

      <Field.Description>
        Select one reason you think most closely describes the violation.
      </Field.Description>

      <RadioGroup.Root bind:value={reason} disabled={submitting} required>
        {#each REASONS as option, idx (idx)}
          <Field.Field orientation="horizontal">
            <RadioGroup.Item value={option} />

            <Field.Label class="capitalize">{option}</Field.Label>
          </Field.Field>
        {/each}
      </RadioGroup.Root>

      {#each fields.reason.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Set>

    <!-- Description -->
    <Field.Field>
      <Field.Label for="description">Description*</Field.Label>

      <Textarea
        id="description"
        placeholder=""
        {...fields.description.as('text')}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields.description.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>
  </Field.Group>

  <div class="flex justify-end gap-3 py-3">
    <Button type="button" variant="secondary" disabled={submitting} onclick={onOpenChange}
      >Cancel</Button
    >

    <Button type="submit" disabled={submitting}>
      {#if submitting}
        <CircleIcon class="mr-2 size-6 animate-ping" />
      {/if}
      Submit
    </Button>
  </div>
</form>
