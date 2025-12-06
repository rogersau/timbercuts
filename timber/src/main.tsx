import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage'
import LinearCuttingPage from './pages/LinearCuttingPage'
import SheetCuttingPage from './pages/SheetCuttingPage'
import PaverCalculatorPage from './pages/PaverCalculatorPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/linear" element={<LinearCuttingPage />} />
        <Route path="/sheet" element={<SheetCuttingPage />} />
        <Route path="/paver" element={<PaverCalculatorPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>
)
