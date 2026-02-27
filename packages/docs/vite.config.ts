import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), solid()],
  server: {
    port: 3000,
  },
  // SPA: serve index.html for all routes (required for client-side routing)
  appType: "spa",
})
