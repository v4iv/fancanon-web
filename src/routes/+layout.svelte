<script lang="ts">
  import './layout.css'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <title>fancanon</title>
</svelte:head>

{@render children()}
