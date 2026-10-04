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
const VERSION = '2a3b31b11f'
const PRECACHE = ["./assets/BacBlanc-C5xNatVo.js","./assets/Badges-By_9L0Js.js","./assets/Chapter-BRi-Xv59.js","./assets/Classe-CISMhmqi.js","./assets/Coach-D8mSJb0_.js","./assets/CoachAI-BjSjBl1R.js","./assets/Course-BUDhjg3Q.js","./assets/DailyChallenge-Bru7oY-T.js","./assets/DeckDownload-DkTWQ_e6.js","./assets/Exam-DfRgb9XG.js","./assets/Express-BJs87A-F.js","./assets/Faq-CNbrrpQz.js","./assets/Favoris-2kQ0z-Au.js","./assets/FlashcardsPage-CG3yCykK.js","./assets/Formulas-BxKsReLp.js","./assets/Friends-COdugZlh.js","./assets/GrandOral-BJDAptNb.js","./assets/Guide-mYS4r6U3.js","./assets/Home-B_PqvPPj.js","./assets/Landing-C3kBhoU0.js","./assets/Leaderboard-C8a3EWnn.js","./assets/Methodo-DJlGlbc9.js","./assets/Parent-DkpuaZnE.js","./assets/PhotoFiche-CYe3nuBC.js","./assets/Privacy-D5CKmT3_.js","./assets/Profile-DaGcKujv.js","./assets/Programme-DCTabHy9.js","./assets/Qcm-B_hJyDkx.js","./assets/Revise-Ch5KE4DU.js","./assets/Shop-DqI_TpqV.js","./assets/StatsCharts-CIxc8CDm.js","./assets/Subject-D9GGgVZ1.js","./assets/Theme-BK_zhvqO.js","./assets/common-BRyZgy5o.js","./assets/contenu-droit-DwRPmNwM.js","./assets/contenu-economie-ByhLU1rS.js","./assets/contenu-gestion-finance-BlwK5Px5.js","./assets/contenu-histoire-geo-uFmIoNQV.js","./assets/contenu-langues-CqJSEbta.js","./assets/contenu-management-tveXdKcT.js","./assets/contenu-maths-CkyPKMCg.js","./assets/contenu-mercatique-DMRWpUiR.js","./assets/contenu-p1-droit-xAY7YmM1.js","./assets/contenu-p1-economie-WzSozI6u.js","./assets/contenu-p1-francais-UFwXMgKz.js","./assets/contenu-p1-histoire-geo-iJYhRjsu.js","./assets/contenu-p1-langues-B8c3Orcs.js","./assets/contenu-p1-management-BXONIV8q.js","./assets/contenu-p1-maths-CzJUBdxh.js","./assets/contenu-p1-sgn-D4CCxH3B.js","./assets/contenu-philosophie-CKx6tYv0.js","./assets/contenu-rh-communication-BPjuXGU5.js","./assets/contenu-sig-DT2de8WM.js","./assets/index-D4zRAbtQ.css","./assets/index-DQiJlFlM.js","./assets/study-AO34aCxx.js"]
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
