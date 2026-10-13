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
const VERSION = '3edfbfc3a0'
const PRECACHE = ["./assets/BacBlanc-CevCw8hq.js","./assets/Badges-D7b-rphe.js","./assets/CasPratique-DWwHgc3s.js","./assets/Cgu-Dw87L5hV.js","./assets/Chapter-Br90Uh2C.js","./assets/Classe-BpwHp6z-.js","./assets/Coach-CmUY7Om7.js","./assets/CoachAI-BKMnvH5W.js","./assets/Course-Zjge43hT.js","./assets/Customizer-A_7Bwq4j.js","./assets/DailyChallenge-CCjM2bUE.js","./assets/DeckDownload-xQIyMYIV.js","./assets/DossierProjet-DhH_LEDY.js","./assets/EtudeGestion-50sTr77S.js","./assets/Exam-CLMyN3WE.js","./assets/Express-rY1ZuKzH.js","./assets/Faq-DCTOIHXk.js","./assets/Favoris-1guo-jRi.js","./assets/FlashcardsPage-BUZvYoJ2.js","./assets/Formulas-DW1OVtMG.js","./assets/Friends-C1bWLSKv.js","./assets/GameHost-CgHNoJF6.js","./assets/GrandOral-oBTtcTZ1.js","./assets/Guide-BblX8-ew.js","./assets/Home-BZezJTXR.js","./assets/Landing-es4Dk6zj.js","./assets/Leaderboard-DU2GCXn4.js","./assets/Methodo-Bz9tmjfX.js","./assets/Parent-NzGNlNhz.js","./assets/PhotoFiche-xeO8eIQW.js","./assets/PileCartes-lY0hqtaS.js","./assets/Privacy-C_3SEI7c.js","./assets/Profile-CApo1SmD.js","./assets/Programme-rxI2JYU9.js","./assets/Qcm-DwpDAMe-.js","./assets/Revise-edG1A41c.js","./assets/Shop-znVVqi4j.js","./assets/StatsCharts-BpvuX6Gu.js","./assets/Subject-DJnNyn6i.js","./assets/Theme-DmhHna5M.js","./assets/ar-CDMOoEGj.js","./assets/calc-62orrPIx.js","./assets/common-CeUZjMx6.js","./assets/contenu-droit-DLNva_d6.js","./assets/contenu-economie-BuAcm9CL.js","./assets/contenu-gestion-finance-B0tG7jyh.js","./assets/contenu-histoire-geo-i-JUQaGf.js","./assets/contenu-langues-DUVXZeVD.js","./assets/contenu-management-CcCdHt4n.js","./assets/contenu-maths-CvQqR-ds.js","./assets/contenu-mercatique-ewA3ljuD.js","./assets/contenu-p1-droit-BlHx7Eee.js","./assets/contenu-p1-economie-6m54mKPn.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BD_eS3Rc.js","./assets/contenu-p1-langues-CHniLqxt.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-ozmEtyif.js","./assets/contenu-philosophie-BGdoPLXm.js","./assets/contenu-rh-communication-DqHaeqKL.js","./assets/contenu-sig-BlZZlj-b.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-500-normal-BsRWmXhO.woff2","./assets/cormorant-garamond-latin-600-normal-Co1r35X9.woff2","./assets/cormorant-garamond-latin-700-normal-DajfzrDU.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-BkJh8kJU.js","./assets/epreuves-C0mufQoJ.js","./assets/es-Cw7KPQHh.js","./assets/friends-BcL9ZoDP.js","./assets/index-DEEAsKg4.js","./assets/index-WG-UzmGP.css","./assets/inter-latin-400-normal-C38fXH4l.woff2","./assets/inter-latin-500-normal-Cerq10X2.woff2","./assets/inter-latin-600-normal-LgqL8muc.woff2","./assets/inter-latin-700-normal-Yt3aPRUw.woff2","./assets/it-DFqw5wIo.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/study-9eE2FozV.js"]
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
