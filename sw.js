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
const VERSION = '8a2007d744'
const PRECACHE = ["./assets/Accessibility-CVPL4HiP.js","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-BNIL0LIn.js","./assets/Badges-BUuIJG0_.js","./assets/Calcul-CBBLzQBM.js","./assets/Cgu-Dis2tFPS.js","./assets/Chapter-BemEx-07.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-CbYcdwXT.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-G303_D8H.js","./assets/Coach-DYauABtJ.js","./assets/Coach-DvZjU9ou.css","./assets/CoachAI-sSfaiJ9d.js","./assets/Cours-CIejtrgM.js","./assets/Course-BEvr3GcF.js","./assets/Customizer-DQ00_Fym.js","./assets/DailyChallenge-yHcvWAjS.js","./assets/DeckDownload-CMZYvK5E.js","./assets/DossierProjet-BHmhem0y.js","./assets/Eps-CE7YEixv.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-C3sw3xiy.js","./assets/ExampleStudy-BUJLYbOi.js","./assets/Excellence-BJbJVjXa.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-ClVEldU_.js","./assets/Favoris-DBImttKY.js","./assets/FlashcardsPage-C7cOAOEd.js","./assets/FormulaWorkshop-Bsadrn9d.js","./assets/Friends-DnEliJg-.js","./assets/GameHost-xwB2itOA.js","./assets/GrandOral-fLhkDbdH.js","./assets/Guide-RzkJ7t_B.js","./assets/Home-B_Ywh7zJ.css","./assets/Home-j2t469pE.js","./assets/Landing-DUhy3gnD.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-g0sBwtVi.js","./assets/Leaderboard-boAlyuwz.js","./assets/LegalContents-DFclHR4Y.js","./assets/MesNotes-o0y2XwBZ.js","./assets/Methodo-PEsXAAwJ.js","./assets/Missions-D9COFU1D.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-BmvbaaHT.js","./assets/Parcours-CtGStO24.js","./assets/Parent-BemTgBa9.js","./assets/PhotoFiche-ou0J5eP8.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-BbpdkUAG.js","./assets/Privacy-DTGvxld1.js","./assets/Profile-T1er1x1Y.js","./assets/Programme-DisWanPT.js","./assets/Qcm-DyUdCdPB.js","./assets/Revise-CbRT4Mx0.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DGBp6l7h.js","./assets/Settings-CJ056x4a.js","./assets/Settings-CoI94QUt.css","./assets/Shop-C0x_KoOK.js","./assets/Shop-CJJyfYdc.css","./assets/SportBac-VHH_POAb.css","./assets/SportBac-l22o5ubJ.js","./assets/SportBacReference-DuiZrfLk.js","./assets/StatsCharts-C_TcsFVH.js","./assets/StudyJourney-CKUzXbyS.js","./assets/StudyJourney-CkFVrR5h.css","./assets/Subject-CJUCRfnI.js","./assets/TexteRiche-BCLcuyrb.js","./assets/Theme-DYipOGGd.js","./assets/Vacances-Cy-u6qV-.css","./assets/Vacances-DF5pEdV7.js","./assets/VacancesEntry-N2svT1ES.js","./assets/ar-D0-l0wrW.js","./assets/ar-NVMY40vs.json","./assets/common-Bfeoyf-9.js","./assets/contenu-droit-Up_wjTAP.js","./assets/contenu-economie-BeuWzGhm.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-UGm4qsmQ.js","./assets/contenu-histoire-geo-B6oi2XQ4.js","./assets/contenu-langues-CQjLAKry.js","./assets/contenu-management-BIrLIr25.js","./assets/contenu-maths-CDUP3nVT.js","./assets/contenu-mercatique-CTLJ58a6.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-uJlUqNVo.js","./assets/contenu-p1-francais-TkBj-YwT.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-Bid8tG9T.js","./assets/contenu-p1-maths-Dno2i-Sy.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BWG6zJTZ.js","./assets/contenu-rh-communication-CYaFUvAF.js","./assets/contenu-sig-D4do1_7j.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-BdBLP3Um.js","./assets/de-CW2h0tbd.json","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CoP14qo8.json","./assets/en-DqS6ZA6U.js","./assets/epreuves-DZkoBCGN.js","./assets/es-lIY0dhZl.json","./assets/es-tkSHLABW.js","./assets/examPdf-5YSLXaIQ.js","./assets/examenPersonnalise-DE14cnij.js","./assets/guide-ar-CYSwJ0Mj.pdf","./assets/guide-de-8igkDzX8.pdf","./assets/guide-en-FYKQxeSh.pdf","./assets/guide-es-BE0KXwMH.pdf","./assets/guide-it-3IVDX1lb.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-CxjSOQwk.js","./assets/index-B08qwQ6S.js","./assets/index-KAyqczP6.css","./assets/index.es-C4EUMqzD.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-BbHoD12J.json","./assets/it-DuPKnYKj.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-CSB7ymh4.js","./assets/missions-SIXh7055.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-DB-GKsI2.js","./assets/public.de-CQRUdvEe.js","./assets/public.en-DNWCSbja.js","./assets/public.es-BUt1-QHw.js","./assets/public.it-CQ53aIHK.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-Bg14lMd2.js","./assets/studyJourney-BgR55qnu.js"]
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
