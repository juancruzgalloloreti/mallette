import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Soporta iOS Safari 13+, Safari 13+, y los últimos 2 browsers de cada familia
      targets: ['ios >= 13', 'safari >= 13', 'last 2 versions'],
    }),
  ],
})
