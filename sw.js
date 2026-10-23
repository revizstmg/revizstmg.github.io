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
const VERSION = '2bcb858ce9'
const PRECACHE = ["./assets/BacBlanc-Bomo8lD1.js","./assets/BacBlanc-DlU3NHwG.css","./assets/Badges-BTqtp5u4.js","./assets/Cgu-DrD3f6IX.js","./assets/Chapter-CdPwnVz-.js","./assets/ClassCodeForm-DxDmK1Qo.js","./assets/Classe-Br9zY-pg.js","./assets/Coach-Ccd6Rkro.js","./assets/CoachAI-QwFOwXYp.js","./assets/Cours-Bv38mG1j.js","./assets/Course-B_NkaK2z.js","./assets/Customizer-IB6E-Z1H.js","./assets/DailyChallenge-BpnyNCt9.js","./assets/DeckDownload-DjQyTGxu.js","./assets/DossierProjet-BSi9FQOm.js","./assets/EtudeGestion-gXrM0lph.js","./assets/Faq-DqLltO5N.js","./assets/Favoris-DP2N5rmb.js","./assets/FlashcardsPage-Cxk0r2m-.js","./assets/FormulaWorkshop-EnX2YSHo.js","./assets/Friends-DaWnZoRO.js","./assets/GameHost-CXPbDOT3.js","./assets/GrandOral-BKcjy7k3.js","./assets/Guide-D3rn6A8E.js","./assets/Home-4iDDu2lL.css","./assets/Home-BRlyCxLg.js","./assets/Landing-DiAm1YpU.js","./assets/Leaderboard-FgGXhpgi.js","./assets/LegalContents-k4Hbpjrj.js","./assets/MesNotes-CAIBystc.js","./assets/Methodo-DQhLHZtW.js","./assets/Parent-D2EHKHsb.js","./assets/PhotoFiche-xybA2Whh.js","./assets/PileCartes-BxTMYhvO.js","./assets/Privacy-XACcpC9d.js","./assets/Profile-C6R3w9SB.js","./assets/Programme-C9HN35Wb.js","./assets/Qcm-Cn3xz5t3.js","./assets/Revise-CXJGeZ9t.js","./assets/Revise-DWUKpryl.css","./assets/Seance-BoKH5QEk.js","./assets/Shop-BpBw_IgA.js","./assets/StatsCharts-CCkekgTd.js","./assets/Subject-CRLk1wRd.js","./assets/Theme-CUvSvCKG.js","./assets/ar-BbL2wprB.js","./assets/common-BlkksJHb.js","./assets/contenu-droit-1P6drU5k.js","./assets/contenu-economie-DzBO1IpO.js","./assets/contenu-gestion-finance-BFf2T9Y7.js","./assets/contenu-histoire-geo-F0ON0o2n.js","./assets/contenu-langues-D4kn2Y53.js","./assets/contenu-management-CcCdHt4n.js","./assets/contenu-maths-krdfGcVz.js","./assets/contenu-mercatique-CZUmLJXn.js","./assets/contenu-p1-droit-Bim-LT19.js","./assets/contenu-p1-economie-BNgtxc5d.js","./assets/contenu-p1-francais-DWjirzfL.js","./assets/contenu-p1-histoire-geo-BD_eS3Rc.js","./assets/contenu-p1-langues-BvMC7eZM.js","./assets/contenu-p1-management-B4Bp1qwy.js","./assets/contenu-p1-maths-Df4-fAiJ.js","./assets/contenu-p1-sgn-BiBpJMLq.js","./assets/contenu-philosophie-BEbIhVn3.js","./assets/contenu-rh-communication-DqHaeqKL.js","./assets/contenu-sig-CP5eSvFd.js","./assets/cormorant-garamond-latin-500-italic-Y14P-dkT.woff2","./assets/cormorant-garamond-latin-wght-normal-CUoBjw-S.woff2","./assets/eb-garamond-latin-500-normal-DehAIUv0.woff2","./assets/eb-garamond-latin-600-normal-DHwxsLHv.woff2","./assets/en-B-gsT7Cy.js","./assets/epreuves-Bi-84OOT.js","./assets/es-B8CmtfV8.js","./assets/examPdf-C_2Vf6b0.js","./assets/examenPersonnalise-C2FoVpnZ.js","./assets/html2canvas.esm-CBrSDip1.js","./assets/index-BcJedF3S.css","./assets/index-C3jTr2-8.js","./assets/index.es-Bu2SuQsV.js","./assets/inter-latin-wght-normal-Dx4kXJAl.woff2","./assets/it-C9RMMxMC.js","./assets/lato-latin-400-normal-BEhtfm5r.woff2","./assets/lato-latin-700-normal-BUGMgin4.woff2","./assets/marcellus-latin-400-normal-86dSXJnk.woff2","./assets/nunito-latin-400-normal-r8SDr6Up.woff2","./assets/nunito-latin-600-normal-Br8yIETf.woff2","./assets/nunito-latin-700-normal-Dort48En.woff2","./assets/playfair-display-latin-500-normal-DIxvyhka.woff2","./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2","./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2","./assets/public.ar-Df23HIg7.js","./assets/public.en-BFcNfpzr.js","./assets/public.es-M-NIBYW8.js","./assets/public.it-3qkFbKRl.js","./assets/purify.es-CAi2OJFm.js","./assets/readingPosition-DIrkUul2.js","./assets/study-oi5IcFdJ.js"]
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
          return fresh
        } catch {
          const cache = await caches.open(CACHE)
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
