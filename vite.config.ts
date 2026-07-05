import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ICML26-Poster-Guide/',
  plugins: [react()],
})
