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
const VERSION = '8cace4ab4f'
const PRECACHE = ["./assets/Accessibility-CQs3AE0k.js","./assets/Admin-5DZU98_Z.js","./assets/Admin-ZL_1gHNS.css","./assets/Avenir-Dzul4oAQ.css","./assets/Avenir-XbNHlH5S.js","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-ASzK7Fw6.js","./assets/Badges-GPIFSGj_.js","./assets/Calcul-tUuPk3ui.js","./assets/Cgu-DByL9g64.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-CyMMST7g.js","./assets/ClassCodeForm-Bm3_j_my.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-DAMHoZHg.js","./assets/Coach-DioVEH8J.js","./assets/Coach-DvZjU9ou.css","./assets/CoachAI-L30PB5qO.js","./assets/Cours-fvSRUuFG.js","./assets/Course-Dpjnz8kH.js","./assets/Customizer-N2kxpcQ1.js","./assets/DailyChallenge-D_68wl0T.js","./assets/DeckDownload-BmcNm9BE.js","./assets/DossierProjet-CU2-4mEi.js","./assets/Eps-DQfpM50v.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-D1lzixtK.js","./assets/ExampleStudy-BXTl1J8U.js","./assets/Excellence-DB6jlBZW.css","./assets/Excellence-DvokaOpd.js","./assets/Faq-B-iFXcPz.js","./assets/Favoris-CjW5JBji.js","./assets/FlashcardsPage-DdfwMqHQ.js","./assets/FormulaWorkshop-Bd40LGc1.js","./assets/Friends-DWtj6zs9.js","./assets/GameHost-B9z5svFX.js","./assets/GrandOral-aQIJZmYN.js","./assets/Guide-CUcNW51a.js","./assets/Home-BriXCVh8.css","./assets/Home-DrpZU9wF.js","./assets/Landing-BlqmpKQT.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-Bgk5GnnF.js","./assets/Leaderboard-ClGVwsNM.js","./assets/LegalContents-DMhWBE30.js","./assets/MesNotes-dfT9SNyu.js","./assets/Methodo-5GYcikRW.js","./assets/Missions-D8IXKAdR.js","./assets/Missions-DeyGwgnl.css","./assets/ModeScroll-B6YR6fJP.js","./assets/ModeScroll-DJuzvbsl.css","./assets/Offers-DqoRfeKw.js","./assets/Parcours-ZOpHV2p_.js","./assets/Parent-BIlbctUe.js","./assets/PhotoFiche-Bw09EB0B.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-BnFPOSsE.js","./assets/Privacy-DvTEzIou.js","./assets/Profile-BrADhv4j.js","./assets/Programme-D4D9NE61.js","./assets/Qcm-DoThe0Y4.js","./assets/Revise-BbBzUSsj.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DFPCgQEy.js","./assets/Settings-CoI94QUt.css","./assets/Settings-DLcl6Qh8.js","./assets/Shop-CJJyfYdc.css","./assets/Shop-SLgl8AE7.js","./assets/SportBac-ByRenb5q.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-rClZrcYi.js","./assets/StatsCharts-B6rRTQ9Q.js","./assets/StudyJourney-C4uMOt6A.js","./assets/StudyJourney-CkFVrR5h.css","./assets/Subject-C5X9JJYQ.js","./assets/TexteRiche-BWdrl9xY.js","./assets/Theme-9kVNJ3NG.js","./assets/Vacances-BEp4Mz94.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-DLG-sgwU.js","./assets/ar-04LA8_V7.json","./assets/ar-BBiljuHG.js","./assets/ar-CJ56R8Js.js","./assets/common-DyrkF3W-.js","./assets/contenu-droit-BqUBoda1.js","./assets/contenu-economie-DttKRd8j.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-BHkJmY6T.js","./assets/contenu-histoire-geo-BYZsYlI2.js","./assets/contenu-langues-BT4G9kXH.js","./assets/contenu-management-CsEB6e-L.js","./assets/contenu-maths-DknVbSO5.js","./assets/contenu-mercatique-I_ruByVj.js","./assets/contenu-p1-droit-4Ec5_AEk.js","./assets/contenu-p1-economie-Dyu1tZcv.js","./assets/contenu-p1-francais-DGByrq2m.js","./assets/contenu-p1-histoire-geo-W7BKGxsM.js","./assets/contenu-p1-langues-ZBkpa0Tv.js","./assets/contenu-p1-management-CeZ72_po.js","./assets/contenu-p1-maths-Buhe0cBj.js","./assets/contenu-p1-sgn-BUBBGM56.js","./assets/contenu-philosophie-B_TIXyVm.js","./assets/contenu-rh-communication-DLLWui8J.js","./assets/contenu-sig-B_y9P61g.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-CKxfBbbJ.js","./assets/de-HW_ff1V-.json","./assets/de-irB-wnUU.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-BebpvxsU.js","./assets/en-TCwrEnFj.json","./assets/en-uGc21EWU.js","./assets/epreuves-IB1xswpi.js","./assets/es-BCQnz-k3.js","./assets/es-D5EuqUSc.js","./assets/es-lIY0dhZl.json","./assets/examPdf-B8mO8XHe.js","./assets/examenPersonnalise-C-QPuHPP.js","./assets/guide-ar-DKkYdLYL.pdf","./assets/guide-de-A7ojxxbo.pdf","./assets/guide-en-Z-BxRhG7.pdf","./assets/guide-es-BgJilBCa.pdf","./assets/guide-it-aunYzCEP.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-B7h0v9ZO.js","./assets/index-C2-wmodS.css","./assets/index-DbkUJugZ.js","./assets/index.es-DHHUTZbb.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-B7i_Wa7b.js","./assets/it-JGGmN5SM.json","./assets/it-a3R4Oiti.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-D1J4pG8u.js","./assets/missions-Da1u9kSB.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-DKoXpOvL.js","./assets/public.de-BibPBnUB.js","./assets/public.en-M_e_dRcl.js","./assets/public.es-DQ3jqQ9e.js","./assets/public.it-S-9GmnHz.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-vLCYSYiH.js","./assets/studyJourney-bY99VSr_.js"]
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
