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
const VERSION = '2db2556d20'
const PRECACHE = ["./assets/Accessibility-Dvjz4pdK.js","./assets/Admin-BwkjrGx_.js","./assets/Avenir-BJPbo9zj.js","./assets/Avenir-Dzul4oAQ.css","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-CjTt4xfC.js","./assets/Badges-CmDhRSIj.js","./assets/Calcul-CTgh9xIF.js","./assets/Cgu-3ta5Yzux.js","./assets/Chapter-CQQloTg7.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-DY6W93tB.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-DpYq3fy3.js","./assets/Coach-DvZjU9ou.css","./assets/Coach-pmnAsJM6.js","./assets/CoachAI-JmKlb3NJ.js","./assets/Cours-CuuiP39c.js","./assets/Course-CCtJmBmU.js","./assets/Customizer-CfzZBzK_.js","./assets/DailyChallenge-BBcc0C2V.js","./assets/DeckDownload-BjwFXMKa.js","./assets/DossierProjet-D5wOu6qU.js","./assets/Eps-DSVsN_VE.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-CNYcAyn_.js","./assets/ExampleStudy-DPv5JhqZ.js","./assets/Excellence-CpLIQIVK.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-C4Wu6NwF.js","./assets/Favoris-7CLFOGHl.js","./assets/FlashcardsPage-ETOcaBqy.js","./assets/FormulaWorkshop-BZZnvkqx.js","./assets/Friends-BQGuhucZ.js","./assets/GameHost-C7-xrFqN.js","./assets/GrandOral-07mhc0qr.js","./assets/Guide-Bh4FX5_I.js","./assets/Home-BriXCVh8.css","./assets/Home-GHn3Gcjp.js","./assets/Landing-CXE5lcdY.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-DYmeia40.js","./assets/Leaderboard-RGr3pdPv.js","./assets/LegalContents-AV_EzL7U.js","./assets/MesNotes-BG_p7QGI.js","./assets/Methodo-CATPYv_i.js","./assets/Missions-DeyGwgnl.css","./assets/Missions-eIUzLoZC.js","./assets/Offers-DhfH9ndW.js","./assets/Parcours-DNCwdqIO.js","./assets/Parent-BamtkJ5s.js","./assets/PhotoFiche-D96i3Hxt.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-n_Zb0vbn.js","./assets/Privacy-D_ZyX0k4.js","./assets/Profile-DXOhfAkL.js","./assets/Programme-0Ic-aDVl.js","./assets/Qcm-DkVAuFKO.js","./assets/Revise-D81u-wBu.js","./assets/Revise-FV-8syb1.css","./assets/Seance-Crmay-Qx.js","./assets/Settings-CoI94QUt.css","./assets/Settings-DqDuNigu.js","./assets/Shop-B_eobCt0.js","./assets/Shop-CJJyfYdc.css","./assets/SportBac-D6BOT6vH.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-DsJtBx3c.js","./assets/StatsCharts-BfKl4md8.js","./assets/StudyJourney-CkFVrR5h.css","./assets/StudyJourney-Dy9q6YY0.js","./assets/Subject-BfmjTAtA.js","./assets/TexteRiche-D8vIPwP5.js","./assets/Theme-CselNk-v.js","./assets/Vacances-BQa4k5CB.js","./assets/Vacances-Cy-u6qV-.css","./assets/VacancesEntry-DaQsvZXG.js","./assets/ar-04LA8_V7.json","./assets/ar-BBiljuHG.js","./assets/ar-DxuPfmUH.js","./assets/common-qmtSPbeh.js","./assets/contenu-droit-CoXTOinK.js","./assets/contenu-economie-lLGqwQKF.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-CjW59juX.js","./assets/contenu-histoire-geo-B2MaXBVI.js","./assets/contenu-langues-BT4G9kXH.js","./assets/contenu-management-BOBL6CPi.js","./assets/contenu-maths-BU84-wsG.js","./assets/contenu-mercatique-DKn9PdvF.js","./assets/contenu-p1-droit-BgJK4pgm.js","./assets/contenu-p1-economie-ynG8Cr5Z.js","./assets/contenu-p1-francais-BtqmTm6S.js","./assets/contenu-p1-histoire-geo-IrVZwpOs.js","./assets/contenu-p1-langues-ZBkpa0Tv.js","./assets/contenu-p1-management-dzjDFzj9.js","./assets/contenu-p1-maths-BdzEjifO.js","./assets/contenu-p1-sgn-ETwsALWX.js","./assets/contenu-philosophie-CJLdpn7S.js","./assets/contenu-rh-communication-nN6eIx7_.js","./assets/contenu-sig-tovK1M_m.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-DPt2skND.js","./assets/de-HW_ff1V-.json","./assets/de-irB-wnUU.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CN1DxA8M.js","./assets/en-TCwrEnFj.json","./assets/en-uGc21EWU.js","./assets/epreuves-D7g8o1fv.js","./assets/es-BCQnz-k3.js","./assets/es-C34zSBSm.js","./assets/es-lIY0dhZl.json","./assets/examPdf-BOvxXzWs.js","./assets/examenPersonnalise-Chu_5pat.js","./assets/guide-ar-DKkYdLYL.pdf","./assets/guide-de-A7ojxxbo.pdf","./assets/guide-en-Z-BxRhG7.pdf","./assets/guide-es-BgJilBCa.pdf","./assets/guide-it-aunYzCEP.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-CFwt-NSj.js","./assets/index-BOeeUb-O.css","./assets/index-BrhOulUq.js","./assets/index.es-BBKoGcf1.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-1cxJydLB.js","./assets/it-B7i_Wa7b.js","./assets/it-JGGmN5SM.json","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-D-WxcCCu.js","./assets/missions-LJUicNn1.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-C4StxVZ3.js","./assets/public.de-DeMBunmM.js","./assets/public.en-W3lkpLuA.js","./assets/public.es-WlvbDtuf.js","./assets/public.it-DVzfAQvc.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-DUQtLk_m.js","./assets/studyJourney-bY99VSr_.js"]
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
