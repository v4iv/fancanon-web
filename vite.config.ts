import { defineConfig, loadEnv } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { join } from 'path'
import { mdsvex } from 'mdsvex'
import tailwindcss from '@tailwindcss/vite'
import adapter from '@sveltejs/adapter-cloudflare'
import { sentrySvelteKit } from '@sentry/sveltekit'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { partytownVite } from '@qwik.dev/partytown/utils'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

export const mdsvexOptions = { extensions: ['.svx', '.md'] }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      sentrySvelteKit({ authToken: env.SENTRY_AUTH_TOKEN }),

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
          instrumentation: {
            server: true,
          },
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

      partytownVite({
        dest: join(__dirname, 'static', '~partytown'),
      }),
    ],
  }
})
