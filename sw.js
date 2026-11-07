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
const VERSION = '5b579789e5'
const PRECACHE = ["./assets/Accessibility-DTz_5q2I.js","./assets/BacBlanc-BEEzGahX.js","./assets/BacBlanc-DaqhRYPU.css","./assets/Badges-DqtK1qcq.js","./assets/Calcul-1uV08RDi.js","./assets/Cgu-D0VbVK7K.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-DLWQqlHK.js","./assets/ClassCodeForm-YsqSF5XB.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-BJ-Ht1T8.js","./assets/Coach-DvZjU9ou.css","./assets/Coach-GhTYKbig.js","./assets/CoachAI-cfh9flGL.js","./assets/Cours-DqGvGkfN.js","./assets/Course-DIxSGPDM.js","./assets/Customizer-Drvzo_qN.js","./assets/DailyChallenge-ZXQEh3gj.js","./assets/DeckDownload-BAcQsr-S.js","./assets/DossierProjet-O92ltJzs.js","./assets/Eps-C7TY6so4.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-ZABkDl3Q.js","./assets/ExampleStudy-C8IL-001.js","./assets/Excellence-DB6jlBZW.css","./assets/Excellence-qqBu_Zlc.js","./assets/Faq-CGedvBr-.js","./assets/Favoris-XllOg_nU.js","./assets/FlashcardsPage-CGoCSB6o.js","./assets/FormulaWorkshop-m1Itxgit.js","./assets/Friends-zA9ReP5Q.js","./assets/GameHost-BtM0mFNf.js","./assets/GrandOral-DZ0xmjLD.js","./assets/Guide-C3KXsJ1A.js","./assets/Home-DmRLRLiv.css","./assets/Home-KfodkSRH.js","./assets/Landing-B9KWs2f2.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-Dw2m9oKn.js","./assets/Leaderboard-x7x_iU9U.js","./assets/LegalContents-CZhd7W3_.js","./assets/MesNotes-BT41srcf.js","./assets/Methodo-Cv8cm8QQ.js","./assets/Missions-BN373EYO.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-B2lo6V5b.js","./assets/Parcours-BeQBBiiK.js","./assets/Parent-DlPfqjCY.js","./assets/PhotoFiche-DmeARjai.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-CLjlWij6.js","./assets/Privacy-BtjD_MTs.js","./assets/Profile-CCk710BX.js","./assets/Programme-Cku4gvOb.js","./assets/Qcm-D8w3CQM6.js","./assets/Revise-BDyrx_l5.js","./assets/Revise-FV-8syb1.css","./assets/Seance-Ckx6cnCv.js","./assets/Settings-BdYhhMq3.js","./assets/Settings-CoI94QUt.css","./assets/Shop-CZJbUmoZ.js","./assets/Shop-ZXplxDyq.css","./assets/SportBac-DeWLSKiw.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-Dp8L-kQP.js","./assets/StatsCharts-D87_GxBL.js","./assets/StudyJourney-CkFVrR5h.css","./assets/StudyJourney-DotSvRBS.js","./assets/Subject-eOlsxC0J.js","./assets/TexteRiche-DofWuhZO.js","./assets/Theme-BmMVuZdz.js","./assets/Vacances-Cy-u6qV-.css","./assets/Vacances-N_lcN0cG.js","./assets/VacancesEntry-CBl8OIII.js","./assets/ar-D7oCJxMK.js","./assets/ar-NVMY40vs.json","./assets/common-Dmnoxsio.js","./assets/contenu-droit-Up_wjTAP.js","./assets/contenu-economie-BeuWzGhm.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-BrLRF-BD.js","./assets/contenu-histoire-geo-B6oi2XQ4.js","./assets/contenu-langues-CQjLAKry.js","./assets/contenu-management-BIrLIr25.js","./assets/contenu-maths-CDUP3nVT.js","./assets/contenu-mercatique-DLSU2IHC.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-uJlUqNVo.js","./assets/contenu-p1-francais-TkBj-YwT.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-Bid8tG9T.js","./assets/contenu-p1-maths-Dno2i-Sy.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BWG6zJTZ.js","./assets/contenu-rh-communication-CGx7LeTz.js","./assets/contenu-sig-DyqSFxcE.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-CW2h0tbd.json","./assets/de-obusd_z0.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CoP14qo8.json","./assets/en-DYcbv7Qi.js","./assets/epreuves-DZLTaP8x.js","./assets/es-DaGKWNW4.js","./assets/es-lIY0dhZl.json","./assets/examPdf-DZobavM_.js","./assets/examenPersonnalise-6Scxuwdv.js","./assets/guide-ar-Yo3HRVq8.pdf","./assets/guide-de-BX3rQ7T-.pdf","./assets/guide-en-BFSMxnmJ.pdf","./assets/guide-es-BTkMhRfd.pdf","./assets/guide-it-CFkC8vfD.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-C5CF5wV4.js","./assets/index-CwxG0wPy.js","./assets/index-mue4cWSX.css","./assets/index.es-f2KbWUge.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-BbHoD12J.json","./assets/it-CW0m5Coj.js","./assets/jspdf.es.min-xMRXyFhm.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-6nrg5G_s.js","./assets/missions-CnOk4JT4.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-BFB-5kXB.js","./assets/public.de-B1BjqeWk.js","./assets/public.en-DYy3uAn5.js","./assets/public.es-CkXH3hr7.js","./assets/public.it-DSMOxjgL.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/rewardKit-BR7KcZBS.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-CTeBNUCw.js","./assets/studyJourney-CPAEE3UX.js"]
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
