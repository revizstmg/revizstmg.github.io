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
const VERSION = '2128d871b8'
const PRECACHE = ["./assets/Accessibility-Cf39XI2u.js","./assets/Avenir-CmLLHSP4.js","./assets/Avenir-Dzul4oAQ.css","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-DsMtsXhC.js","./assets/Badges-BzDq5e5A.js","./assets/Calcul-BediSfsM.js","./assets/Cgu-CebZXqzU.js","./assets/Chapter-CcMrcxJM.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-DoDFubyJ.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-Be0fkSTW.js","./assets/Coach-CrRpEzn0.js","./assets/Coach-DvZjU9ou.css","./assets/CoachAI-Bep529VN.js","./assets/Cours-BFnaY3w6.js","./assets/Course-Do8X2VrC.js","./assets/Customizer-BowuDn2r.js","./assets/DailyChallenge-suCz2jb-.js","./assets/DeckDownload-g5Ck6-Ec.js","./assets/DossierProjet-DzeKlh2p.js","./assets/Eps-D9M0HGRz.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-BXj3De-b.js","./assets/ExampleStudy-DBAsVI74.js","./assets/Excellence-CR-wmEmu.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-D_dc4vjy.js","./assets/Favoris-poRRVD8N.js","./assets/FlashcardsPage-BNozqVui.js","./assets/FormulaWorkshop-4V0Hi1V6.js","./assets/Friends-BFMpfgIG.js","./assets/GameHost-82xWDZNY.js","./assets/GrandOral-C1PqK--l.js","./assets/Guide-D0521wNO.js","./assets/Home-B_Ywh7zJ.css","./assets/Home-CaEsUdHO.js","./assets/Landing-0L29TpJ4.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-Dybry4cV.js","./assets/Leaderboard-DKgDI4AG.js","./assets/LegalContents-8y_mMH1L.js","./assets/MesNotes-Dw1QOm9l.js","./assets/Methodo-D0PxSUMX.js","./assets/Missions-4EHjoEEk.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-BLdbF3O8.js","./assets/Parcours-BZTMr1MN.js","./assets/Parent-Do2yjFCQ.js","./assets/PhotoFiche-FJVNrms1.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-dU6KNVvp.js","./assets/Privacy-C-cf-jJE.js","./assets/Profile-Cx0dG-wU.js","./assets/Programme-lcd2HOq7.js","./assets/Qcm-CN86q2-K.js","./assets/Revise-FV-8syb1.css","./assets/Revise-SyU0ELeA.js","./assets/Seance-Sww26Npz.js","./assets/Settings-CiB9AjVA.js","./assets/Settings-CoI94QUt.css","./assets/Shop-CJJyfYdc.css","./assets/Shop-_PTgKAbg.js","./assets/SportBac-VHH_POAb.css","./assets/SportBac-XQvt4Qr9.js","./assets/SportBacReference-DLyJwIkk.js","./assets/StatsCharts-Bhk_xlXo.js","./assets/StudyJourney-CkFVrR5h.css","./assets/StudyJourney-Cz6HNKHp.js","./assets/Subject-BcoSWUjj.js","./assets/TexteRiche-waN2Hwif.js","./assets/Theme-DDF-ixo3.js","./assets/Vacances-BsKsP1Xj.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-CyLJQ3zI.js","./assets/ar-NVMY40vs.json","./assets/ar-oKakeAVa.js","./assets/common-BC2Lqnrc.js","./assets/contenu-droit-Up_wjTAP.js","./assets/contenu-economie-BeuWzGhm.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-UGm4qsmQ.js","./assets/contenu-histoire-geo-B6oi2XQ4.js","./assets/contenu-langues-CQjLAKry.js","./assets/contenu-management-BIrLIr25.js","./assets/contenu-maths-CDUP3nVT.js","./assets/contenu-mercatique-CTLJ58a6.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-uJlUqNVo.js","./assets/contenu-p1-francais-TkBj-YwT.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-2HaY_p0K.js","./assets/contenu-p1-management-Bid8tG9T.js","./assets/contenu-p1-maths-Dno2i-Sy.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BWG6zJTZ.js","./assets/contenu-rh-communication-CYaFUvAF.js","./assets/contenu-sig-D4do1_7j.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-BXyZ3vFb.js","./assets/de-CW2h0tbd.json","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CoP14qo8.json","./assets/en-DD5yY_h-.js","./assets/epreuves-BsIsuEuC.js","./assets/es-CYWVjAEo.js","./assets/es-lIY0dhZl.json","./assets/examPdf-Bdttx9Bx.js","./assets/examenPersonnalise-BHyWVLMP.js","./assets/guide-ar--VN9WzV_.pdf","./assets/guide-de-DIlKC2Yp.pdf","./assets/guide-en-CzUfZh1o.pdf","./assets/guide-es-BqFylxvE.pdf","./assets/guide-it-DbbfBjC_.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-CUzr6D9d.js","./assets/index-DvZ8qumb.js","./assets/index-KAyqczP6.css","./assets/index.es-HjgO_F-I.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-BbHoD12J.json","./assets/it-y_2MqakI.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-BuF6EkfA.js","./assets/missions-DjKrR1DG.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-CFVWDq1X.js","./assets/public.de-e_9PnxFw.js","./assets/public.en-XqtITxqM.js","./assets/public.es-t0X9pEXG.js","./assets/public.it-ChhEo6ow.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-DXn3xosd.js","./assets/studyJourney-BgR55qnu.js"]
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
