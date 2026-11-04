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
const VERSION = '7089be936d'
const PRECACHE = ["./assets/Accessibility-DAOHNCpl.js","./assets/BacBlanc-DTqPHRh-.js","./assets/BacBlanc-DvfxNntV.css","./assets/Badges-BLfrHxDQ.js","./assets/Calcul-D7fYWdEc.js","./assets/Cgu-Di3awaOM.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-DdDXljUQ.js","./assets/ClassCodeForm-pt6yV5YC.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-zzHw7xPe.js","./assets/Coach-BcvHOAvN.js","./assets/CoachAI-Dg9V0GRp.js","./assets/Cours-Bqqdia1N.js","./assets/Course-D5I3CLPU.js","./assets/Customizer--zyDjz6C.js","./assets/DailyChallenge-B_uGxigd.js","./assets/DeckDownload-B-bwavn3.js","./assets/DossierProjet-hpIUxcX5.js","./assets/Eps-DknXxKcB.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-xUwFlVdP.js","./assets/ExampleStudy-B0LSou9l.js","./assets/Excellence-DB6jlBZW.css","./assets/Excellence-fcbnSMnl.js","./assets/Faq-Co5kyHjy.js","./assets/Favoris-l38Ci4_a.js","./assets/FlashcardsPage-BuetKGLa.js","./assets/FormulaWorkshop-nB1ZLiar.js","./assets/Friends-DZwqkor2.js","./assets/GameHost-BeSzr5ur.js","./assets/GrandOral-CkKmEtgd.js","./assets/Guide-C55MIu80.js","./assets/Home-B7cehFm8.js","./assets/Home-DmRLRLiv.css","./assets/Landing-CZH8mhSZ.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-Buu2QZAs.js","./assets/Leaderboard-BGpW_-1w.js","./assets/LegalContents-BLVXc7sQ.js","./assets/MesNotes-Ds_bkaaa.js","./assets/Methodo-D40Kj5kn.js","./assets/Missions-CmtMeC9g.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-BfZ58tkH.js","./assets/Parcours-Cn50AyBT.js","./assets/Parent-C0WyDx27.js","./assets/PhotoFiche-4aF9hdmR.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-DLoZhhW4.js","./assets/Privacy-4Ax2nOeF.js","./assets/Profile-9Qzd2sJ5.js","./assets/Programme-f45mcObb.js","./assets/Qcm-DyRgEMy4.js","./assets/Revise-B1nqv6WJ.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DiFFsuMa.js","./assets/Settings-Bh92ShjG.js","./assets/Settings-CoI94QUt.css","./assets/Shop-08FUBQ9M.js","./assets/Shop-ZXplxDyq.css","./assets/SportBac-DTs1rLRN.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-RX3LLZQr.js","./assets/StatsCharts-DUn2lkoH.js","./assets/StudyJourney-24iURN8G.css","./assets/StudyJourney-BHjviSK1.js","./assets/Subject-DZcVRb6u.js","./assets/TexteRiche-IHCSlL5T.js","./assets/Theme-8hc-GjZj.js","./assets/Vacances-CbrIbMC7.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-wR9-3KPz.js","./assets/ar-BEckbjIv.json","./assets/ar-Ix_tYWIi.js","./assets/common-BtMQD_Wi.js","./assets/contenu-droit-CUgMsFzp.js","./assets/contenu-economie-CpYnvD3C.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-CauctlRR.js","./assets/contenu-histoire-geo-DvmxJBva.js","./assets/contenu-langues-CQjLAKry.js","./assets/contenu-management-Djbg069d.js","./assets/contenu-maths-DpqMBik8.js","./assets/contenu-mercatique-DLSU2IHC.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-TkBj-YwT.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-BvAWPmqw.js","./assets/contenu-p1-maths-eerizEHc.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-CDME4wcH.js","./assets/contenu-sig-Ln_hxo2b.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-BUc4MBaZ.js","./assets/de-DZ2D-8Tn.json","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-22iPtPRD.json","./assets/en-DGyIL4Zc.js","./assets/epreuves-B1ikDYok.js","./assets/es-CNMllPhR.js","./assets/es-DoeEU8cU.json","./assets/examPdf-DeFRmE2r.js","./assets/examenPersonnalise-DZvX4vHl.js","./assets/guide-ar-CV-BH1p0.pdf","./assets/guide-de-DE2SVaqX.pdf","./assets/guide-en-1OGnCk1Q.pdf","./assets/guide-es-CBJS2dow.pdf","./assets/guide-it-Kvakt_n8.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-CWDLPFzJ.js","./assets/index-CrhFq-uV.css","./assets/index-CsvW4H52.js","./assets/index.es-CnbfpVGf.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-CUxiN8lT.js","./assets/it-DEFm4tzF.json","./assets/jspdf.es.min-Cz_E7VWl.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-Dqk2RFBq.js","./assets/missions-ccMQFDEB.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-BjYVfkd3.js","./assets/public.de-BLchCDLO.js","./assets/public.en-BeLcy_mA.js","./assets/public.es-C_Vg69oX.js","./assets/public.it-BDeWbvmv.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/rewardKit-tzol8WWj.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-D3Fu-B4E.js","./assets/studyJourney-CPAEE3UX.js"]
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
