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
const VERSION = 'ce5df9db39'
const PRECACHE = ["./assets/BacBlanc-bdYHEv8z.js","./assets/Badges-tgAwF-Qp.js","./assets/Chapter-736Vwb9l.js","./assets/Classe-C-bBsNkp.js","./assets/Coach-C_WE-g84.js","./assets/CoachAI-DFTDBp7J.js","./assets/Course-DFu8Tv-i.js","./assets/DailyChallenge-D-Vskcnb.js","./assets/DeckDownload-WT-h3QI2.js","./assets/Exam-Cq0LDJlm.js","./assets/Express-BzuffdAQ.js","./assets/Faq-BbFoRnrT.js","./assets/Favoris-BJde0KoB.js","./assets/FlashcardsPage-Dud04bGh.js","./assets/Formulas-CB84cM-w.js","./assets/Friends-ChH149Wl.js","./assets/GrandOral-D0SfbDgq.js","./assets/Guide-CD3Cz43s.js","./assets/Home-Bw0wADaL.js","./assets/Landing-D576P5f9.js","./assets/Leaderboard-5fy98usX.js","./assets/Methodo-j-Z3KGxn.js","./assets/Parent-DNGhYPJf.js","./assets/PhotoFiche-DmpJOej7.js","./assets/Privacy-CLy7sNXW.js","./assets/Profile-x3z_omD_.js","./assets/Programme-DiDzRPwm.js","./assets/Qcm-DiMOfDko.js","./assets/Revise-BKbfKz51.js","./assets/Shop-CNnfnEHp.js","./assets/StatsCharts-B4mKYCY7.js","./assets/Subject-BIQcEjZj.js","./assets/Theme-1yYdJGwO.js","./assets/common-ClEEDTHY.js","./assets/contenu-droit-Cq42LBV3.js","./assets/contenu-economie-BG5-aPZD.js","./assets/contenu-gestion-finance-gCeOIzMJ.js","./assets/contenu-histoire-geo-BXGMAtyE.js","./assets/contenu-langues-CqJSEbta.js","./assets/contenu-management-CMLkTa1D.js","./assets/contenu-maths-CkyPKMCg.js","./assets/contenu-mercatique-DMRWpUiR.js","./assets/contenu-p1-droit-xAY7YmM1.js","./assets/contenu-p1-economie-WzSozI6u.js","./assets/contenu-p1-francais-UFwXMgKz.js","./assets/contenu-p1-histoire-geo-Brs9MqWO.js","./assets/contenu-p1-langues-B8c3Orcs.js","./assets/contenu-p1-management-BXONIV8q.js","./assets/contenu-p1-maths-CzJUBdxh.js","./assets/contenu-p1-sgn-D4CCxH3B.js","./assets/contenu-philosophie-B8HK9HWI.js","./assets/contenu-rh-communication-BPjuXGU5.js","./assets/contenu-sig-DT2de8WM.js","./assets/index-CftA7CFz.js","./assets/index-D4zRAbtQ.css","./assets/study-O4tIuuEr.js"]
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
