import { defineConfig } from 'vite'
import { mdsvex } from 'mdsvex'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-cloudflare'

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
        experimental: { async: true },
      },
      adapter: adapter(),
      alias: {
        $lib: './src/lib',
      },
      preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
      extensions: ['.svelte', '.svx', '.md'],
      inlineStyleThreshold: Infinity,
      experimental: { remoteFunctions: true },
    }),
  ],
})
