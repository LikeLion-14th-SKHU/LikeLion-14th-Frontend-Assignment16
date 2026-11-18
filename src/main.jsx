import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { LucideProvider } from 'lucide-react'
import './index.css'
import App from './App.jsx'
import { ICON, ICON_STROKE } from './lib/icons.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* 앱 전체 아이콘의 기본 크기와 선 굵기를 맞춰요 */}
      <LucideProvider size={ICON.sm} strokeWidth={ICON_STROKE} className="shrink-0">
        <App />
      </LucideProvider>
    </BrowserRouter>
  </StrictMode>,
)
