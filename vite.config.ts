import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          sentry: ['@sentry/vue'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', '@sentry/vue'],
    exclude: [],
    force: true,
  },
  ssr: {
    noExternal: ['@sentry/vue'],
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
