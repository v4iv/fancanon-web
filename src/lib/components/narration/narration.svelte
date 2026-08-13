<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { afterNavigate } from '$app/navigation'
  import { unified } from 'unified'
  import remarkParse from 'remark-parse'
  import remarkGfm from 'remark-gfm'
  import { toString as mdastToString } from 'mdast-util-to-string'
  import { Pause, Play, Repeat, Speech, Square } from '@lucide/svelte'

  import { track } from '$lib/analytics'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as Popover from '$lib/components/ui/popover'
  import * as Tooltip from '$lib/components/ui/tooltip'
  import { Languages } from '$lib/constants'

  interface Props {
    text: string
    language: Languages | string
  }

  let { text, language }: Props = $props()

  // Maps our internal language keys to BCP-47 tags for SpeechSynthesisUtterance.
  // Using the generic 2-letter form (rather than e.g. 'en-US') lets the OS/browser
  // pick whichever regional voice it has installed, which is more robust across
  // Android devices than hardcoding a region.
  const SPEECH_LANG_MAP: Partial<Record<Languages, string>> = {
    [Languages.english]: 'en',
    [Languages.espanol]: 'es',
    [Languages.french]: 'fr',
  }

  let synth: SpeechSynthesis | undefined
  let utterance: SpeechSynthesisUtterance
  let isSpeaking = $state(false)
  let isPaused = $state(false)
  let isSupported = $state(false)

  // Parser is stateless and cheap to reuse across calls.
  const mdProcessor = unified().use(remarkParse).use(remarkGfm)

  onMount(() => {
    // Guard: some WebViews (Android WebView, some in-app browsers) don't
    // implement the Web Speech API at all, so `speechSynthesis` can be
    // a ReferenceError, not just an unsupported/no-op object.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synth = window.speechSynthesis
      isSupported = true
    }
  })

  function sanitizeForSpeech(input: string): string {
    if (!input) return ''

    try {
      const tree = mdProcessor.parse(input)
      const plain = mdastToString(tree, { includeImageAlt: true })
      return plain.replace(/\s+/g, ' ').trim()
    } catch (err) {
      // Never let a parse failure break narration entirely.
      console.error('Failed to sanitize markdown for speech:', err)
      return input.replace(/\s+/g, ' ').trim()
    }
  }

  function startReading() {
    if (!synth || !speechLang) return

    track('started_narration', { language })

    if (synth.speaking) {
      synth.cancel() // stop any current speech
    }

    const cleanText = sanitizeForSpeech(text)
    if (!cleanText) return

    utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = speechLang
    utterance.onend = () => {
      isSpeaking = false
      isPaused = false
    }

    synth.speak(utterance)
    isSpeaking = true
    isPaused = false
  }

  function pauseReading() {
    if (synth?.speaking && !synth.paused) {
      synth.pause()
      isPaused = true
    }
  }

  function resumeReading() {
    if (synth?.paused) {
      synth.resume()
      isPaused = false
    }
  }

  function restartReading() {
    synth?.cancel()
    startReading()
  }

  function stopReading() {
    synth?.cancel()
    isSpeaking = false
    isPaused = false
  }

  // Cleanup on unmount or navigation change
  onDestroy(() => {
    synth?.cancel()
    isSpeaking = false
    isPaused = false
  })
  afterNavigate(() => {
    synth?.cancel()
    isSpeaking = false
    isPaused = false
  })

  let speechLang = $derived(SPEECH_LANG_MAP[language as Languages])
  let isNarratable = $derived(Boolean(speechLang))
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <Popover.Root>
      <Popover.Trigger
        class={buttonVariants({ variant: !isSpeaking ? 'outline' : 'default', size: 'icon' })}
      >
        <Speech />
        <span class="sr-only">Narration</span>
      </Popover.Trigger>

      <Popover.Content class="w-40">
        {#if !isSupported}
          <p><strong>Narration</strong> isn't supported in this browser.</p>
        {:else if isNarratable}
          <div class="flex items-center justify-center gap-2">
            {#if !isSpeaking}
              <Tooltip.Root>
                <Tooltip.Trigger
                  disabled={!isSupported}
                  onclick={startReading}
                  class={buttonVariants({
                    variant: 'outline',
                    size: 'icon',
                    class: 'rounded-full',
                  })}
                >
                  <Play />
                  <span class="sr-only">Start Narration</span>
                </Tooltip.Trigger>

                <Tooltip.Content>
                  <p>Start Narration</p>
                </Tooltip.Content>
              </Tooltip.Root>
            {:else}
              {#if isPaused}
                <Tooltip.Root>
                  <Tooltip.Trigger
                    onclick={resumeReading}
                    class={buttonVariants({
                      variant: 'outline',
                      size: 'icon',
                      class: 'rounded-full',
                    })}
                  >
                    <Play />
                    <span class="sr-only">Resume Narration</span>
                  </Tooltip.Trigger>

                  <Tooltip.Content>
                    <p>Resume Narration</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              {:else}
                <Tooltip.Root>
                  <Tooltip.Trigger
                    onclick={pauseReading}
                    class={buttonVariants({
                      variant: 'default',
                      size: 'icon',
                      class: 'rounded-full',
                    })}
                  >
                    <Pause />
                    <span class="sr-only">Pause Narration</span>
                  </Tooltip.Trigger>

                  <Tooltip.Content>
                    <p>Pause Narration</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              {/if}
              <Tooltip.Root>
                <Tooltip.Trigger
                  onclick={restartReading}
                  class={buttonVariants({
                    variant: 'outline',
                    size: 'icon',
                    class: 'rounded-full',
                  })}
                >
                  <Repeat />
                  <span class="sr-only">Restart Narration</span>
                </Tooltip.Trigger>

                <Tooltip.Content>
                  <p>Restart Narration</p>
                </Tooltip.Content>
              </Tooltip.Root>
            {/if}

            <Tooltip.Root>
              <Tooltip.Trigger
                onclick={stopReading}
                disabled={!isSpeaking}
                class={buttonVariants({
                  variant: 'destructive',
                  size: 'icon',
                  class: 'rounded-full',
                })}
              >
                <Square />
                <span class="sr-only">Stop Narration</span>
              </Tooltip.Trigger>

              <Tooltip.Content>
                <p>Stop Narration</p>
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        {:else}
          <p>
            <strong>Narration</strong> is only available for English, Spanish, and French stories at the
            moment.
          </p>
        {/if}
      </Popover.Content>
    </Popover.Root>
  </Tooltip.Trigger>

  <Tooltip.Content>
    {#if isSupported}
      <p>Narration</p>
    {:else}
      <p>Narration is only available for English, Spanish, and French stories at the moment.</p>
    {/if}
  </Tooltip.Content>
</Tooltip.Root>
