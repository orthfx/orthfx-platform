import { defineConfig } from 'vite-plus'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { plugin as markdown, Mode } from 'vite-plugin-markdown'

export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  plugins: [
    react(),
    tailwindcss(),
    markdown({ mode: [Mode.MARKDOWN] })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
