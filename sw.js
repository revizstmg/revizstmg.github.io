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
const VERSION = '1ba1afac49'
const PRECACHE = ["./assets/Accessibility-COwnzxmC.js","./assets/Avenir-BBYjIvpj.js","./assets/Avenir-Dzul4oAQ.css","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-BZ1EYGvM.js","./assets/Badges-GJMWo74q.js","./assets/Calcul-DoBkqblh.js","./assets/Cgu-C3aXqTtp.js","./assets/Chapter-BNr9lnmu.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-DDxrC4IU.js","./assets/Classe-4BJDIjRk.js","./assets/Classe-B-X3L5aA.css","./assets/Coach-CZNJO4OH.js","./assets/Coach-DvZjU9ou.css","./assets/CoachAI-BNv58SeA.js","./assets/Cours-Cz04rt0Y.js","./assets/Course-CVzXKJy_.js","./assets/Customizer-CxovlpIY.js","./assets/DailyChallenge-3s6KPlP9.js","./assets/DeckDownload-YhQHEtF8.js","./assets/DossierProjet-DjEWlW7B.js","./assets/Eps-d1v-YHaA.css","./assets/Eps-ncSTSdP_.js","./assets/EtudeGestion-DEERuDSl.js","./assets/ExampleStudy-BnvD-17i.js","./assets/Excellence-CcXjQAc1.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-BL8UCG1C.js","./assets/Favoris-CkQt1FeR.js","./assets/FlashcardsPage-BWhuXrr5.js","./assets/FormulaWorkshop-CllzqPBU.js","./assets/Friends-B-UUNYoP.js","./assets/GameHost-BfkRdFDo.js","./assets/GrandOral-CdJ3eFkl.js","./assets/Guide-BZbBIdhq.js","./assets/Home-B_Ywh7zJ.css","./assets/Home-CedkE4rP.js","./assets/Landing-DmaBAnmv.js","./assets/Languages-B_cDtg30.js","./assets/Languages-Be2IHY5S.css","./assets/Leaderboard-BOcENfdp.js","./assets/LegalContents-DDRlCTfQ.js","./assets/MesNotes-BOyUVv3K.js","./assets/Methodo-Do0iZykB.js","./assets/Missions-CYFlaz94.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-DdMmN7ha.js","./assets/Parcours-A3ATJnVu.js","./assets/Parent-Cr8FiuKI.js","./assets/PhotoFiche-B7WZrOzr.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-Wj_nDRw-.js","./assets/Privacy-eh1x8NLQ.js","./assets/Profile-DMFXn7AW.js","./assets/Programme-DkUoEYL-.js","./assets/Qcm-ByFcrM7J.js","./assets/Revise-C159EOa2.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DSqe9Lq5.js","./assets/Settings-CoI94QUt.css","./assets/Settings-DcoF25YR.js","./assets/Shop-CJJyfYdc.css","./assets/Shop-Cp2fHi9s.js","./assets/SportBac-BZNlDwPW.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-CMvranYz.js","./assets/StatsCharts-C316iyW0.js","./assets/StudyJourney-Bync-Tz4.js","./assets/StudyJourney-CkFVrR5h.css","./assets/Subject-CDRDTqbB.js","./assets/TexteRiche-cltAhSsX.js","./assets/Theme-BD-vHYNd.js","./assets/Vacances-B_JWs3RE.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-Ce7OHAWs.js","./assets/ar-NVMY40vs.json","./assets/ar-oKakeAVa.js","./assets/common-DYPHW4fz.js","./assets/contenu-droit-mnBTv440.js","./assets/contenu-economie-BRrWx-2d.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-l1zNb1nS.js","./assets/contenu-histoire-geo-ClQ4A2xm.js","./assets/contenu-langues-CQjLAKry.js","./assets/contenu-management-DTUJNSem.js","./assets/contenu-maths-IHSynU2G.js","./assets/contenu-mercatique-Bpa2c3Bh.js","./assets/contenu-p1-droit-B15Hy7Om.js","./assets/contenu-p1-economie-DGOF1cJs.js","./assets/contenu-p1-francais-B-Q_NJiU.js","./assets/contenu-p1-histoire-geo-CSUj8TgF.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-C2iarXAu.js","./assets/contenu-p1-maths-DDLBPcx1.js","./assets/contenu-p1-sgn-BcQRbjgL.js","./assets/contenu-philosophie-DaROwK5r.js","./assets/contenu-rh-communication-D0ZQwPIk.js","./assets/contenu-sig-DoAtQKGt.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-BXyZ3vFb.js","./assets/de-CW2h0tbd.json","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CoP14qo8.json","./assets/en-DD5yY_h-.js","./assets/epreuves-p1fQ9z_6.js","./assets/es-CYWVjAEo.js","./assets/es-lIY0dhZl.json","./assets/examPdf-C0NQ-Hds.js","./assets/examenPersonnalise-B4eyICG2.js","./assets/guide-ar--VN9WzV_.pdf","./assets/guide-de-DIlKC2Yp.pdf","./assets/guide-en-CzUfZh1o.pdf","./assets/guide-es-BqFylxvE.pdf","./assets/guide-it-DbbfBjC_.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-BqLZMuME.js","./assets/index-BJreVO19.css","./assets/index-EK9yXjfN.js","./assets/index.es-DS2p13Pw.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-BbHoD12J.json","./assets/it-y_2MqakI.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-C-aLuDBd.js","./assets/missions-zHiZp8AC.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-D2uqE_37.js","./assets/public.de-BWWWGiOD.js","./assets/public.en-Bo9CyLGD.js","./assets/public.es-hf1OPEw0.js","./assets/public.it-B5iiHMtN.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-B_2pTbWA.js","./assets/studyJourney-BgR55qnu.js"]
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
