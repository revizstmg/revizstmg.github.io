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
const VERSION = '2f2b1bd29b'
const PRECACHE = ["./assets/Accessibility-DFmZqENZ.js","./assets/BacBlanc-B4QziwmS.js","./assets/BacBlanc-DXfLAdav.css","./assets/Badges-7AO8miHV.js","./assets/Cgu-CsppFR_r.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-Dt1aT6F5.js","./assets/ClassCodeForm-B5ysP5xW.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-DneTZxoJ.js","./assets/Coach-Dxyk4-34.js","./assets/CoachAI-XiAiKz_6.js","./assets/Cours-C43e9Rcr.js","./assets/Course-BzHoiFeM.js","./assets/CourseStudio-BSu8n3-z.css","./assets/CourseStudio-xX1BrrC-.js","./assets/Customizer-BFe1jGMX.js","./assets/DailyChallenge-Dx5HTJ2D.js","./assets/DeckDownload-D1LIP7KI.js","./assets/DossierProjet-BLnJLyaa.js","./assets/EtudeGestion-CyqiWWRL.js","./assets/ExampleStudy-Cv3lyjsY.js","./assets/Excellence-DB6jlBZW.css","./assets/Excellence-IybkjxjX.js","./assets/Faq-D3MbZB8Y.js","./assets/Favoris-Cd02VqmI.js","./assets/FlashcardsPage-Bw8ZDJRC.js","./assets/FormulaWorkshop-DaVJhhPd.js","./assets/Friends-CZEvfgP9.js","./assets/GameHost-CAuQIhsC.js","./assets/GrandOral-Dm6Uv9k_.js","./assets/Guide-iVA_8GjO.js","./assets/Home-BNiCuJm-.css","./assets/Home-Cj-bwugL.js","./assets/Landing-ggeaEp2-.js","./assets/Languages-B4AdRcA7.js","./assets/Languages-Be2IHY5S.css","./assets/Leaderboard-C8p8DgDF.js","./assets/LegalContents-DQ7D7YB_.js","./assets/MesNotes-Dxg4kK8e.js","./assets/Methodo-BvAlqx13.js","./assets/Missions-BOxcS05F.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-CGuxHCLD.js","./assets/Parent-DlK_Hfe9.js","./assets/PhotoFiche-wy5QKRqi.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-DJTZYzhC.js","./assets/Privacy-Be-Jmpmc.js","./assets/Profile-4CLHd5T0.js","./assets/Programme-BWHeVGxM.js","./assets/Qcm-B-YT7_6M.js","./assets/Revise-ChLv4pVG.js","./assets/Revise-FV-8syb1.css","./assets/Seance-4yJvOUw_.js","./assets/Settings-BnK5yTnb.js","./assets/Settings-CoI94QUt.css","./assets/Shop-ZXplxDyq.css","./assets/Shop-jgnTAUJS.js","./assets/StatsCharts-BzNFPT27.js","./assets/StudyJourney-24iURN8G.css","./assets/StudyJourney-DL30BjEw.js","./assets/Subject-Bl6L7xk9.js","./assets/Theme-BynJl6DU.js","./assets/ar-B03i-Dfn.js","./assets/ar-CNCC3icz.js","./assets/common-DZT3vHm7.js","./assets/contenu-droit-CALlwfsI.js","./assets/contenu-economie-Dh4Oj6Yl.js","./assets/contenu-gestion-finance-B1Dzdrya.js","./assets/contenu-histoire-geo-BNhSPlbx.js","./assets/contenu-langues-TcEy4on1.js","./assets/contenu-management-Djbg069d.js","./assets/contenu-maths-krdfGcVz.js","./assets/contenu-mercatique-CCAq-_Gn.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-YXYfMpJN.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-DPkqM0Q2.js","./assets/contenu-sig-BWrNWmMb.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-CmqmBc1U.js","./assets/de-hxwvxeqd.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-DCT_UilT.js","./assets/en-s8IgbIsr.js","./assets/epreuves-Ta1nGZxJ.js","./assets/es-DfBOWzue.js","./assets/es-KF9RJpVr.js","./assets/examPdf-CDDUHRcO.js","./assets/examenPersonnalise-A68tAR19.js","./assets/guide-ar-CV-BH1p0.pdf","./assets/guide-de-DE2SVaqX.pdf","./assets/guide-en-1OGnCk1Q.pdf","./assets/guide-es-CBJS2dow.pdf","./assets/guide-it-Kvakt_n8.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/index-ChueGnYj.js","./assets/index-ictR7x4Q.css","./assets/index.es-DV_XIevt.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-Byijp_oG.js","./assets/it-iv_xVh1Y.js","./assets/jspdf.es.min-CYtYiHGe.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-D-lWNm1n.js","./assets/missions-D4gV-2zC.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-ClCXCWuj.js","./assets/public.de-CBgpoVEQ.js","./assets/public.en-S6WE5fCI.js","./assets/public.es-CeQdLOLe.js","./assets/public.it-AhQlIxht.js","./assets/purify.es-CAi2OJFm.js","./assets/rewardKit-CkPFGSKl.js","./assets/study-BK5l8foa.js","./assets/studyJourney-4mjQXVZV.js"]
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
          const scopePath = new URL('./', self.location.href).pathname
          const publicPage = ['cours/','a-propos/','partager/'].some(p => url.pathname.startsWith(scopePath + p))
          if(fresh.ok && publicPage){const cache=await caches.open(CACHE);cache.put(req,fresh.clone())}
          return fresh
        } catch {
          const cache = await caches.open(CACHE)
          const scopePath = new URL('./', self.location.href).pathname
          const publicPage = ['cours/','a-propos/','partager/'].some(p => url.pathname.startsWith(scopePath + p))
          if(publicPage)return (await cache.match(req)) || new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne | RévizSTMG</title><main><h1>Cette fiche n’est pas encore disponible hors ligne</h1><p>Reconnecte-toi pour la lire, ou retrouve tes cours dans l’application.</p><a href="'+scopePath+'">Ouvrir RévizSTMG</a></main></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})
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
