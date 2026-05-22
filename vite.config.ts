import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 配置 base 路径用于 GitHub Pages 部署
  base: '/hermes/'
})
