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
const VERSION = '679fd3b97c'
const PRECACHE = ["./assets/BacBlanc-BxRFdKos.js","./assets/Badges-CYyLzy7x.js","./assets/CasPratique-CU1wBv8P.js","./assets/Cgu-CMQBIMly.js","./assets/Chapter-CJnkQbAE.js","./assets/ClassCodeForm-CqXLnOAb.js","./assets/Classe-CNxD4YsA.js","./assets/Coach-DB6fvexQ.js","./assets/CoachAI-4IxaNDjU.js","./assets/Course-C4PUH-_u.js","./assets/Customizer-BSCJZG2k.js","./assets/DailyChallenge-D3V10sLO.js","./assets/DeckDownload-CwogQCz8.js","./assets/DossierProjet-Bv-jzP1c.js","./assets/EtudeGestion-N0b6oxOD.js","./assets/Exam-BLh-P62h.js","./assets/Express-Afg2hdnd.js","./assets/Faq-BjO7FIUz.js","./assets/Favoris-Drcr3k1g.js","./assets/FlashcardsPage-BIyvJOOL.js","./assets/Formulas-CWP_XJkN.js","./assets/Friends-Q5DYem2A.js","./assets/GameHost-BBFEABks.js","./assets/GrandOral-BHJ-QvuR.js","./assets/Guide-C4B2ibek.js","./assets/Home-Dtz2g7HY.css","./assets/Home-iLy3n3pZ.js","./assets/Landing-CUge785c.js","./assets/Leaderboard-CdKtcMks.js","./assets/Methodo-BrdfaDgH.js","./assets/Parent-D6s-hlhl.js","./assets/PhotoFiche-D-Eks2Th.js","./assets/PileCartes-DVyMtDbY.js","./assets/Privacy-CkrKBhJu.js","./assets/Profile-H9Z_oczv.js","./assets/Programme-BoZA98p8.js","./assets/Qcm-RjP2CcX6.js","./assets/Revise-Bnr-OIPX.js","./assets/Shop-zQtOajdT.js","./assets/StatsCharts-BOtJU2c-.js","./assets/Subject-Bcox93ib.js","./assets/Theme-CJAEh7E8.js","./assets/ar-DCxmA6wg.js","./assets/calc-62orrPIx.js","./assets/common-ByNSm7ML.js","./assets/contenu-droit-DLNva_d6.js","./assets/contenu-economie-BuAcm9CL.js","./assets/contenu-gestion-finance-B0tG7jyh.js","./assets/contenu-histoire-geo-CgOSVx_S.js","./assets/contenu-langues-EY1ZfT7F.js","./assets/contenu-management-CcCdHt4n.js","./assets/contenu-maths-CvQqR-ds.js","./assets/contenu-mercatique-ewA3ljuD.js","./assets/contenu-p1-droit-BlHx7Eee.js","./assets/contenu-p1-economie-6m54mKPn.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BD_eS3Rc.js","./assets/contenu-p1-langues-CHniLqxt.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-Dpw5IPfN.js","./assets/contenu-philosophie-uBhihm-s.js","./assets/contenu-rh-communication-DqHaeqKL.js","./assets/contenu-sig-BlZZlj-b.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-500-normal-BsRWmXhO.woff2","./assets/cormorant-garamond-latin-600-normal-Co1r35X9.woff2","./assets/cormorant-garamond-latin-700-normal-DajfzrDU.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-0Wr4ZRnj.js","./assets/epreuves-DNpMLOhr.js","./assets/es-Dab7ijco.js","./assets/index-39AjD7On.css","./assets/index-5g9u89pm.js","./assets/inter-latin-400-normal-C38fXH4l.woff2","./assets/inter-latin-500-normal-Cerq10X2.woff2","./assets/inter-latin-600-normal-LgqL8muc.woff2","./assets/inter-latin-700-normal-Yt3aPRUw.woff2","./assets/it-Dk9Z4GlV.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-CIu3JPwt.js","./assets/public.en-CRVYzJdW.js","./assets/public.es-K4lr5zkK.js","./assets/public.it-CW4i-EMH.js","./assets/study-CZpLK8Or.js"]
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

// Rappel « push » envoyé par la fonction Edge revizstmg-rappels (sans contenu :
// le texte est fixe ; il n'arrive que si l'élève n'a pas encore révisé ce jour).
self.addEventListener('push', (event) => {
  let d = {}
  try { d = event.data ? event.data.json() : {} } catch { d = {} }
  event.waitUntil(
    self.registration.showNotification(d.title || 'RévizSTMG', {
      body: d.body || 'C’est l’heure de réviser ! Quelques minutes suffisent pour garder ta série. 📚',
      icon: './icon-192.png', badge: './favicon.png', tag: 'revision-reminder', renotify: true,
    })
  )
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
