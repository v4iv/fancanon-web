import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { mdsvex } from 'mdsvex'
import tailwindcss from '@tailwindcss/vite'
import adapter from '@sveltejs/adapter-cloudflare'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

export const mdsvexOptions = { extensions: ['.svx', '.md'] }

export default defineConfig({
  plugins: [
    enhancedImages(),

    tailwindcss(),

    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
        experimental: {
          // To enable experimental await keyword feature in <script>, $derived() and markups & for remote functions
          // See https://svelte.dev/docs/svelte/await-expressions for more information about await.
          async: true,
        },
        warningFilter: (warning) => warning.code !== 'script_context_deprecated',
      },
      adapter: adapter(),
      preprocess: [mdsvex(mdsvexOptions)],
      extensions: ['.svelte', '.svx', '.md'],
      inlineStyleThreshold: Infinity,
      experimental: {
        remoteFunctions: true,
        handleRenderingErrors: true,
        explicitEnvironmentVariables: true,
      },
      typescript: {
        config: (config) => {
          config.include.push('../drizzle.config.ts')
        },
      },
    }),

    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      emitTsDeclarations: true,
    }),
  ],
})
