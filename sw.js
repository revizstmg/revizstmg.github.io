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
const VERSION = 'c57c6be164'
const PRECACHE = ["./assets/Accessibility-BuCTZnB1.js","./assets/BacBlanc-76c-ixyh.js","./assets/BacBlanc-DXfLAdav.css","./assets/Badges-WevuoNXI.js","./assets/Calcul-CJeU1mlE.js","./assets/Cgu-Cx1H6-A2.js","./assets/Chapter-BxPgN7bV.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-COnMAOAt.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-Bj948RQ1.js","./assets/Coach-gDUvASPi.js","./assets/CoachAI-8ETgpKhE.js","./assets/Cours-D6hvmC9n.js","./assets/Course-BefbOGj-.js","./assets/CourseStudio-BSu8n3-z.css","./assets/CourseStudio-xX1BrrC-.js","./assets/Customizer-vqhSC8wZ.js","./assets/DailyChallenge-DP0W_tTS.js","./assets/DeckDownload-CnA-BsfR.js","./assets/DossierProjet-DUUD0dQu.js","./assets/EtudeGestion-DyHUs8zP.js","./assets/ExampleStudy-DP1ahjCB.js","./assets/Excellence-BH7DMhb7.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-avvis7mA.js","./assets/Favoris-CHcVbfvk.js","./assets/FlashcardsPage-QKBPN_Gn.js","./assets/FormulaWorkshop-REpL7pSc.js","./assets/Friends-CW15a0Fk.js","./assets/GameHost-D7VmI3Ck.js","./assets/GrandOral-4WisinMg.js","./assets/Guide-DnyM1prh.js","./assets/Home-BNiCuJm-.css","./assets/Home-DSWg46JW.js","./assets/Landing-BnWIwTON.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-C8wW9QEZ.js","./assets/Leaderboard-b5YmUl_k.js","./assets/LegalContents-DuHLM5D2.js","./assets/MesNotes-DMn6f_q3.js","./assets/Methodo-C9ouWXhl.js","./assets/Missions-DeyGwgnl.css","./assets/Missions-YHTXD6ph.js","./assets/Offers-BdlULqK7.js","./assets/Parcours-D2D1ygnl.js","./assets/Parent-DrTTpRIC.js","./assets/PhotoFiche-5aCP_jP_.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-C-8g37j4.js","./assets/Privacy-CH7TCIcG.js","./assets/Profile-XNezFqii.js","./assets/Programme-BisHhCWV.js","./assets/Qcm-ZYa2Mb0H.js","./assets/Revise-Csnk6bLh.js","./assets/Revise-FV-8syb1.css","./assets/Seance-DO8E_RG4.js","./assets/Settings-CfvhbNdl.js","./assets/Settings-CoI94QUt.css","./assets/Shop-BnnWfMmd.js","./assets/Shop-ZXplxDyq.css","./assets/StatsCharts-YGKoHCQp.js","./assets/StudyJourney-24iURN8G.css","./assets/StudyJourney-B_sioCT0.js","./assets/Subject-DpRvWVBw.js","./assets/Theme-DDFMlAuG.js","./assets/Vacances-C0ALfs_1.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-Cnpx4NPh.js","./assets/ar-B03i-Dfn.js","./assets/ar-Ca_VQ4IR.js","./assets/common-CoF55wxC.js","./assets/contenu-droit-CALlwfsI.js","./assets/contenu-economie-Dh4Oj6Yl.js","./assets/contenu-gestion-finance-B1Dzdrya.js","./assets/contenu-histoire-geo-BNhSPlbx.js","./assets/contenu-langues-TcEy4on1.js","./assets/contenu-management-Djbg069d.js","./assets/contenu-maths-krdfGcVz.js","./assets/contenu-mercatique-CCAq-_Gn.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BCbQs1aO.js","./assets/contenu-p1-langues-YXYfMpJN.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-DPkqM0Q2.js","./assets/contenu-sig-BWrNWmMb.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-DsnXP5ZH.js","./assets/de-hxwvxeqd.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-C0i32p8u.js","./assets/en-s8IgbIsr.js","./assets/epreuves-Cxl1R1Uq.js","./assets/es-CBTcbdyo.js","./assets/es-DfBOWzue.js","./assets/examPdf-nGgavvZp.js","./assets/examenPersonnalise-BRibyMst.js","./assets/guide-ar-CV-BH1p0.pdf","./assets/guide-de-DE2SVaqX.pdf","./assets/guide-en-1OGnCk1Q.pdf","./assets/guide-es-CBJS2dow.pdf","./assets/guide-it-Kvakt_n8.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/index-D0lTg-PK.css","./assets/index-D_BcSJFS.js","./assets/index.es-B6d-RaCU.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-Byijp_oG.js","./assets/it-oPp9ut8A.js","./assets/jspdf.es.min-BUwVvz_H.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-C9aeXbIk.js","./assets/missions-CiXVmcr3.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-D5unAPMe.js","./assets/public.de-Cp46zt1F.js","./assets/public.en-C_iCdlEC.js","./assets/public.es-DQnrcVlv.js","./assets/public.it-CylCCaxh.js","./assets/purify.es-CAi2OJFm.js","./assets/rewardKit-6fquJzaB.js","./assets/study-B_DIjD_H.js","./assets/studyJourney-4mjQXVZV.js","./assets/vacances-D_YCfq1P.js"]
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
          const cached = await cache.match(req)
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
          if(publicPage)return (await cache.match(req)) || new Response('<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne | RévizSTMG</title><main><h1>Cette fiche n’est pas encore disponible hors ligne</h1><p>Reconnecte-toi pour la lire, ou retrouve tes cours dans l’application.</p><a href="'+scopePath+'">Ouvrir RévizSTMG</a></main></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})
          return (
            (await cache.match('./index.html')) ||
            (await cache.match('./')) ||
            (await cache.match(req)) ||
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
      const cached = await cache.match(req)
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
