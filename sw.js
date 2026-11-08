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
const VERSION = '56b9e6de8f'
const PRECACHE = ["./assets/Accessibility-DAPGgDq8.js","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-CubDvUNV.js","./assets/Badges-lcGGbez_.js","./assets/Calcul-BGZ-07Wh.js","./assets/Cgu-CdKo-d4m.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-DA9XHE-C.js","./assets/ClassCodeForm-DqCGKPaY.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-Bv7aY9SO.js","./assets/Coach-BMRKukVb.js","./assets/Coach-DvZjU9ou.css","./assets/CoachAI-CO-D4yDi.js","./assets/Cours-D9efLrir.js","./assets/Course-DTxMUWHs.js","./assets/Customizer-BVCvpIxx.js","./assets/DailyChallenge-64FKykwe.js","./assets/DeckDownload-GobRLaK9.js","./assets/DossierProjet-COHcOWug.js","./assets/Eps-BW0uPkJd.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-d1p1Qh6B.js","./assets/ExampleStudy-4cq7rAKz.js","./assets/Excellence-B2HRvNQS.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-CzgfOPHx.js","./assets/Favoris-CgDj2dSB.js","./assets/FlashcardsPage-Cl8EbWVl.js","./assets/FormulaWorkshop-DJMKTLpT.js","./assets/Friends-DPlAGXmm.js","./assets/GameHost-Ddno8tk8.js","./assets/GrandOral-BBV7pWdT.js","./assets/Guide-Bolc48eX.js","./assets/Home-Dky_9bsG.js","./assets/Home-DmRLRLiv.css","./assets/Landing-Awkmp6zj.js","./assets/Languages-BDqyluAH.js","./assets/Languages-Be2IHY5S.css","./assets/Leaderboard-DcptKywu.js","./assets/LegalContents-Ch5PjPqZ.js","./assets/MesNotes-PfL9LIzm.js","./assets/Methodo-B4RUoT0-.js","./assets/Missions-DSjY6odU.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-CN6J2g7s.js","./assets/Parcours-BzbjHWLO.js","./assets/Parent-MpzGG5Ud.js","./assets/PhotoFiche-DHT525EQ.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-cUQ3Jtsc.js","./assets/Privacy-DAxQfwti.js","./assets/Profile-B3_NV8NL.js","./assets/Programme-4HvR0tRM.js","./assets/Qcm-CnF7Hzo6.js","./assets/Revise-DV0hlrUB.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DQGQXZ8E.js","./assets/Settings-CoI94QUt.css","./assets/Settings-DcwD7bRc.js","./assets/Shop-CJJyfYdc.css","./assets/Shop-CyzXJtjq.js","./assets/SportBac-B5AC1RPv.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-DRzfhKjV.js","./assets/StatsCharts-DIHOZT-E.js","./assets/StudyJourney-CV5xD-Ex.js","./assets/StudyJourney-CkFVrR5h.css","./assets/Subject-CeoAZr2R.js","./assets/TexteRiche-CSHtrr5w.js","./assets/Theme-Cz0yy7rQ.js","./assets/Vacances-C-eeOUKb.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-CEypho9a.js","./assets/ar-D7oCJxMK.js","./assets/ar-NVMY40vs.json","./assets/common-B1yV4pJg.js","./assets/contenu-droit-Up_wjTAP.js","./assets/contenu-economie-BeuWzGhm.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-BrLRF-BD.js","./assets/contenu-histoire-geo-B6oi2XQ4.js","./assets/contenu-langues-CQjLAKry.js","./assets/contenu-management-BIrLIr25.js","./assets/contenu-maths-CDUP3nVT.js","./assets/contenu-mercatique-DLSU2IHC.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-uJlUqNVo.js","./assets/contenu-p1-francais-TkBj-YwT.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-Bid8tG9T.js","./assets/contenu-p1-maths-Dno2i-Sy.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BWG6zJTZ.js","./assets/contenu-rh-communication-CGx7LeTz.js","./assets/contenu-sig-DyqSFxcE.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-CW2h0tbd.json","./assets/de-obusd_z0.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CoP14qo8.json","./assets/en-DYcbv7Qi.js","./assets/epreuves-CddfznxM.js","./assets/es-DaGKWNW4.js","./assets/es-lIY0dhZl.json","./assets/examPdf-ITOKNwah.js","./assets/examenPersonnalise-1u_AN-qP.js","./assets/guide-ar-CYSwJ0Mj.pdf","./assets/guide-de-8igkDzX8.pdf","./assets/guide-en-FYKQxeSh.pdf","./assets/guide-es-BE0KXwMH.pdf","./assets/guide-it-3IVDX1lb.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-DT_CIkgo.js","./assets/index-DnSpZfYy.js","./assets/index-mue4cWSX.css","./assets/index.es-ysaM1lKd.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-BbHoD12J.json","./assets/it-CW0m5Coj.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-B6dnKCw1.js","./assets/missions-BHbe1PqX.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-BiQAuJpe.js","./assets/public.de-BpOcVJpv.js","./assets/public.en-DXDzDRI8.js","./assets/public.es-Cn5mwAzk.js","./assets/public.it-0wXKQOo8.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-HMjWRI97.js","./assets/studyJourney-CPAEE3UX.js"]
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
