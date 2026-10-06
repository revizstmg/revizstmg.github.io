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
const VERSION = '0b2e14126a'
const PRECACHE = ["./assets/BacBlanc-DGDXWy6r.js","./assets/Badges-BGCxhX5Y.js","./assets/Cgu-V398LXrn.js","./assets/Chapter-B-WrtDj0.js","./assets/Classe-R9B3KMEz.js","./assets/Coach-CgpT2qex.js","./assets/CoachAI-CkVZ_IoL.js","./assets/Course-Bsd78K9L.js","./assets/Customizer-CH5I3rKt.js","./assets/DailyChallenge-tdgOOyX4.js","./assets/DeckDownload-BtJc8q_S.js","./assets/Exam-Bm0gwKT2.js","./assets/Express-B9sn1mgY.js","./assets/Faq-DGqDcvbo.js","./assets/Favoris-B6oUzeoG.js","./assets/FlashcardsPage-CQHndBQP.js","./assets/Formulas-BFVkZi0i.js","./assets/Friends-B27J2RdW.js","./assets/GrandOral-CBHUsrH0.js","./assets/Guide-PfDX7jr9.js","./assets/Home-CAIauyT_.js","./assets/Landing-CNoqEThV.js","./assets/Leaderboard-CSp6Qhdg.js","./assets/Methodo-xavh3Ql5.js","./assets/Parent-DyZNTxCW.js","./assets/PhotoFiche-BP6vEoMZ.js","./assets/PileCartes-DAwZWjIS.js","./assets/Privacy-BG9Sj8WD.js","./assets/Profile-B9YMyZAv.js","./assets/Programme-CYx-IGp_.js","./assets/Qcm-CeIgjxLw.js","./assets/Revise-BKBdJh6U.js","./assets/Shop-CgDvaQjZ.js","./assets/StatsCharts-DiaKmU_d.js","./assets/Subject-nlwNFPei.js","./assets/Theme-Bw0mhWgk.js","./assets/ar-SCCAUyKV.js","./assets/common-D83XwKuk.js","./assets/contenu-droit-DLNva_d6.js","./assets/contenu-economie-BuAcm9CL.js","./assets/contenu-gestion-finance-B0tG7jyh.js","./assets/contenu-histoire-geo-i-JUQaGf.js","./assets/contenu-langues-DUVXZeVD.js","./assets/contenu-management-CcCdHt4n.js","./assets/contenu-maths-BuiesA4-.js","./assets/contenu-mercatique-ewA3ljuD.js","./assets/contenu-p1-droit-BlHx7Eee.js","./assets/contenu-p1-economie-6m54mKPn.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BD_eS3Rc.js","./assets/contenu-p1-langues-CHniLqxt.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-ozmEtyif.js","./assets/contenu-philosophie-BGdoPLXm.js","./assets/contenu-rh-communication-DqHaeqKL.js","./assets/contenu-sig-BlZZlj-b.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-500-normal-BsRWmXhO.woff2","./assets/cormorant-garamond-latin-600-normal-Co1r35X9.woff2","./assets/cormorant-garamond-latin-700-normal-DajfzrDU.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-DKIPxX44.js","./assets/es-aqyd4Eor.js","./assets/index-CYv1q5oR.js","./assets/index-CdwwTgtB.css","./assets/inter-latin-400-normal-C38fXH4l.woff2","./assets/inter-latin-500-normal-Cerq10X2.woff2","./assets/inter-latin-600-normal-LgqL8muc.woff2","./assets/inter-latin-700-normal-Yt3aPRUw.woff2","./assets/it-CBXVVxVJ.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/study-B56crOo1.js"]
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
