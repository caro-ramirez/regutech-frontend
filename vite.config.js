import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Reemplazá 'regutech-frontend' por el nombre EXACTO de tu repositorio en GitHub
export default defineConfig({
  plugins: [react()],
  base: '/regutech-frontend/',
})
