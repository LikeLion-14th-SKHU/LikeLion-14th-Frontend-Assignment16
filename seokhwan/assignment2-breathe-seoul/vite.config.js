import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import airHandler from './api/air.js'

// 개발 서버(dev/preview)에서도 Vercel과 똑같이 /api/air를 서버 함수로 처리한다
const apiAir = {
  name: 'api-air',
  configureServer(server) {
    server.middlewares.use('/api/air', airHandler)
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/air', airHandler)
  },
}

export default defineConfig(({ mode }) => {
  // VITE_ 접두사가 없으므로 이 값은 브라우저 번들에 들어가지 않는다
  const { SEOUL_API_KEY } = loadEnv(mode, process.cwd(), '')
  if (SEOUL_API_KEY) process.env.SEOUL_API_KEY = SEOUL_API_KEY // undefined를 넣으면 문자열 "undefined"가 된다
  return { plugins: [react(), tailwindcss(), apiAir] }
})
