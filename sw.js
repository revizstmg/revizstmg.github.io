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
const VERSION = 'be208d6fd3'
const PRECACHE = ["./assets/Accessibility-Ba2xxra1.js","./assets/BacBlanc-CpfjbBbR.js","./assets/BacBlanc-DvfxNntV.css","./assets/Badges-CMModDWT.js","./assets/Calcul-CnHXrwHL.js","./assets/Cgu-BAXADcYC.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-CuTkKUsz.js","./assets/ClassCodeForm-ClHeJENP.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-fwiQ-K8p.js","./assets/Coach-BmWJ5bQ7.js","./assets/CoachAI-Cu5fgIzE.js","./assets/Cours-BUOct-W5.js","./assets/Course-BOqQ7vNz.js","./assets/Customizer-CapQ-Ca6.js","./assets/DailyChallenge-DHj5HiU9.js","./assets/DeckDownload-DVin_tiw.js","./assets/DossierProjet-CARhK6ev.js","./assets/EtudeGestion-P5gbWFIk.js","./assets/ExampleStudy-DtrDy7jv.js","./assets/Excellence-B8ptOpl6.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-DMtxipY8.js","./assets/Favoris-DMhk8Np0.js","./assets/FlashcardsPage-DcY15sRQ.js","./assets/FormulaWorkshop-IEXScSvd.js","./assets/Friends-CHT2gs5o.js","./assets/GameHost-C9kB60p3.js","./assets/GrandOral-DGPvHlg6.js","./assets/Guide-BUywzArc.js","./assets/Home-B0NRocIC.js","./assets/Home-DmRLRLiv.css","./assets/Landing-C62KuGTl.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-CKvGIoCO.js","./assets/Leaderboard-Bvwm0YNl.js","./assets/LegalContents-DTZ-kTg8.js","./assets/MesNotes-CKR8ZfKI.js","./assets/Methodo-B2RQOP4t.js","./assets/Missions-B-2zRtIK.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-kvLrqQ6k.js","./assets/Parcours-rUEggc6j.js","./assets/Parent-QWrU6uAt.js","./assets/PhotoFiche-D5woDvLp.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-sB5jrONc.js","./assets/Privacy-CX-4avWv.js","./assets/Profile-Cub4BUgp.js","./assets/Programme-B2Vb_reO.js","./assets/Qcm-LsZI4Fsb.js","./assets/Revise-CGzR1yfP.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DOM-57gB.js","./assets/Settings-CoI94QUt.css","./assets/Settings-bjhc0uDh.js","./assets/Shop-SjV0FOZ7.js","./assets/Shop-ZXplxDyq.css","./assets/StatsCharts-wKYIeWNY.js","./assets/StudyJourney-24iURN8G.css","./assets/StudyJourney-Dz4tqxo1.js","./assets/Subject-C7p8XEJQ.js","./assets/TexteRiche-Dq-bZEBf.js","./assets/Theme-UsHVTVQz.js","./assets/Vacances-Cy-u6qV-.css","./assets/Vacances-DdS9w3tO.js","./assets/VacancesEntry-DpuO7UD6.js","./assets/ar-BEckbjIv.json","./assets/ar-Cgo4ieFU.js","./assets/common-DixltOPA.js","./assets/contenu-droit-CALlwfsI.js","./assets/contenu-economie-Dh4Oj6Yl.js","./assets/contenu-gestion-finance-B1Dzdrya.js","./assets/contenu-histoire-geo-BNhSPlbx.js","./assets/contenu-langues-CWmYh0bl.js","./assets/contenu-management-Djbg069d.js","./assets/contenu-maths-krdfGcVz.js","./assets/contenu-mercatique-CCAq-_Gn.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-DPkqM0Q2.js","./assets/contenu-sig-vAnERuDZ.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-C8x2nwbA.js","./assets/de-DZ2D-8Tn.json","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-22iPtPRD.json","./assets/en-SpTkyR31.js","./assets/epreuves-DvgvKYLe.js","./assets/es-DoeEU8cU.json","./assets/es-MEp6QMC9.js","./assets/examPdf-C9dY0RZx.js","./assets/examenPersonnalise-CuxZ6fKM.js","./assets/guide-ar-CV-BH1p0.pdf","./assets/guide-de-DE2SVaqX.pdf","./assets/guide-en-1OGnCk1Q.pdf","./assets/guide-es-CBJS2dow.pdf","./assets/guide-it-Kvakt_n8.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-OChK4eH-.js","./assets/index-CxFmM-K_.js","./assets/index-RztIAzfl.css","./assets/index.es-CCt6KoXJ.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-BZWripTs.js","./assets/it-DEFm4tzF.json","./assets/jspdf.es.min-YCzZ4HEj.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-7nzvac9Y.js","./assets/missions-D32bwm8G.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-CcAj_FXZ.js","./assets/public.de-BDdg0TxW.js","./assets/public.en-DGM4eEDu.js","./assets/public.es-BTshOYPz.js","./assets/public.it-DtVhupMy.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/rewardKit-Dg1VsIFE.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-07TeNG0R.js","./assets/studyJourney-Bw9frd-B.js"]
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
