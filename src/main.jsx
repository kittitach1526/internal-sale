import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. เพิ่มการ Import ตัวนี้
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. นำ BrowserRouter มาครอบ App ไว้ */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)