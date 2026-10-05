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
const VERSION = '170698fa57'
const PRECACHE = ["./assets/BacBlanc-gIxZE7se.js","./assets/Badges-C73KXOop.js","./assets/Chapter-BHVv93ue.js","./assets/Classe-DuYaMqOW.js","./assets/Coach-bGI_qMYn.js","./assets/CoachAI-CCN4O-oM.js","./assets/Course-BVLfKWKV.js","./assets/DailyChallenge-CqQ60dF8.js","./assets/DeckDownload-DN28cleF.js","./assets/Exam--S8g3rrn.js","./assets/Express-6lM1FxVX.js","./assets/Faq-CAlGF32j.js","./assets/Favoris-DA_k5FvN.js","./assets/FlashcardsPage-BiYoJWbD.js","./assets/Formulas-C1ysxLKp.js","./assets/Friends-C4eq7N7t.js","./assets/GrandOral-x2bZhLeO.js","./assets/Guide-DIn_zswP.js","./assets/Home-B0ynUJ4S.js","./assets/Landing-BOUwShWe.js","./assets/Leaderboard-BaJ9iy9Q.js","./assets/Methodo-CkkKvmHI.js","./assets/Parent-DAA0yiaq.js","./assets/PhotoFiche-D7Qvk5b4.js","./assets/Privacy-BSbJA8_X.js","./assets/Profile-BybR64l-.js","./assets/Programme-DHdkAawS.js","./assets/Qcm-DAe6yS-Q.js","./assets/Revise-Bz8KS9Iz.js","./assets/Shop-DhE4GWJO.js","./assets/StatsCharts-BR9RJU0L.js","./assets/Subject-3hdvPAtY.js","./assets/Theme-CoL8IytO.js","./assets/common-B5P1KeJX.js","./assets/contenu-droit-BuXBuMEX.js","./assets/contenu-economie-CVJWXChu.js","./assets/contenu-gestion-finance-BDm1PHaO.js","./assets/contenu-histoire-geo-KiaJb9sd.js","./assets/contenu-langues-BfQA-5qS.js","./assets/contenu-management-03lO0QyO.js","./assets/contenu-maths-IIwh_c8M.js","./assets/contenu-mercatique-BcS4q7q6.js","./assets/contenu-p1-droit-DHhYTkLf.js","./assets/contenu-p1-economie-BOpBhDh0.js","./assets/contenu-p1-francais-CzytDNYP.js","./assets/contenu-p1-histoire-geo-CjLl1V-6.js","./assets/contenu-p1-langues-BWbo698T.js","./assets/contenu-p1-management-BN6NA5tW.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BRoaqBzB.js","./assets/contenu-philosophie-CLVg1rn9.js","./assets/contenu-rh-communication-DnvhBSf3.js","./assets/contenu-sig-CuaF_zPn.js","./assets/index-Bg5m_iTC.css","./assets/index-DotfsOgN.js","./assets/study-BLwrCmjW.js"]
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
