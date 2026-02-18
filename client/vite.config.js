import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- On importe Tailwind

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- On active Tailwind ici
  ],
})