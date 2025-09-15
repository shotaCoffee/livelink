import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { resolve } from 'path'

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext'
  },
  css: {
    postcss: './postcss.config.js'
  },
  envDir: resolve(__dirname, '../..')
})