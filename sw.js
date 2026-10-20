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
const VERSION = '0195c0ae18'
const PRECACHE = ["./assets/BacBlanc-yx5eOXaq.js","./assets/Badges-CVRQUR9L.js","./assets/CasPratique-v5aIvFa8.js","./assets/Cgu-B9pR66Ip.js","./assets/Chapter-DinrEOig.js","./assets/ClassCodeForm-DJQl457o.js","./assets/Classe-DW9VMHyt.js","./assets/Coach-DlLXjo-7.js","./assets/CoachAI-CqEs8w2i.js","./assets/Cours-CSytw9hv.js","./assets/Course-D_2cLXpf.js","./assets/Customizer-DZz6__Yf.js","./assets/DailyChallenge-BZHPQQ2c.js","./assets/DeckDownload-Ce-ZvngO.js","./assets/DossierProjet-CMu_Gi3-.js","./assets/EtudeGestion-BqjcDvQv.js","./assets/Exam-DK9oXD-O.js","./assets/Faq-DMJzGZ9f.js","./assets/Favoris-DB6elYLf.js","./assets/FlashcardsPage-B2K0NaEH.js","./assets/FormulaWorkshop-CAUfBrQi.js","./assets/Friends-4zhFKGBQ.js","./assets/GameHost-CuAtGcrL.js","./assets/GrandOral-D6wuR3jp.js","./assets/Guide-B3nKHOji.js","./assets/Home-Dtz2g7HY.css","./assets/Home-UV79aEQ9.js","./assets/Landing-DtZk0FYU.js","./assets/Leaderboard-CzjWsG1p.js","./assets/MesNotes-DfGyiHAU.js","./assets/Methodo-DvxR2VZD.js","./assets/Parent-CmBgeD4J.js","./assets/PhotoFiche-CYNMJ1q5.js","./assets/PileCartes-DcM-54F-.js","./assets/Privacy-wE93i1wj.js","./assets/Profile-BcvJzbZA.js","./assets/Programme-BddcIxAT.js","./assets/Qcm-DxDTkMgd.js","./assets/Revise-BcwAp3QR.js","./assets/Seance--ooTPcZo.js","./assets/Shop-DZPRJhn8.js","./assets/StatsCharts-Dw2AX22O.js","./assets/Subject-C3JA9pTl.js","./assets/Theme-NoAxv7dJ.js","./assets/ar-CMQ-UpzX.js","./assets/calc-62orrPIx.js","./assets/common-CIZvQIe2.js","./assets/contenu-droit-DLNva_d6.js","./assets/contenu-economie-ByzwFWVf.js","./assets/contenu-gestion-finance-BFf2T9Y7.js","./assets/contenu-histoire-geo-F0ON0o2n.js","./assets/contenu-langues-Bndm6UbK.js","./assets/contenu-management-CcCdHt4n.js","./assets/contenu-maths-CvQqR-ds.js","./assets/contenu-mercatique-CZUmLJXn.js","./assets/contenu-p1-droit-BlHx7Eee.js","./assets/contenu-p1-economie-mQi8BtiL.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BD_eS3Rc.js","./assets/contenu-p1-langues-CHniLqxt.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-9zzR2_mI.js","./assets/contenu-rh-communication-DqHaeqKL.js","./assets/contenu-sig-CP5eSvFd.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-500-normal-BsRWmXhO.woff2","./assets/cormorant-garamond-latin-600-normal-Co1r35X9.woff2","./assets/cormorant-garamond-latin-700-normal-DajfzrDU.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-BS-MBU9T.js","./assets/epreuves-cPtKLxGq.js","./assets/es-Bo1kQClC.js","./assets/index-D31lGSBQ.css","./assets/index-Dr81679P.js","./assets/inter-latin-400-normal-C38fXH4l.woff2","./assets/inter-latin-500-normal-Cerq10X2.woff2","./assets/inter-latin-600-normal-LgqL8muc.woff2","./assets/inter-latin-700-normal-Yt3aPRUw.woff2","./assets/it-BDsU-Wqq.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-Bx9du2_3.js","./assets/public.en-Cl3mOd3a.js","./assets/public.es-Cc_5LZNf.js","./assets/public.it-C8gCwFec.js","./assets/readingPosition-7cnGqZ2f.js","./assets/study-BLlZC-37.js"]
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

// Mise en cache d'une nouvelle version. Chaque fichier est demandé au serveur
// (cache: 'reload') et non au cache du navigateur, qui garde l'ancienne page
// d'accueil une dizaine de minutes : sinon la nouvelle version pouvait garder
// l'ancienne page, qui appelle des fichiers déjà effacés (page blanche hors
// ligne). Si un fichier manque, l'installation échoue : l'ancienne version, dont
// le cache est complet, reste en place et la mise à jour sera retentée.
const charger = async (cache, url) => {
  const res = await fetch(new Request(url, { cache: 'reload' }))
  if (!res.ok) throw new Error(`${url} : ${res.status}`)
  await cache.put(url, res)
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      try {
        for (let i = 0; i < PRECACHE.length + CORE.length; i += 8) {
          await Promise.all([...CORE, ...PRECACHE].slice(i, i + 8).map((url) => charger(cache, url)))
        }
      } catch (e) {
        await caches.delete(CACHE)
        throw e
      }
      await self.skipWaiting()
    })()
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
          // Seule la vraie page d'accueil de l'app remplace la copie hors ligne :
          // une page d'erreur (404 d'une adresse inconnue, panne du serveur) ne
          // doit jamais prendre sa place.
          const accueil = new URL('./', self.location.href).pathname
          if (fresh.ok && fresh.status === 200 && (url.pathname === accueil || url.pathname === accueil + 'index.html')) {
            const cache = await caches.open(CACHE)
            cache.put('./index.html', fresh.clone())
          }
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
