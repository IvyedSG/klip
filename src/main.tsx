import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/main.css'
import { AppRouter } from './app/index'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
