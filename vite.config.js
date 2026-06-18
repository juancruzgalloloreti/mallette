import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Target iOS Safari 13+ / Safari 13+ (soportan ES2017 nativamente)
    target: ['es2017', 'safari13'],
  },
})
