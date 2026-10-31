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
const VERSION = '424e7e55d4'
const PRECACHE = ["./assets/Accessibility-DZ9d9E5C.js","./assets/BacBlanc-DvfxNntV.css","./assets/BacBlanc-Dwtf0bob.js","./assets/Badges-CNZC0nG_.js","./assets/Calcul-Bqw8Wqez.js","./assets/Cgu-A-9SFDoM.js","./assets/Chapter-8S9EYP5_.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-Chbo_zHZ.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-DHN-T_DW.js","./assets/Coach-kgkhrD2M.js","./assets/CoachAI-DmlnBrVA.js","./assets/Cours-81cPSqT5.js","./assets/Course-DliWqN3_.js","./assets/Customizer-DhThLFED.js","./assets/DailyChallenge-CL0M4urY.js","./assets/DeckDownload-CbpP_N2J.js","./assets/DossierProjet-CGACjQjM.js","./assets/EtudeGestion-DcSkF542.js","./assets/ExampleStudy-BjVMif7x.js","./assets/Excellence-B1ku3eHU.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-DSppzEd1.js","./assets/Favoris-CFBf0Nru.js","./assets/FlashcardsPage-CUE9BX0k.js","./assets/FormulaWorkshop-Bw8aaVph.js","./assets/Friends-DcbSmuk0.js","./assets/GameHost-Dxtml2v8.js","./assets/GrandOral-UsgO1KQn.js","./assets/Guide-CmkV6X74.js","./assets/Home-7zANcfeX.js","./assets/Home-DmRLRLiv.css","./assets/Landing-D60Kzc2y.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-CkIkf30X.js","./assets/Leaderboard-BlAP4Yq6.js","./assets/LegalContents-DBBuCpWQ.js","./assets/MesNotes-BSXrH7Pc.js","./assets/Methodo-l-8-Rp3d.js","./assets/Missions-DBL9P6OQ.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-co81aVc9.js","./assets/Parcours-BeS7jyio.js","./assets/Parent-vIZ-YejM.js","./assets/PhotoFiche-DguDX9BJ.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-BsKKQVW0.js","./assets/Privacy-WgrSc1iE.js","./assets/Profile-D81wPez8.js","./assets/Programme-BX_yEBEI.js","./assets/Qcm-CQNjQ6MS.js","./assets/Revise-BaQmYDRu.js","./assets/Revise-FV-8syb1.css","./assets/Seance-N3UnogA4.js","./assets/Settings-CoI94QUt.css","./assets/Settings-DmQB_qGT.js","./assets/Shop-CL83w5te.js","./assets/Shop-ZXplxDyq.css","./assets/StatsCharts-DUoWUH8L.js","./assets/StudyJourney-24iURN8G.css","./assets/StudyJourney-VrSJJMsi.js","./assets/Subject-5o1dGS1m.js","./assets/TexteRiche-CLvxnaY-.js","./assets/Theme-DDgedS1x.js","./assets/Vacances-Cy-u6qV-.css","./assets/Vacances-scZ6Yant.js","./assets/VacancesEntry-CN9sp6Lr.js","./assets/ar-BEckbjIv.json","./assets/ar-Cgo4ieFU.js","./assets/common-DKoDMdll.js","./assets/contenu-droit-CALlwfsI.js","./assets/contenu-economie-Dh4Oj6Yl.js","./assets/contenu-gestion-finance-B1Dzdrya.js","./assets/contenu-histoire-geo-BNhSPlbx.js","./assets/contenu-langues-CWmYh0bl.js","./assets/contenu-management-Djbg069d.js","./assets/contenu-maths-krdfGcVz.js","./assets/contenu-mercatique-CCAq-_Gn.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-DPkqM0Q2.js","./assets/contenu-sig-vAnERuDZ.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-C8x2nwbA.js","./assets/de-DZ2D-8Tn.json","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-22iPtPRD.json","./assets/en-SpTkyR31.js","./assets/epreuves-K0VRtKOy.js","./assets/es-DoeEU8cU.json","./assets/es-MEp6QMC9.js","./assets/examPdf-5xBTN0iW.js","./assets/examenPersonnalise-C_qF2Aby.js","./assets/guide-ar-CV-BH1p0.pdf","./assets/guide-de-DE2SVaqX.pdf","./assets/guide-en-1OGnCk1Q.pdf","./assets/guide-es-CBJS2dow.pdf","./assets/guide-it-Kvakt_n8.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-Bh97eh50.js","./assets/index-LAWGtqdk.js","./assets/index-RztIAzfl.css","./assets/index.es-CBWo40n_.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-BZWripTs.js","./assets/it-DEFm4tzF.json","./assets/jspdf.es.min-DzMJ6KKo.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-CZksc-iK.js","./assets/missions-Cb9WReso.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-CcAj_FXZ.js","./assets/public.de-BDdg0TxW.js","./assets/public.en-DGM4eEDu.js","./assets/public.es-BTshOYPz.js","./assets/public.it-DtVhupMy.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/rewardKit-QZlQCcam.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-uRsfcstJ.js","./assets/studyJourney-Bw9frd-B.js"]
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
