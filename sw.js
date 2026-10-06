/* RévizSTMG — Service Worker
 * Stratégie :
 *  - À l'installation : tous les fichiers de l'app sont mis en cache (code,
 *    pages, contenu de chaque matière), pour que l'app entière marche hors
 *    ligne après la première visite. La liste et la version sont écrites par
 *    pwa-postbuild.mjs à chaque compilation.
 *  - Navigations / HTML : network-first (on récupère toujours la dernière
 *    version en ligne, et on retombe sur le cache hors-ligne).
 *  - Autres fichiers même origine : cache-first (leurs noms changent avec
 *    leur contenu, une version en cache n'est donc jamais périmée).
 *  - Requêtes cross-origin (Supabase, Google Fonts…) : jamais interceptées,
 *    elles passent directement au réseau.
 */
const VERSION = '68c6b68a76'
const PRECACHE = ["./assets/BacBlanc-CzTj0Fvy.js","./assets/Badges-DdGqSjXl.js","./assets/Cgu-CzYhyrQj.js","./assets/Chapter-Bqi_-9Np.js","./assets/Classe-DeIVneku.js","./assets/Coach-C_dpiDoM.js","./assets/CoachAI-B6BYBDKZ.js","./assets/Course-Br3hBFWQ.js","./assets/Customizer-B68rMW5r.js","./assets/DailyChallenge-Biw0KIUL.js","./assets/DeckDownload-BNYWvcbp.js","./assets/Exam-D4eIe0vI.js","./assets/Express-DjB3ESxg.js","./assets/Faq-n1gnIepw.js","./assets/Favoris-DQO5TtA1.js","./assets/FlashcardsPage-B91ecC13.js","./assets/Formulas-Boe0WazG.js","./assets/Friends-5woNrJ70.js","./assets/GrandOral-CZPXlupA.js","./assets/Guide-B8iwPtQ4.js","./assets/Home-I-cmvLO0.js","./assets/Landing-DPFaMaHG.js","./assets/Leaderboard-CYAY7f6s.js","./assets/Methodo-CQ6q-3cE.js","./assets/Parent-BWenv6Gp.js","./assets/PhotoFiche-UcpNKUce.js","./assets/PileCartes-BijvBfDT.js","./assets/Privacy-Cvj0oUjP.js","./assets/Profile-LVJ2HHsC.js","./assets/Programme-bT6L8e-m.js","./assets/Qcm-BQaW4ScB.js","./assets/Revise-Cw1Zfu30.js","./assets/Shop-0OVrOwT2.js","./assets/StatsCharts-BfRivZPj.js","./assets/Subject-DTkNzy5h.js","./assets/Theme-CCMkj8IZ.js","./assets/ar-C7QCAW-P.js","./assets/common-D4x8kh29.js","./assets/contenu-droit-Bwsd7kR7.js","./assets/contenu-economie-CVJWXChu.js","./assets/contenu-gestion-finance-Cg7SHO94.js","./assets/contenu-histoire-geo-Brw_T6un.js","./assets/contenu-langues-BfQA-5qS.js","./assets/contenu-management-03lO0QyO.js","./assets/contenu-maths-IIwh_c8M.js","./assets/contenu-mercatique-GAg_3q-Y.js","./assets/contenu-p1-droit-CV4AqA4y.js","./assets/contenu-p1-economie-BOpBhDh0.js","./assets/contenu-p1-francais-CzytDNYP.js","./assets/contenu-p1-histoire-geo-DsYa-EHL.js","./assets/contenu-p1-langues-BWbo698T.js","./assets/contenu-p1-management-BN6NA5tW.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BzhciYSb.js","./assets/contenu-philosophie-CLVg1rn9.js","./assets/contenu-rh-communication-DnvhBSf3.js","./assets/contenu-sig-BbFKBVyD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-500-normal-BsRWmXhO.woff2","./assets/cormorant-garamond-latin-600-normal-Co1r35X9.woff2","./assets/cormorant-garamond-latin-700-normal-DajfzrDU.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CxRYnXZt.js","./assets/es-u5eUKn-i.js","./assets/index-CnT2DfRP.js","./assets/index-nI0-JF6U.css","./assets/inter-latin-400-normal-C38fXH4l.woff2","./assets/inter-latin-500-normal-Cerq10X2.woff2","./assets/inter-latin-600-normal-LgqL8muc.woff2","./assets/inter-latin-700-normal-Yt3aPRUw.woff2","./assets/it-DyQd6HyA.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/study-C3xgcBA8.js"]
const CACHE = 'revizstmg-' + VERSION
const FONT_CACHE = 'revizstmg-fonts-v1'
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll échoue si UN fichier manque : on ajoute donc un par un, tolérant.
      Promise.all([...CORE, ...PRECACHE].map((url) => cache.add(url).catch(() => null)))
    )
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting()
})

// Rappel de révision (PWA installée) : synchro périodique -> notification.
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'revision-reminder') {
    event.waitUntil(
      self.registration.showNotification('RévizSTMG', {
        body: 'C’est l’heure de réviser ! 📚',
        icon: './icon-192.png', badge: './favicon.png', tag: 'revision-reminder',
      })
    )
  }
})

// Clic sur une notification : ouvre / réactive l'app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
      for (const c of cs) { if ('focus' in c) return c.focus() }
      return self.clients.openWindow('./')
    })
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  let url
  try {
    url = new URL(req.url)
  } catch {
    return
  }
  // Polices Google (cross-origin) : cache-first pour qu'elles restent
  // disponibles hors-ligne après la première visite. Le reste (Supabase…)
  // passe directement au réseau.
  if (url.origin !== self.location.origin) {
    if (FONT_HOSTS.includes(url.hostname)) {
      event.respondWith(
        (async () => {
          const cache = await caches.open(FONT_CACHE)
          const cached = await cache.match(req)
          if (cached) return cached
          try {
            const fresh = await fetch(req)
            // Réponses « opaque » incluses (mode no-cors) : on les met en cache.
            cache.put(req, fresh.clone())
            return fresh
          } catch {
            return cached || Response.error()
          }
        })()
      )
    }
    return
  }

  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html')

  if (isHTML) {
    // network-first
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          const cache = await caches.open(CACHE)
          cache.put('./index.html', fresh.clone())
          return fresh
        } catch {
          const cache = await caches.open(CACHE)
          return (
            (await cache.match('./index.html')) ||
            (await cache.match('./')) ||
            (await cache.match(req)) ||
            Response.error()
          )
        }
      })()
    )
    return
  }

  // cache-first pour le reste (icônes, manifest…)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(req)
      if (cached) return cached
      try {
        const fresh = await fetch(req)
        if (fresh && fresh.status === 200 && fresh.type === 'basic') {
          cache.put(req, fresh.clone())
        }
        return fresh
      } catch {
        return cached || Response.error()
      }
    })()
  )
})
