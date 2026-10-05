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
const VERSION = '15d88d33df'
const PRECACHE = ["./assets/BacBlanc-DYYMj0jl.js","./assets/Badges-ajpwCxHw.js","./assets/Chapter-D3U8hD5g.js","./assets/Classe-B6zKVhzu.js","./assets/Coach-DmVZuUmG.js","./assets/CoachAI-zLbD53ic.js","./assets/Course-BDK-hIl1.js","./assets/DailyChallenge-CusEtqk9.js","./assets/DeckDownload-D_b9_ruA.js","./assets/Exam-CQmemKAI.js","./assets/Express-Ds0CdYrw.js","./assets/Faq-Z6XOGp3x.js","./assets/Favoris-B_6yMJca.js","./assets/FlashcardsPage-C9F9_g1_.js","./assets/Formulas-CW8-gCWe.js","./assets/Friends-DvXb4Sg5.js","./assets/GrandOral-Ds2aLmAB.js","./assets/Guide-C892P_Vk.js","./assets/Home-Bj3BG7ik.js","./assets/Landing-c4Bd53ZL.js","./assets/Leaderboard-BhXTyGa4.js","./assets/Methodo-DTXkphjs.js","./assets/Parent-DhM4oYQJ.js","./assets/PhotoFiche-DgZB2pYd.js","./assets/PileCartes-lf9zt_hy.js","./assets/Privacy-C5VhR4HU.js","./assets/Profile-C7r8lIhP.js","./assets/Programme-DEIqeFie.js","./assets/Qcm-C5Utb0a2.js","./assets/Revise-CNE54z0H.js","./assets/Shop-DWodTjGh.js","./assets/StatsCharts-Cxwf7IFO.js","./assets/Subject-DdyjffKa.js","./assets/Theme-WBQ3vqUY.js","./assets/common-DCE9gSRM.js","./assets/contenu-droit-BuXBuMEX.js","./assets/contenu-economie-CVJWXChu.js","./assets/contenu-gestion-finance-BDm1PHaO.js","./assets/contenu-histoire-geo-KiaJb9sd.js","./assets/contenu-langues-BfQA-5qS.js","./assets/contenu-management-03lO0QyO.js","./assets/contenu-maths-IIwh_c8M.js","./assets/contenu-mercatique-BcS4q7q6.js","./assets/contenu-p1-droit-DHhYTkLf.js","./assets/contenu-p1-economie-BOpBhDh0.js","./assets/contenu-p1-francais-CzytDNYP.js","./assets/contenu-p1-histoire-geo-CjLl1V-6.js","./assets/contenu-p1-langues-BWbo698T.js","./assets/contenu-p1-management-BN6NA5tW.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BRoaqBzB.js","./assets/contenu-philosophie-CLVg1rn9.js","./assets/contenu-rh-communication-DnvhBSf3.js","./assets/contenu-sig-CuaF_zPn.js","./assets/index-CcfgtO87.js","./assets/index-DSPT5wyP.css","./assets/study-DEudRL_S.js"]
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
