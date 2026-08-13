<script lang="ts">
  import ShareDesktop from './share-desktop.svelte'
  import ShareMobile from './share-mobile.svelte'

  interface Props {
    path: string
    title?: string
  }

  let { path, title }: Props = $props()
</script>

<!-- Share Desktop -->
<div class="hidden lg:flex">
  <ShareDesktop {title} {path} />
</div>

<!-- Share Mobile/Tablet -->
<div class="flex lg:hidden">
  <ShareMobile {title} {path} />
</div>
