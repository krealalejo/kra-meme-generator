import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      include: ['src/**'],
      exclude: ['src/test-setup.js', '**/*.test.*', 'src/main.jsx', 'src/index.css', 'src/assets/**'],
      thresholds: {
        lines: 80,
        statements: 80,
        branches: 75,
        functions: 80,
      },
    },
  },
})
