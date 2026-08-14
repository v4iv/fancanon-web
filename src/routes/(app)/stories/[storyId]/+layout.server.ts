export const load = async () => {
  // Purposefully empty: forces SvelteKit to ping the server on navigation,
  // ensuring hooks.server.ts runs on every story/chapter link click.
  return {}
}
