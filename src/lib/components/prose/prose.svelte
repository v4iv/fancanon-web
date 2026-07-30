<script lang="ts">
	import { cn } from '$lib/utils'

	interface Props {
		proseSize?: 'prose-xs' | 'prose-sm' | 'prose-md' | 'prose-lg' | 'prose-xl'
		class?: string
		children?: any
	}

	let { class: className = '', children }: Props = $props()
</script>

<div
	class={cn(
		'prose prose-xl prose-zinc dark:prose-invert prose-headings:font-heading prose-img:w-full',
		className,
	)}
>
	{@render children()}
</div>
