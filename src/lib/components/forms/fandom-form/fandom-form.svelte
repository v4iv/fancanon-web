<script lang="ts">
  import slug from 'slug'
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'
  import { isHttpError } from '@sveltejs/kit'
  import { CircleIcon } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { track } from '$lib/analytics'
  import { createNewFandom as form } from '$lib/remote/fandom/data.remote'
  import * as Field from '$lib/components/ui/field'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Textarea } from '$lib/components/ui/textarea'
  import { schema } from '$lib/components/forms/fandom-form'

  interface Props {
    categories: { id: string; name: string }[]
  }

  const { categories }: Props = $props()

  let { enhance, fields, preflight } = $derived(form)

  slug.charmap['/'] = '-'
  slug.charmap['&'] = '-'

  let slugifiedName = $derived(slug(fields.name.value() ?? ''))

  let submitting = $state(false)
</script>

<form
  class="space-y-4"
  {...preflight(schema)}
  {...enhance(async ({ element, submit }: any) => {
    try {
      submitting = true

      const res = await submit()

      if (res) {
        track('create_fandom', {
          name: fields.name.value(),
        })
        element.reset()
        slugifiedName = ''
        toast.success('Success!', { description: 'Fandom created successfully.' })
        goto('/stories/new')
      }
    } catch (err) {
      captureException(err)

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
    <Field.Field>
      <Field.Label>Category*</Field.Label>

      <select
        class="flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        {...fields.category.as('select')}
        disabled={submitting}
      >
        {#each categories as category, idx (idx)}
          <option value={category.id}>
            {category.name}
          </option>
        {/each}
      </select>

      <Field.Description></Field.Description>

      {#each fields.category.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Field.Label for="name">Name*</Field.Label>

      <Input
        id="name"
        placeholder="eg — Harry Potter"
        {...fields.name.as('text')}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields.name.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <Field.Field>
      <Field.Label for="slug">Slug*</Field.Label>

      <Input id="slug" value={slugifiedName} disabled />

      <Field.Description
        >This is for your reference only it's not editable, will be auto-generated based on the
        name.</Field.Description
      >

      <Field.Error></Field.Error>
    </Field.Field>

    <!-- Description -->
    <Field.Field>
      <Field.Label for="description">Description</Field.Label>

      <Textarea
        id="description"
        placeholder="eg — The Harry Potter franchise is a fantasy series ..."
        {...fields.description.as('text')}
        disabled={submitting}
      />

      <Field.Description></Field.Description>

      {#each fields.description.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>
  </Field.Group>

  <div class="flex justify-end gap-3 py-3">
    <Button type="submit" disabled={submitting}>
      {#if submitting}
        <CircleIcon class="mr-2 size-6 animate-ping" />
      {/if}
      Create
    </Button>
  </div>
</form>
