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
const VERSION = 'bf9a5f42d0'
const PRECACHE = ["./assets/BacBlanc-Bl-xYdRv.js","./assets/BacBlanc-DlU3NHwG.css","./assets/Badges-DIs3mfMs.js","./assets/Cgu-9KLCtudv.js","./assets/Chapter-D-ChqdgG.js","./assets/ClassCodeForm-DX0Y6uKt.js","./assets/Classe-BQaZHN7f.js","./assets/Coach-CWn_0Iwu.js","./assets/CoachAI-DNg4ygyt.js","./assets/Cours-CQbbu0OJ.js","./assets/Course-4RMSrGdU.js","./assets/Customizer-DlsqB6X-.js","./assets/DailyChallenge-Y-nFBUSl.js","./assets/DeckDownload-D0fBdXI9.js","./assets/DossierProjet-Z4_gRnC-.js","./assets/EtudeGestion-CvA24LBg.js","./assets/Faq-DJPQ0amU.js","./assets/Favoris-0MlmPIIM.js","./assets/FlashcardsPage-YaxGerFw.js","./assets/FormulaWorkshop-BRD9jZOF.js","./assets/Friends-CSbuIZey.js","./assets/GameHost-O8Ps2t8z.js","./assets/GrandOral-BoP8Jwqj.js","./assets/Guide-DIxLXi_d.js","./assets/Home-BIP89svv.css","./assets/Home-DAJoXz6r.js","./assets/Landing-CZIynezj.js","./assets/Leaderboard-FJrqJ0J-.js","./assets/LegalContents-DKQC7rY7.js","./assets/MesNotes-APWpsIy-.js","./assets/Methodo-BQ0DaxaH.js","./assets/Parent-BjXOGZql.js","./assets/PhotoFiche-EgiVHtof.js","./assets/PileCartes-IkHmZnkz.js","./assets/Privacy-Cihivydf.js","./assets/Profile-Cr8pRPBd.js","./assets/Programme-BxTsF2OV.js","./assets/Qcm-dR0nF6aN.js","./assets/Revise-DWUKpryl.css","./assets/Revise-Dbx5UZ40.js","./assets/Seance-D6q5M4Xw.js","./assets/Shop-g4VxEsSA.js","./assets/StatsCharts-DyKiMPZb.js","./assets/Subject-DqxTIiyH.js","./assets/Theme-BMve-R_V.js","./assets/ar-Cvjk-cUD.js","./assets/common-0grcB5db.js","./assets/contenu-droit-1P6drU5k.js","./assets/contenu-economie-DzBO1IpO.js","./assets/contenu-gestion-finance-BFf2T9Y7.js","./assets/contenu-histoire-geo-F0ON0o2n.js","./assets/contenu-langues-Bndm6UbK.js","./assets/contenu-management-CcCdHt4n.js","./assets/contenu-maths-krdfGcVz.js","./assets/contenu-mercatique-CZUmLJXn.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BD_eS3Rc.js","./assets/contenu-p1-langues-CHniLqxt.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-DqHaeqKL.js","./assets/contenu-sig-CP5eSvFd.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-riV8p8Ik.js","./assets/epreuves-BmUJQGhC.js","./assets/es-Cd6qegjS.js","./assets/examPdf-jci8LlnS.js","./assets/html2canvas.esm-CBrSDip1.js","./assets/index-CZ55ghqR.js","./assets/index-DuxuYdGR.css","./assets/index.es-BNvcZFb0.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-CfolTsfG.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-ZPXk9hEY.js","./assets/public.en-Gh22RDaI.js","./assets/public.es-Bf_Q4ybS.js","./assets/public.it-CWgLG3f-.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-7cnGqZ2f.js","./assets/study-CK5qeVIo.js"]
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
  if (event.data?.type === 'OFFLINE_STATUS' && event.ports[0]) event.waitUntil((async()=>{
    try {
      const cache=await caches.open(CACHE)
      // Les imports peuvent remplacer une entrée avec Vary: Origin. Le contrôle
      // de présence des fichiers statiques doit aussi trouver cette représentation.
      const present=await Promise.all([...CORE,...PRECACHE].map(url=>cache.match(new URL(url,self.registration.scope).href,{ignoreVary:true})))
      event.ports[0].postMessage({type:'OFFLINE_STATUS',version:VERSION,ready:present.every(Boolean)})
    } catch {event.ports[0].postMessage({type:'OFFLINE_STATUS',ready:false})}
  })())
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
