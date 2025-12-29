import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Vite configuration - tells Vite how to build your app
// Similar to a webpack.config.js or a setup.cfg in Python
export default defineConfig({
  plugins: [react(), viteSingleFile()],  // Enable React/JSX support + single file output
})
