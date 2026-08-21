<script lang="ts">
  import { toast } from 'svelte-sonner'
  import { goto } from '$app/navigation'
  import { BASE_API_URL } from '$app/env/public'
  import { isHttpError, type RemoteForm } from '@sveltejs/kit'
  import { useQueryClient } from '@tanstack/svelte-query'
  import { CircleAlertIcon, CircleIcon } from '@lucide/svelte'
  import { captureException } from '@sentry/sveltekit'

  import { ContentRating, Languages } from '$lib/constants'
  import { track } from '$lib/analytics'
  import * as Field from '$lib/components/ui/field'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Switch } from '$lib/components/ui/switch'
  import { AsyncCombobox } from '$lib/components/async-combobox'
  import { TagsInput, type TagsInputProps } from '$lib/components/ui/tags-input'
  import { schema } from '$lib/components/forms/story-form'

  interface Props {
    form: RemoteForm<any, any>
    warnings: string[]
    editing?: boolean
    currentData?: {
      title: string
      description?: string
      contentRating: string
      language: string
      fandoms: { id: string; name: string }[]
      tags: { name: string; type: string }[]
      completed: boolean
    }
  }

  const { form, editing = false, currentData, warnings }: Props = $props()

  let { enhance, fields, preflight } = $derived(form)

  const client = useQueryClient()

  let fandoms: { label: string; value: string }[] = $state(
    // svelte-ignore state_referenced_locally
    currentData?.fandoms.map((f) => ({ label: f.name, value: f.id })) ?? [],
  )

  function groupTagsByType(tags: { name: string; type: string }[] = []) {
    return {
      relationships: tags.filter((t) => t.type === 'RELATIONSHIP').map((t) => t.name),
      characters: tags.filter((t) => t.type === 'CHARACTER').map((t) => t.name),
      warnings: tags.filter((t) => t.type === 'WARNING').map((t) => t.name),
      freeform: tags
        .filter((t) => t.type === 'FREEFORM' || t.type === 'FANDOM_FREEFORM')
        .map((t) => t.name),
    }
  }

  // svelte-ignore state_referenced_locally
  const initialTags = groupTagsByType(currentData?.tags)

  // svelte-ignore state_referenced_locally
  let relationshipTags: string[] = $state(initialTags.relationships)
  // svelte-ignore state_referenced_locally
  let characterTags: string[] = $state(initialTags.characters)
  // svelte-ignore state_referenced_locally
  let freeformTags: string[] = $state(initialTags.freeform)
  // svelte-ignore state_referenced_locally
  let warningTags: string[] = $state(initialTags.warnings)
  // svelte-ignore state_referenced_locally
  let completed: boolean = $state(currentData?.completed ?? false)

  // svelte-ignore state_referenced_locally
  if (editing && currentData) {
    fields.set({
      ...currentData,
      fandoms,
      warningTags,
      freeformTags,
      characterTags,
      relationshipTags,
    })
  }

  const validateTags: TagsInputProps['validate'] = (val, ts) => {
    // trim and convert to lowercase
    const transformed = val.trim().toLowerCase()
    // disallow empties
    if (transformed.length === 0) return undefined
    // disallow duplicates
    if (ts.find((t) => transformed === t.toLowerCase())) return undefined
    return transformed
  }

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
        if (editing) {
          track('edit_story', {
            title: fields.title.value(),
            completed: fields.completed.value(),
          })
        } else {
          track('create_story', {
            title: fields.title.value(),
          })
        }
        fandoms = []
        freeformTags = []
        characterTags = []
        relationshipTags = []
        element.reset()
        client.invalidateQueries()
        toast('Success!', { description: 'Form submitted successfully.' })

        if (editing) goto(`/stories/${form.result.story.id}`)
        else goto(`/stories/${form.result.story.id}/chapters/new`)
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
    <!-- Fandoms -->
    <Field.Field>
      <Field.Label for="title">Fandom(s)</Field.Label>

      <AsyncCombobox
        disabled={submitting}
        allowCreate
        bind:value={fandoms}
        createFormPath="/fandoms/new"
        createActionLabel="Add New Fandom"
        searchAPI={`${BASE_API_URL}/v1/fandoms/search?q`}
        placeholder="Select one or more fandoms..."
      />

      <input id="fandoms" {...fields.fandoms.as('hidden', JSON.stringify(fandoms))} />

      <Field.Description>
        If you don't see the fandom you're looking for, you can add it by clicking the "Add New
        Fandom" button. If no fandom is selected, it'll be marked as "Original Content".
      </Field.Description>

      {#each fields.fandoms.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <!-- Title -->
    <Field.Field>
      <Field.Label for="title">Title*</Field.Label>

      <Input
        id="title"
        placeholder=""
        {...fields.title.as('text')}
        disabled={submitting}
        required
      />

      <Field.Description></Field.Description>

      {#each fields.title.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

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

      <Field.Description>
        A short summary to help readers decide if this story is for them. Avoid major spoilers.
      </Field.Description>

      {#each fields.description.issues() as issue, idx (idx)}
        <Field.Error>{issue.message}</Field.Error>
      {/each}
    </Field.Field>

    <div class="grid grid-cols-1 items-start justify-between gap-2 md:grid-cols-2">
      <Field.Field>
        <Field.Label>Content Rating*</Field.Label>

        <select
          class="w-full border border-input bg-background dark:bg-input/30"
          {...fields.contentRating.as('select')}
          disabled={submitting}
          required
        >
          {#each Object.entries(ContentRating) as [value, label] (value)}
            <option {value}>
              {label}
            </option>
          {/each}
        </select>

        <Field.Description>
          Choose the rating that best fits your story's most mature content:
        </Field.Description>
        <Field.Description>
          General: suitable for all audiences, no violence or sexual content.
        </Field.Description>
        <Field.Description>
          Teen: some violence, language, or romantic themes; nothing explicit.
        </Field.Description>
        <Field.Description>
          Mature: strong language, intense violence, or non-explicit sexual content.
        </Field.Description>
        <Field.Description>
          Explicit: graphic sexual content and/or extreme violence.
        </Field.Description>
        <Field.Description>
          Rate for your story's most intense scene, not its average tone.
        </Field.Description>

        {#each fields.contentRating.issues() as issue, idx (idx)}
          <Field.Error>{issue.message}</Field.Error>
        {/each}
      </Field.Field>

      <Field.Field>
        <Field.Label>Language*</Field.Label>

        <select
          class="w-full border border-input bg-background dark:bg-input/30"
          {...fields.language.as('select')}
          disabled={submitting}
          required
        >
          {#each Object.entries(Languages) as [value, label] (value)}
            <option value={label}>
              {label === 'other'
                ? 'Other (please mention the language in the tags)'
                : label.toLocaleUpperCase()}
            </option>
          {/each}
        </select>

        <Field.Description></Field.Description>

        {#each fields.langugage.issues() as issue, idx (idx)}
          <Field.Error>{issue.message}</Field.Error>
        {/each}
      </Field.Field>
    </div>

    <!-- Tags -->
    <Field.Group>
      <Field.Set>
        <Field.Legend>Tags</Field.Legend>

        <Field.Separator />

        <Field.Field>
          <Field.Label>Relationships</Field.Label>

          <TagsInput
            bind:value={relationshipTags}
            placeholder="e.g. — hitagi senjougahara / kurisu makise"
            validate={validateTags}
            disabled={submitting}
            fetchSuggestions={async (q) => {
              const res = await fetch(
                `/api/tags/search?q=${encodeURIComponent(q)}&type=RELATIONSHIP`,
              )
              return res.json()
            }}
          />

          <input
            id="relationshipTags"
            {...fields.relationshipTags.as('hidden', JSON.stringify(relationshipTags))}
          />

          <Field.Description>
            Use the format "name 1 / name 2" for romantic pairings, or "name 1 & name 2" for
            platonic/familial.
          </Field.Description>

          {@render tagIssues('[Relationships]')}
        </Field.Field>

        <Field.Field>
          <Field.Label>Characters</Field.Label>

          <TagsInput
            bind:value={characterTags}
            placeholder="e.g. — harry potter"
            validate={validateTags}
            disabled={submitting}
            fetchSuggestions={async (q) => {
              const res = await fetch(`/api/tags/search?q=${encodeURIComponent(q)}&type=CHARACTER`)
              return res.json()
            }}
          />

          <input
            id="characterTags"
            {...fields.characterTags.as('hidden', JSON.stringify(characterTags))}
          />

          <Field.Description>
            List the characters featured in your story, one at a time.
          </Field.Description>

          {@render tagIssues('[Characters]')}
        </Field.Field>

        <Field.Field>
          <Field.Label>Additional Tags</Field.Label>

          <TagsInput
            bind:value={freeformTags}
            placeholder="Enter tags e.g. — action, adventure, fantasy"
            validate={validateTags}
            disabled={submitting}
            fetchSuggestions={async (q) => {
              const res = await fetch(`/api/tags/search?q=${encodeURIComponent(q)}&type=FREEFORM`)
              return res.json()
            }}
          />

          <input
            id="characterTags"
            {...fields.freeformTags.as('hidden', JSON.stringify(freeformTags))}
          />

          <Field.Description>All tags will be transformed into lowercase.</Field.Description>

          {@render tagIssues('[Additional Tags]')}
        </Field.Field>

        <!-- Warning Tags -->
        <Field.Group class="rounded-xl border border-input p-5">
          <Field.Set>
            <Field.Legend class="flex items-center gap-2">
              <CircleAlertIcon class="size-4 text-destructive" />WARNINGS
            </Field.Legend>

            <Field.Separator />

            <Field.Description>
              Select any warnings that apply to your story. If you're unsure whether a warning
              applies, include it, under-warning is a policy violation.
            </Field.Description>

            <Field.Description>
              Note on "Underage": this warns for stories involving characters under 18 in situations
              covered by our content policy (e.g. romantic relationships, non-graphic references).
              It does not permit sexually explicit content involving underage characters under any
              circumstances, regardless of fictional context or how the story is tagged. Content of
              this nature will be removed and may result in account action. See our <a
                href="/content-policy">Content Policy</a
              >
              for full details.
            </Field.Description>

            <Field.Separator />

            {#each warnings as warning, idx (idx)}
              <Field.Field orientation="horizontal">
                <Field.Label class="capitalize">
                  <input
                    {...fields.warningTags.as('checkbox', warning)}
                    checked={warningTags.includes(warning)}
                  />
                  {warning}
                </Field.Label>
              </Field.Field>
            {/each}

            {@render tagIssues('[Warnings]')}
          </Field.Set>
        </Field.Group>
      </Field.Set>
    </Field.Group>

    {#if editing}
      <Field.Field orientation="horizontal">
        <Field.Content>
          <Field.Label for="completed">Story Completed</Field.Label>

          <Field.Description>
            Mark the story as completed. This is just for readers' convenience, you may still add
            more chapters.
          </Field.Description>
        </Field.Content>

        <Switch id="completed" name="completed" bind:checked={completed} disabled={submitting} />

        <input {...fields.completed.as('hidden', completed)} />
        {#each fields.completed.issues() as issue, idx (idx)}
          <Field.Error>{issue.message}</Field.Error>
        {/each}
      </Field.Field>
    {/if}
  </Field.Group>

  <div class="flex justify-end gap-3 py-3">
    <Button type="submit" disabled={submitting}>
      {#if submitting}
        <CircleIcon class="mr-2 size-6 animate-ping" />
      {/if}
      {#if editing}
        Publish Changes
      {:else}
        Proceed to First Chapter
      {/if}
    </Button>
  </div>
</form>

<!-- TODO: Fix this stop gap error list with something robust  -->
{#snippet tagIssues(prefix: string)}
  {#each fields
    .allIssues()
    ?.filter((issue) => issue.message.startsWith(prefix)) as issue, idx (idx)}
    <Field.Error>{issue.message.slice(prefix.length).trim()}</Field.Error>
  {/each}
{/snippet}
