<script lang="ts">
	import { cn } from '$lib/utils'
	import { Button } from '$lib/components/ui/button'

	interface Props {
		text?: string | null
		maxLines?: number
		classes?: string
	}

	let { text = '', maxLines = 2, classes = '' }: Props = $props()

	let isExpanded = $state(false)
	let isOverflowing = $state(false)
	let paragraphRef: HTMLParagraphElement | undefined = $state()

	$effect(() => {
		if (!paragraphRef || !text) return

		function measure() {
			if (!isExpanded && paragraphRef) {
				isOverflowing = paragraphRef.scrollHeight > paragraphRef.clientHeight
			}
		}

		measure()
		window.addEventListener('resize', measure)
		return () => window.removeEventListener('resize', measure)
	})

	const lineClampClass =
		// svelte-ignore state_referenced_locally
		maxLines === 3 ? 'line-clamp-3' : maxLines === 4 ? 'line-clamp-4' : 'line-clamp-2'
</script>

{#if text}
	<div class="mb-4">
		<p
			bind:this={paragraphRef}
			class={cn('leading-relaxed', !isExpanded && lineClampClass, classes)}
		>
			{text}
		</p>
		{#if isOverflowing || isExpanded}
			<Button
				variant="ghost"
				size="sm"
				onclick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					isExpanded = !isExpanded
				}}
				class="mt-1 h-auto p-0 text-xs font-bold text-primary uppercase underline-offset-4 hover:bg-transparent hover:underline"
			>
				{#if isExpanded}
					Read less &#x25B5;
				{:else}
					Read More &#x25BF;
				{/if}
			</Button>
		{/if}
	</div>
{/if}
