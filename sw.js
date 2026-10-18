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
const VERSION = '3471c1e4be'
const PRECACHE = ["./assets/BacBlanc-CvPMmBGn.js","./assets/Badges-CEYNEeMC.js","./assets/CasPratique-D3ODrR4v.js","./assets/Cgu-BfCTkUa1.js","./assets/Chapter-IGDeikjS.js","./assets/ClassCodeForm-C6Lod3Zu.js","./assets/Classe-BDOZYD4I.js","./assets/Coach-Cxm62kZU.js","./assets/CoachAI-DQPggi2-.js","./assets/Course-DLWYr8EA.js","./assets/Customizer-DdZ8rpXX.js","./assets/DailyChallenge-L1DnB-I_.js","./assets/DeckDownload-BV5qeWYw.js","./assets/DossierProjet-C0U6s_Ck.js","./assets/EtudeGestion-Dr0HY7Vm.js","./assets/Exam-J9Mg7gIG.js","./assets/Express-DRJUnaF0.js","./assets/Faq-DCXJx05a.js","./assets/Favoris-bUDtZZ4W.js","./assets/FlashcardsPage-C1cbXyzK.js","./assets/Formulas-DA733uVh.js","./assets/Friends-DVfpeOX9.js","./assets/GameHost-ChTgoVXU.js","./assets/GrandOral-DWBbin4n.js","./assets/Guide-BjiZjTks.js","./assets/Home-Czlmj8VX.js","./assets/Landing-BHDLRJtw.js","./assets/Leaderboard-sveY5A73.js","./assets/Methodo-yu68XT0e.js","./assets/Parent-wqgwiJwO.js","./assets/PhotoFiche-CBWM9wUk.js","./assets/PileCartes-Br9R0OzZ.js","./assets/Privacy-DfgftoBV.js","./assets/Profile-B0dpIiG2.js","./assets/Programme-C-XfRkR_.js","./assets/Qcm-CABq7P3Y.js","./assets/Revise-DGGOvyqz.js","./assets/Shop-Cf5lOeQl.js","./assets/StatsCharts-DmiBXN9o.js","./assets/Subject-DmgorYwN.js","./assets/Theme-IdEXROXQ.js","./assets/ar-DCxmA6wg.js","./assets/calc-62orrPIx.js","./assets/common-DA7t-q8G.js","./assets/contenu-droit-DLNva_d6.js","./assets/contenu-economie-BuAcm9CL.js","./assets/contenu-gestion-finance-B0tG7jyh.js","./assets/contenu-histoire-geo-CgOSVx_S.js","./assets/contenu-langues-DUVXZeVD.js","./assets/contenu-management-CcCdHt4n.js","./assets/contenu-maths-CvQqR-ds.js","./assets/contenu-mercatique-ewA3ljuD.js","./assets/contenu-p1-droit-BlHx7Eee.js","./assets/contenu-p1-economie-6m54mKPn.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BD_eS3Rc.js","./assets/contenu-p1-langues-CHniLqxt.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BY9k_Q0n.js","./assets/contenu-philosophie-BGdoPLXm.js","./assets/contenu-rh-communication-DqHaeqKL.js","./assets/contenu-sig-BlZZlj-b.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-500-normal-BsRWmXhO.woff2","./assets/cormorant-garamond-latin-600-normal-Co1r35X9.woff2","./assets/cormorant-garamond-latin-700-normal-DajfzrDU.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-0Wr4ZRnj.js","./assets/epreuves-D2ZyGly2.js","./assets/es-Dab7ijco.js","./assets/index-BfN6Fpus.js","./assets/index-DTQ6MBoU.css","./assets/inter-latin-400-normal-C38fXH4l.woff2","./assets/inter-latin-500-normal-Cerq10X2.woff2","./assets/inter-latin-600-normal-LgqL8muc.woff2","./assets/inter-latin-700-normal-Yt3aPRUw.woff2","./assets/it-Dk9Z4GlV.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-CUHklotQ.js","./assets/public.en-DSe3ukcu.js","./assets/public.es-Bnjc0eNw.js","./assets/public.it-DU4OB12B.js","./assets/study-Cusyt9VY.js"]
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
