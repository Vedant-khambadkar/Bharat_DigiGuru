import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initThreeAssetCache } from './utils/threeAssetCache.ts'

// Initialize 3D Asset Caching (GLB, HDR, Draco, Textures)
initThreeAssetCache();

// Force browser to always start at the absolute top on page reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


createRoot(document.getElementById('root')!).render(
  <App />
)
