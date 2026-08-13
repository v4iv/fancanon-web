<script lang="ts">
  import { page } from '$app/state'

  interface Props {
    title?: string
    description?: string
    image?: string
    url?: string
    author?: string
  }

  let {
    title = 'fancanon',
    description = 'The Ultimate Fan Fiction Platform. For Humans, By Humans. Read, write, and share fan fiction across every fandom in a modern, community-driven experience.',
    image = '/banner.jpg',
    url = page.url.href,
    author,
  }: Props = $props()
</script>

<svelte:head>
  <link rel="sitemap" href="/sitemap.xml" />

  <!-- Canonical URL -->
  <link rel="canonical" href={url} />

  <!-- Primary Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  {#if author?.length}<meta property="og:author" content={author} />{/if}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={url} />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <meta property="twitter:image" content={image} />
</svelte:head>
