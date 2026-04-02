import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/components/ExifEdit.vue'),
      name: 'exifEdit',
      fileName: (format) => {
        if (format === 'es') return 'exifEdit.mjs'
        if (format === 'cjs') return 'exifEdit.common.js'
        if (format === 'umd') return 'exifEdit.umd.min.js'
        return `exifEdit.${format}.js`
      },
      formats: ['es', 'umd', 'cjs'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'exifEdit.css';
          }
          return assetInfo.name || 'asset';
        }
      }
    }
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
