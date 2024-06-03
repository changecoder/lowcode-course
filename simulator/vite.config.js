import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import externalGlobals from 'rollup-plugin-external-globals'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), externalGlobals({
    vue: 'Vue'
  })],
  build: {
    rollupOptions: {
      external: ['vue']
    }
  }
})
