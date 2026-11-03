import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { StoreProvider } from './store.jsx'
import { FocusProvider } from './focus.jsx'
import App from './App.jsx'
import { initPwa } from './pwa.js'
import './polices.css'
import './index.css'
import './editorial.css'
import './mobile.css'

// Capture l'invite d'installation « Ajouter à l'écran d'accueil » dès le départ.
initPwa()

// L'app est découpée en fichiers chargés à la demande. Si une mise à jour a
// été publiée pendant qu'un élève avait l'app ouverte, un ancien fichier peut
// manquer : on recharge une fois pour passer à la nouvelle version.
// Un seul rechargement par page ouverte, même si le stockage de session est inutilisable (sans cette variable,
// chaque échec rechargerait la page en boucle).
let dejaRecharge = false
window.addEventListener('vite:preloadError', (event) => {
  if (dejaRecharge) return
  try {
    if (sessionStorage.getItem('revizstmg-recharge')) return
    sessionStorage.setItem('revizstmg-recharge', '1')
  } catch { /* stockage indisponible : la variable ci-dessus limite à un rechargement */ }
  dejaRecharge = true
  event.preventDefault()
  window.location.reload()
})
window.addEventListener('load', () => {
  setTimeout(() => { try { sessionStorage.removeItem('revizstmg-recharge') } catch { /* */ } }, 10000)
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter : fonctionne sur GitHub Pages et en local sans configuration serveur. */}
    <HashRouter>
      <StoreProvider>
        <FocusProvider>
          <App />
        </FocusProvider>
      </StoreProvider>
    </HashRouter>
  </React.StrictMode>,
)
