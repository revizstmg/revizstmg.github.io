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
const VERSION = '0ae5526d83'
const PRECACHE = ["./assets/Accessibility-BVOrmJTC.js","./assets/Admin-Cdb7TY-O.js","./assets/Avenir-3_-vmx5X.js","./assets/Avenir-Dzul4oAQ.css","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-IRZhvYLk.js","./assets/Badges-BrzA_nk4.js","./assets/Calcul-BrNWbDue.js","./assets/Cgu-BqyzAPiJ.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-DN0aA903.js","./assets/ClassCodeForm-BMIgbjZE.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-CjpTANMt.js","./assets/Coach-DRqgbBUQ.js","./assets/Coach-DvZjU9ou.css","./assets/CoachAI-BywjDqoP.js","./assets/Cours-CekmIFEp.js","./assets/Course-CBhpwEG-.js","./assets/Customizer-qoZ4MQQC.js","./assets/DailyChallenge-CWgkwmfj.js","./assets/DeckDownload-CMMVQvX1.js","./assets/DossierProjet-BTZi74iD.js","./assets/Eps-d1v-YHaA.css","./assets/Eps-tsYdblBE.js","./assets/EtudeGestion-BqRm9qJX.js","./assets/ExampleStudy-DsGLVzcU.js","./assets/Excellence-BXcC53Br.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-CPvs9JJ_.js","./assets/Favoris-BKgD2Xu3.js","./assets/FlashcardsPage-Dr0aJXsv.js","./assets/FormulaWorkshop-pq1NRgiu.js","./assets/Friends-BQ3Gvbkq.js","./assets/GameHost-Ba2hevxU.js","./assets/GrandOral-DNlgJCnV.js","./assets/Guide-CiRh3cGx.js","./assets/Home-BriXCVh8.css","./assets/Home-D1Yo2oD7.js","./assets/Landing-D2aII7Ai.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-Cs03WY_P.js","./assets/Leaderboard-DQQfrdBM.js","./assets/LegalContents-DR-SsIuJ.js","./assets/MesNotes-BRtxpun4.js","./assets/Methodo-Bh37zOsx.js","./assets/Missions-BwxcV9lr.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-ZZgrCgo5.js","./assets/Parcours-CQOmEOOI.js","./assets/Parent-Da1_ob8z.js","./assets/PhotoFiche-CrRfcTwn.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-Dcse57YA.js","./assets/Privacy-B5FB8bCM.js","./assets/Profile-DftA8VQN.js","./assets/Programme-CPzqnSHr.js","./assets/Qcm-DYkxD1WZ.js","./assets/Revise-C7i22tbn.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DhLoJ59x.js","./assets/Settings-CoI94QUt.css","./assets/Settings-DqodXn_W.js","./assets/Shop-C1g3iQLi.js","./assets/Shop-CJJyfYdc.css","./assets/SportBac-BTmlB0hv.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-Duy3eMxy.js","./assets/StatsCharts-ny3eiRbG.js","./assets/StudyJourney-BwZeerbS.js","./assets/StudyJourney-CkFVrR5h.css","./assets/Subject-BHNrjdPG.js","./assets/TexteRiche-BYK6sJZ-.js","./assets/Theme-7pPWZbqt.js","./assets/Vacances-Cy-u6qV-.css","./assets/Vacances-DWqI4KtT.js","./assets/VacancesEntry-DcPqvbZO.js","./assets/ar-04LA8_V7.json","./assets/ar-BBiljuHG.js","./assets/ar-DxuPfmUH.js","./assets/common-Cs563VST.js","./assets/contenu-droit-oakkAZL4.js","./assets/contenu-economie-B__GeSAD.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-DtD7QeIV.js","./assets/contenu-histoire-geo-CAxQ3PWC.js","./assets/contenu-langues-BT4G9kXH.js","./assets/contenu-management-0tDOvcOq.js","./assets/contenu-maths-mG6HTojC.js","./assets/contenu-mercatique-DlIfDoqj.js","./assets/contenu-p1-droit-WS_UZsQl.js","./assets/contenu-p1-economie-DLV3e7pa.js","./assets/contenu-p1-francais-BtqmTm6S.js","./assets/contenu-p1-histoire-geo-CATFy6vs.js","./assets/contenu-p1-langues-ZBkpa0Tv.js","./assets/contenu-p1-management-dzjDFzj9.js","./assets/contenu-p1-maths-DqKuRXMz.js","./assets/contenu-p1-sgn-C95m4LLW.js","./assets/contenu-philosophie-Cp3Dyeb4.js","./assets/contenu-rh-communication-C352PNFe.js","./assets/contenu-sig-Bf9SrrBY.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-DPt2skND.js","./assets/de-HW_ff1V-.json","./assets/de-irB-wnUU.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CN1DxA8M.js","./assets/en-TCwrEnFj.json","./assets/en-uGc21EWU.js","./assets/epreuves-D60QQyQk.js","./assets/es-BCQnz-k3.js","./assets/es-C34zSBSm.js","./assets/es-lIY0dhZl.json","./assets/examPdf-CKSMCCk_.js","./assets/examenPersonnalise-DEiSzAM8.js","./assets/guide-ar-DKkYdLYL.pdf","./assets/guide-de-A7ojxxbo.pdf","./assets/guide-en-Z-BxRhG7.pdf","./assets/guide-es-BgJilBCa.pdf","./assets/guide-it-aunYzCEP.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-dOygLqAc.js","./assets/index-DgExSNjD.js","./assets/index-WMgxHhEH.css","./assets/index.es-CeaP1UZC.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-1cxJydLB.js","./assets/it-B7i_Wa7b.js","./assets/it-JGGmN5SM.json","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-DqPIaMEw.js","./assets/missions-cAh54p5X.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-VNP9qHOF.js","./assets/public.de-DCUPnBYk.js","./assets/public.en-CZeulPY_.js","./assets/public.es-BtE9IfJr.js","./assets/public.it-Bh4jCQjo.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-CVUkpM9K.js","./assets/studyJourney-bY99VSr_.js"]
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
          const cached = await cache.match(req, { ignoreVary: true })
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
          if(publicPage)return (await cache.match(req, { ignoreVary: true })) || new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne | RévizSTMG</title><main><h1>Cette fiche n’est pas encore disponible hors ligne</h1><p>Reconnecte-toi pour la lire, ou retrouve tes cours dans l’application.</p><a href="'+scopePath+'">Ouvrir RévizSTMG</a></main></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})
          return (
            (await cache.match('./index.html')) ||
            (await cache.match('./')) ||
            (await cache.match(req, { ignoreVary: true })) ||
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
      // ignoreVary : un hébergeur qui envoie « Vary: Origin » ne doit pas faire manquer le cache hors ligne.
      const cached = await cache.match(req, { ignoreVary: true })
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
