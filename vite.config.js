import { existsSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 개발 서버에서도 /api/* 를 api/*.js 의 GET 함수로 처리해요.
// (배포 환경에서는 Vercel이 같은 파일을 Function으로 실행해요)
function localApi() {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const name = req.url.split('?')[0].replace(/^\/+|\/+$/g, '')
        if (!/^[\w-]+$/.test(name) || !existsSync(`${server.config.root}/api/${name}.js`)) {
          res.statusCode = 404
          return res.end()
        }
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          if (typeof mod.GET !== 'function' || req.method !== 'GET') {
            res.statusCode = 405
            return res.end()
          }
          const url = new URL(req.originalUrl, `http://${req.headers.host}`)
          const response = await mod.GET(new Request(url))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // VITE_ 접두사 없는 변수(DATA_GO_KR_KEY)도 서버 쪽 process.env에만 넣어요.
  // 브라우저 번들에는 들어가지 않아요.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), tailwindcss(), localApi()],
  }
})
