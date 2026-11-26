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
const VERSION = '5796857db7'
const PRECACHE = ["./assets/Accessibility-DiQsMj27.js","./assets/Admin-EzDD9fjW.js","./assets/Admin-ZL_1gHNS.css","./assets/Avenir-DCIxdlH6.js","./assets/Avenir-Dzul4oAQ.css","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-CtSf7h7h.js","./assets/Badges-Cu0pL7tH.js","./assets/Calcul-BN1G0HcG.js","./assets/Cgu-DGHg1fjb.js","./assets/Chapter-Ce1IJ48V.css","./assets/Chapter-yCf_6r68.js","./assets/ClassCodeForm-DhK5MW5i.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-C7ocpv_C.js","./assets/Coach-6O3DeckE.js","./assets/Coach-DvZjU9ou.css","./assets/CoachAI-YTS82D__.js","./assets/Cours-BnAOEayR.js","./assets/Course-B4DsILRe.js","./assets/Customizer-D7AvN9cI.js","./assets/DailyChallenge-DtM6YQvy.js","./assets/DeckDownload-pAxM2g0R.js","./assets/DossierProjet-DfURc7rf.js","./assets/Eps-DrSRYn4C.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-CW_nRy2x.js","./assets/ExampleStudy-anKVYS3q.js","./assets/Excellence-CEYtB0Fr.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-CgqT8-HG.js","./assets/Favoris-DTLEpoUn.js","./assets/FlashcardsPage-BF_oaTzO.js","./assets/FormulaWorkshop-td4lA_Iz.js","./assets/Friends-BXHM7M18.js","./assets/GameHost-WvRtwIQR.js","./assets/GrandOral-BMRE2OcP.js","./assets/Guide-DsTlDgnP.js","./assets/Home-B3QYtfHz.js","./assets/Home-BriXCVh8.css","./assets/Landing-GD3FwI1g.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-Daw37FZa.js","./assets/Leaderboard-B2CyqAzN.js","./assets/LegalContents-Be4HtQmX.js","./assets/MesNotes-KrM_M0s7.js","./assets/Methodo-Dd4YKr5l.js","./assets/Missions-BFbO96iy.js","./assets/Missions-DeyGwgnl.css","./assets/ModeScroll-BITqnPFd.js","./assets/ModeScroll-DJuzvbsl.css","./assets/Offers-BQ7Dm6-P.js","./assets/Parcours-C2bytD6J.js","./assets/Parent-CPeNRMW5.js","./assets/PhotoFiche-4yCIgdry.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-DwohBlza.js","./assets/Privacy-DsKoYrmU.js","./assets/Profile-BuP40XLI.js","./assets/Programme-Cf5Uq-Zo.js","./assets/Qcm-pNh6ZSFs.js","./assets/Revise-FV-8syb1.css","./assets/Revise-P6N7hp4p.js","./assets/Seance-C8SNRfXz.js","./assets/Settings-CoI94QUt.css","./assets/Settings-D9CdqigS.js","./assets/Shop-BQIb6SiC.js","./assets/Shop-CJJyfYdc.css","./assets/SportBac-Brc2U80a.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-B6gDQHJ_.js","./assets/StatsCharts-CJVp7OZz.js","./assets/StudyJourney-BrgpgpwO.js","./assets/StudyJourney-CkFVrR5h.css","./assets/Subject-DBPxQKIj.js","./assets/TexteRiche-CPI6mWZ-.js","./assets/Theme-Dk3n8Gvn.js","./assets/Vacances-BTifh8jg.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-BpTEvlRM.js","./assets/ar-04LA8_V7.json","./assets/ar-BBiljuHG.js","./assets/ar-CJ56R8Js.js","./assets/common-BQkB5pwM.js","./assets/contenu-droit-CoXTOinK.js","./assets/contenu-economie-lLGqwQKF.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-CjW59juX.js","./assets/contenu-histoire-geo-B2MaXBVI.js","./assets/contenu-langues-BT4G9kXH.js","./assets/contenu-management-BOBL6CPi.js","./assets/contenu-maths-BU84-wsG.js","./assets/contenu-mercatique-DKn9PdvF.js","./assets/contenu-p1-droit-BgJK4pgm.js","./assets/contenu-p1-economie-ynG8Cr5Z.js","./assets/contenu-p1-francais-BtqmTm6S.js","./assets/contenu-p1-histoire-geo-IrVZwpOs.js","./assets/contenu-p1-langues-ZBkpa0Tv.js","./assets/contenu-p1-management-dzjDFzj9.js","./assets/contenu-p1-maths-BdzEjifO.js","./assets/contenu-p1-sgn-ETwsALWX.js","./assets/contenu-philosophie-CJLdpn7S.js","./assets/contenu-rh-communication-nN6eIx7_.js","./assets/contenu-sig-tovK1M_m.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-CKxfBbbJ.js","./assets/de-HW_ff1V-.json","./assets/de-irB-wnUU.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-BebpvxsU.js","./assets/en-TCwrEnFj.json","./assets/en-uGc21EWU.js","./assets/epreuves-ByQZ7ncL.js","./assets/es-BCQnz-k3.js","./assets/es-D5EuqUSc.js","./assets/es-lIY0dhZl.json","./assets/examPdf-BJ1jZtEi.js","./assets/examenPersonnalise-k8TUUX6H.js","./assets/guide-ar-DKkYdLYL.pdf","./assets/guide-de-A7ojxxbo.pdf","./assets/guide-en-Z-BxRhG7.pdf","./assets/guide-es-BgJilBCa.pdf","./assets/guide-it-aunYzCEP.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-DQ6-o1VG.js","./assets/index-BdNKe7Ov.css","./assets/index-DzXYSrWA.js","./assets/index.es-DnfqRgwE.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-B7i_Wa7b.js","./assets/it-JGGmN5SM.json","./assets/it-a3R4Oiti.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-BtsdyuYx.js","./assets/missions-oBwcHH67.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-DEmqN6ik.js","./assets/public.de-CwLo5MXg.js","./assets/public.en-DJrtFis1.js","./assets/public.es-Ce3StDcA.js","./assets/public.it-vRZJL1xo.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-BqaqnsPN.js","./assets/studyJourney-bY99VSr_.js"]
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
