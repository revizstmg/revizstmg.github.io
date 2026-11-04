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
const VERSION = '90b415302b'
const PRECACHE = ["./assets/Accessibility-VvOT568J.js","./assets/BacBlanc-6VjfuWlb.js","./assets/BacBlanc-DvfxNntV.css","./assets/Badges-DYX-kK_x.js","./assets/Calcul-BU5tRDwh.js","./assets/Cgu-CGaFB3JJ.js","./assets/Chapter-BVNcXmKp.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-B5QUF5po.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-DLoDA4P8.js","./assets/Coach-NnjHqZYa.js","./assets/CoachAI-Cgt-pSI4.js","./assets/Cours-CI64EVmm.js","./assets/Course-BM9s5DLo.js","./assets/Customizer-CVEGa1ad.js","./assets/DailyChallenge-Cq_gT_qA.js","./assets/DeckDownload-DQ7S0Z-l.js","./assets/DossierProjet-DciUjQE-.js","./assets/EtudeGestion-Buk0B587.js","./assets/ExampleStudy-uUBfwOJj.js","./assets/Excellence-Boqr81Zz.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-ZgmB-Vrr.js","./assets/Favoris-8cLHhwsH.js","./assets/FlashcardsPage-B8Goz1XR.js","./assets/FormulaWorkshop-C0BzX5Bj.js","./assets/Friends-B4k1p27N.js","./assets/GameHost-D723Utwj.js","./assets/GrandOral-B3xFjxNe.js","./assets/Guide-5LmdATdv.js","./assets/Home-DmRLRLiv.css","./assets/Home-VxLYYQHM.js","./assets/Landing-CEARO0By.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-vKM6EIGF.js","./assets/Leaderboard-BCX5y8-b.js","./assets/LegalContents-Bil8GSjM.js","./assets/MesNotes-DzMnIrh7.js","./assets/Methodo-BRRW6GKh.js","./assets/Missions-DB5K2cX6.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-ClkM9-RS.js","./assets/Parcours-6w-Tw9vf.js","./assets/Parent-DENAnXog.js","./assets/PhotoFiche-D8PdntiK.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-aeBh8Rg2.js","./assets/Privacy-DLIRCBUR.js","./assets/Profile-BCBb3DAl.js","./assets/Programme-GkpPOagV.js","./assets/Qcm-BoTkZQdC.js","./assets/Revise-DVANjKUj.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DgwnPgDp.js","./assets/Settings-CoI94QUt.css","./assets/Settings-ccN0wyRU.js","./assets/Shop-BRqu4g72.js","./assets/Shop-ZXplxDyq.css","./assets/SportBac-DJ6A_AuC.js","./assets/StatsCharts-BTfNY9uQ.js","./assets/StudyJourney-24iURN8G.css","./assets/StudyJourney-D45mhoEq.js","./assets/Subject-EJzzaDxR.js","./assets/TexteRiche-ue1MDJGF.js","./assets/Theme-BMPHSn1u.js","./assets/Vacances-Bl_G_h-C.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-D1W2kJlM.js","./assets/ar-BEckbjIv.json","./assets/ar-Dk3MuPdf.js","./assets/common-CU1KMzsv.js","./assets/contenu-droit-CUgMsFzp.js","./assets/contenu-economie-CpYnvD3C.js","./assets/contenu-gestion-finance-CauctlRR.js","./assets/contenu-histoire-geo-DvmxJBva.js","./assets/contenu-langues-CQjLAKry.js","./assets/contenu-management-Djbg069d.js","./assets/contenu-maths-DpqMBik8.js","./assets/contenu-mercatique-DLSU2IHC.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-TkBj-YwT.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-BvAWPmqw.js","./assets/contenu-p1-maths-eerizEHc.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-CDME4wcH.js","./assets/contenu-sig-Ln_hxo2b.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-Bn-k7zRd.js","./assets/de-DZ2D-8Tn.json","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-22iPtPRD.json","./assets/en-3hcaAIov.js","./assets/epreuves-BTku2kr4.js","./assets/es-CxZn4dsC.js","./assets/es-DoeEU8cU.json","./assets/examPdf-n-dIKIUo.js","./assets/examenPersonnalise-B1R4s6j6.js","./assets/guide-ar-CV-BH1p0.pdf","./assets/guide-de-DE2SVaqX.pdf","./assets/guide-en-1OGnCk1Q.pdf","./assets/guide-es-CBJS2dow.pdf","./assets/guide-it-Kvakt_n8.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-OGJBNnOG.js","./assets/index-BsngMO4L.js","./assets/index-DO50qwtU.css","./assets/index.es-DxQXwoHa.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-C_i4HLdz.js","./assets/it-DEFm4tzF.json","./assets/jspdf.es.min-CS1OYXry.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-D8jpJvIf.js","./assets/missions-DJP5N61U.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-VVdVWju9.js","./assets/public.de-Dhjs2BxI.js","./assets/public.en-B5Ed7lqJ.js","./assets/public.es-DgZKxnUt.js","./assets/public.it-40EHMnXV.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/rewardKit-CcmYuimU.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-BdpfZerQ.js","./assets/studyJourney-CPAEE3UX.js"]
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
