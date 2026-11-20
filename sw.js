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
const VERSION = '14337c2cab'
const PRECACHE = ["./assets/Accessibility-DxN1maH3.js","./assets/Avenir-BkF89SY0.js","./assets/Avenir-Dzul4oAQ.css","./assets/BacBlanc-3PTptwJH.css","./assets/BacBlanc-CEOdZ70M.js","./assets/Badges-D0pfiNia.js","./assets/Calcul-B7hynM3M.js","./assets/Cgu-DWj-G5LM.js","./assets/Chapter-C6pDlTBB.js","./assets/Chapter-Ce1IJ48V.css","./assets/ClassCodeForm-C0BkboyG.js","./assets/Classe-B-X3L5aA.css","./assets/Classe-Bn1zrq8s.js","./assets/Coach-DvZjU9ou.css","./assets/Coach-zNLEkiuQ.js","./assets/CoachAI-DldbQ2uU.js","./assets/Cours-Bpekyz4d.js","./assets/Course-Cl7eY50O.js","./assets/Customizer-BT4REz5r.js","./assets/DailyChallenge-D9mCEKal.js","./assets/DeckDownload-kRLuVPFv.js","./assets/DossierProjet-B7usVs3k.js","./assets/Eps-Cun2pngr.js","./assets/Eps-d1v-YHaA.css","./assets/EtudeGestion-DEerQvke.js","./assets/ExampleStudy-Bgo2KZUK.js","./assets/Excellence-BB_Yx_fE.js","./assets/Excellence-DB6jlBZW.css","./assets/Faq-ItlL-XYZ.js","./assets/Favoris-DEB6aZYI.js","./assets/FlashcardsPage-CSP4PG5I.js","./assets/FormulaWorkshop-DhgUhHpA.js","./assets/Friends-ButpkQzD.js","./assets/GameHost-DYBVkHuI.js","./assets/GrandOral-BvLJjryb.js","./assets/Guide-DWMcAteN.js","./assets/Home-BriXCVh8.css","./assets/Home-Dv910vSs.js","./assets/Landing-B9Izw2aZ.js","./assets/Languages-Be2IHY5S.css","./assets/Languages-ChfJ3S6H.js","./assets/Leaderboard-PC1iaDRh.js","./assets/LegalContents-RlMNL_gz.js","./assets/MesNotes-oJU_cX1W.js","./assets/Methodo-CZDnmlT7.js","./assets/Missions-DUs5OCiO.js","./assets/Missions-DeyGwgnl.css","./assets/Offers-T2el2ArN.js","./assets/Parcours-DqXu7QRQ.js","./assets/Parent-DzJ8LU71.js","./assets/PhotoFiche-vHUgl-9A.js","./assets/PileCartes-BJNZd9v1.css","./assets/PileCartes-CEZgBtjA.js","./assets/Privacy-5JJS-ViC.js","./assets/Profile-4t8JQ3Au.js","./assets/Programme-iIwSDDYr.js","./assets/Qcm-DMmNausB.js","./assets/Revise-Cmd-DzhT.js","./assets/Revise-FV-8syb1.css","./assets/Seance-lVoGAEmS.js","./assets/Settings-AFqk7RgH.js","./assets/Settings-CoI94QUt.css","./assets/Shop-CJJyfYdc.css","./assets/Shop-xTMQTx4J.js","./assets/SportBac-P55JrKOj.js","./assets/SportBac-VHH_POAb.css","./assets/SportBacReference-By4hPdp-.js","./assets/StatsCharts-DwCOYzUi.js","./assets/StudyJourney-CLWR2mK0.js","./assets/StudyJourney-CkFVrR5h.css","./assets/Subject-F01w7JfY.js","./assets/TexteRiche-DXyXOiJZ.js","./assets/Theme-BKj1SwWk.js","./assets/Vacances-Cy-u6qV-.css","./assets/Vacances-pYZvGDzo.js","./assets/VacancesEntry-Cujke4Y2.js","./assets/ar-DxuPfmUH.js","./assets/ar-NVMY40vs.json","./assets/common-k-7d0DgL.js","./assets/contenu-droit-DCefiZ-4.js","./assets/contenu-economie-DmaWzDlz.js","./assets/contenu-eps-HLBx0luc.js","./assets/contenu-gestion-finance-Dcb0C18N.js","./assets/contenu-histoire-geo-CL5HbY2D.js","./assets/contenu-langues-BT4G9kXH.js","./assets/contenu-management-BzyCXyJu.js","./assets/contenu-maths-BHtfIWGH.js","./assets/contenu-mercatique-MZHGAKXN.js","./assets/contenu-p1-droit-DMzoNWDV.js","./assets/contenu-p1-economie-BlgpazW6.js","./assets/contenu-p1-francais-mLerrlF5.js","./assets/contenu-p1-histoire-geo-DJG2Hfz9.js","./assets/contenu-p1-langues-ZBkpa0Tv.js","./assets/contenu-p1-management-7SzE6hcH.js","./assets/contenu-p1-maths-DqKuRXMz.js","./assets/contenu-p1-sgn-Cs5ebJkA.js","./assets/contenu-philosophie-CFjlbPSG.js","./assets/contenu-rh-communication-B8CRICft.js","./assets/contenu-sig-D_pcVB93.js","./assets/controlRequest-Drm7J-xD.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/de-CW2h0tbd.json","./assets/de-CZo3_m-D.js","./assets/de-DPt2skND.js","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-CN1DxA8M.js","./assets/en-DKNy6ZTI.js","./assets/en-TCwrEnFj.json","./assets/epreuves-C183fNkk.js","./assets/es-C34zSBSm.js","./assets/es-lIY0dhZl.json","./assets/es-t1YaD6Yo.js","./assets/examPdf-iOAiapOP.js","./assets/examenPersonnalise-CknkIJS8.js","./assets/guide-ar-DKkYdLYL.pdf","./assets/guide-de-A7ojxxbo.pdf","./assets/guide-en-Z-BxRhG7.pdf","./assets/guide-es-BgJilBCa.pdf","./assets/guide-it-aunYzCEP.pdf","./assets/html2canvas.esm-CBrSDip1.js","./assets/ia-CpavOQFg.js","./assets/index-DqIrwsxS.js","./assets/index-DxXHzwjn.css","./assets/index.es-Da3EZal5.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-1cxJydLB.js","./assets/it-BbHoD12J.json","./assets/it-BpNL5Ksd.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/missions-C9TS6Ayn.js","./assets/missions-DeMdxxgu.js","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-elXCu6UL.js","./assets/public.de-BWLaZko_.js","./assets/public.en-bdGrufLZ.js","./assets/public.es-BElPU2KL.js","./assets/public.it-DfgOM_z1.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-BSu8n3-z.css","./assets/readingPosition-Cq0fk5hJ.js","./assets/sessionDraft-CEsPtM-Y.js","./assets/study-C21-rXxL.js","./assets/studyJourney-bY99VSr_.js"]
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
