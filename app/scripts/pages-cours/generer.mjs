// Pages de cours statiques, lisibles par les moteurs de recherche.
// L'app vit sur des adresses « #/… » que Google n'indexe pas séparément : pour
// lui, RévizSTMG n'était qu'une page. Ce module écrit, à partir du même contenu
// (content/), une vraie page HTML par matière, par thème et par chapitre, sous
// /cours/, sans JavaScript. Chaque page renvoie vers l'app pour s'entraîner.
//   /cours/                                   toutes les matières
//   /cours/<niveau>/<matière>/                une matière et ses thèmes
//   /cours/<niveau>/<matière>/<thème>/        un thème et ses chapitres
//   /cours/<niveau>/<matière>/<thème>/<chapitre>/   le cours du chapitre
// Aucune date ni empreinte de version dans les pages : une page ne change que
// si son contenu change (la publication ne réécrit pas 900 fichiers à chaque fois).
import * as C from '../../src/data/index.js'

export const SITE = 'https://revizstmg.github.io'
const NIVEAUX = { premiere: 'Première', terminale: 'Terminale' }

// Le contenu complet (cours de chaque thème) n'arrive qu'au chargement des matières.
export const chargerContenu = () => C.chargerTout()

// « Thème 5 — Quel est le rôle du contrat ? » → « quel-est-le-role-du-contrat »
export function slug(texte, max = 70) {
  const s = String(texte || '')
    .replace(/^(Thème|Chapitre)\s*\d+\s*[—–-]\s*/i, '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (s.length <= max) return s || 'page'
  const coupe = s.slice(0, max)
  return coupe.slice(0, coupe.lastIndexOf('-') > 20 ? coupe.lastIndexOf('-') : max).replace(/-+$/, '')
}

const echapper = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
// Gras et italique du contenu (« **mot** », « *mot* », « **type *gustar*** ») ;
// retours à la ligne.
export function riche(t) {
  return echapper(t)
    .replace(/\*\*((?:[^*]|\*[^*]+\*)+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/\n/g, '<br>')
}
export const texteBrut = (t) => String(t ?? '').replace(/\*/g, '').replace(/\s+/g, ' ').trim()
// Titres sans emoji (« ⚖️ Cas pratique… ») : plus nets dans un résultat de recherche.
export const sansEmoji = (t) => String(t ?? '').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim()
function resume(t, max = 155) {
  const s = texteBrut(t)
  if (s.length <= max) return s
  const coupe = s.slice(0, max)
  return `${coupe.slice(0, coupe.lastIndexOf(' '))}…`
}

const TITRES_BLOCS = { example: 'Exemple', tip: 'À retenir', warning: 'Attention' }
const CLASSES_BLOCS = { example: 'exemple', tip: 'astuce', warning: 'piege' }

export function bloc(b) {
  if (!b) return ''
  switch (b.t) {
    case 'p': return `<p>${riche(b.c)}</p>`
    case 'example': case 'tip': case 'warning':
      return `<aside class="bloc ${CLASSES_BLOCS[b.t]}"><p class="bloc-titre">${riche(b.h || TITRES_BLOCS[b.t])}</p><p>${riche(b.c)}</p></aside>`
    case 'formula': return `<p class="formule">${riche(b.c)}</p>`
    case 'list': return `<ul>${(Array.isArray(b.c) ? b.c : [b.c]).map((li) => `<li>${riche(li)}</li>`).join('')}</ul>`
    case 'table': {
      const tete = (b.head || []).length ? `<thead><tr>${b.head.map((h) => `<th scope="col">${riche(h)}</th>`).join('')}</tr></thead>` : ''
      const corps = (b.rows || []).map((r) => `<tr>${r.map((c) => `<td>${riche(c)}</td>`).join('')}</tr>`).join('')
      return `<div class="tableau"><table>${b.h ? `<caption>${riche(b.h)}</caption>` : ''}${tete}<tbody>${corps}</tbody></table></div>`
    }
    case 'frise':
      return `<section class="frise">${b.title ? `<p class="bloc-titre">${riche(b.title)}</p>` : ''}<ol>${(b.events || []).map((e) => `<li><strong>${echapper(e.date)}</strong> ${riche(e.label)}</li>`).join('')}</ol></section>`
    case 'figure': return '' // schéma interactif : seulement dans l'app
    default: return typeof b.c === 'string' ? `<p>${riche(b.c)}</p>` : ''
  }
}

const jsonLd = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
const filAriane = (etapes) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: etapes.map(([nom, chemin], i) => ({ '@type': 'ListItem', position: i + 1, name: nom, item: SITE + chemin })),
})

function page({ chemin, titre, description, h1, sousTitre, ariane, contenu, donnees = [] }) {
  const url = SITE + chemin
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${echapper(titre)}</title>
<meta name="description" content="${echapper(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="RévizSTMG">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${echapper(titre)}">
<meta property="og:description" content="${echapper(description)}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1b1813">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/cours/cours.css">
${[filAriane(ariane), ...donnees].map(jsonLd).join('\n')}
</head>
<body>
<header class="entete"><a class="marque" href="/"><span aria-hidden="true">◇</span> RévizSTMG</a><a class="ouvrir" href="/">Ouvrir l’application</a></header>
<nav class="ariane" aria-label="Fil d’Ariane"><ol>${ariane.map(([nom, ch], i) => (i === ariane.length - 1 ? `<li aria-current="page">${echapper(nom)}</li>` : `<li><a href="${ch}">${echapper(nom)}</a></li>`)).join('')}</ol></nav>
<main>
<h1>${echapper(h1)}</h1>
${sousTitre ? `<p class="sous-titre">${sousTitre}</p>` : ''}
${contenu}
</main>
<footer class="pied">
<p><strong>RévizSTMG</strong> : révision gratuite du bac STMG, en Première et en Terminale. Cours, exercices corrigés, flashcards et sujets au format des épreuves.</p>
<p><a href="/cours/">Tous les cours</a> · <a href="/">Ouvrir l’application</a> · <a href="/#/confidentialite">Confidentialité</a> · <a href="/#/cgu">CGU et mentions légales</a></p>
</footer>
</body>
</html>
`
}

const niveauDe = (s) => (s.niveau === 'premiere' ? 'premiere' : 'terminale')
const lienApp = (s, t, i) => `/#/subject/${s.id}/theme/${t.id}${i == null ? '' : `/chapter/${i}`}`
const pluriel = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`

// Arborescence : matières → thèmes → chapitres, avec des adresses uniques.
export function arborescence() {
  const matieres = []
  for (const s of C.SUBJECTS) {
    const niveau = niveauDe(s)
    const base = `/cours/${niveau}/${slug(s.name)}/`
    const themesVus = new Set()
    const themes = s.chapters.map((t) => {
      let ts = slug(t.name); while (themesVus.has(ts)) ts += '-2'; themesVus.add(ts)
      const chemin = `${base}${ts}/`
      const vus = new Set()
      const chapitres = C.themeChapters(t).map((ch) => {
        let cs = slug(ch.title); while (vus.has(cs)) cs += '-2'; vus.add(cs)
        return { ch, chemin: `${chemin}${cs}/` }
      })
      return { t, chemin, chapitres }
    })
    matieres.push({ s, niveau, chemin: base, themes })
  }
  return matieres
}

export function construirePages() {
  const matieres = arborescence()
  const pages = []
  const accueilCours = ['Cours du bac STMG', '/cours/']

  for (const { s, niveau, chemin, themes } of matieres) {
    const N = NIVEAUX[niveau]
    const nomMatiere = `${s.name} — ${N} STMG`
    const nbChapitres = themes.reduce((n, th) => n + th.chapitres.length, 0)
    const arianeMatiere = [accueilCours, [nomMatiere, chemin]]

    pages.push({
      chemin,
      html: page({
        chemin,
        titre: `Révision ${s.name} ${N} STMG : cours et exercices gratuits | RévizSTMG`,
        description: resume(`${s.name} en ${N} STMG : ${pluriel(themes.length, 'thème', 'thèmes')} et ${pluriel(nbChapitres, 'chapitre', 'chapitres')} de cours clairs, avec exercices corrigés et flashcards. ${s.tagline || ''}`),
        h1: `Révision ${s.name} — ${N} STMG`,
        sousTitre: `${pluriel(themes.length, 'thème', 'thèmes')} · ${pluriel(nbChapitres, 'chapitre', 'chapitres')} de cours · exercices corrigés dans l’application`,
        ariane: arianeMatiere,
        contenu: themes.map(({ t, chemin: ct, chapitres }) => `<section class="theme">
<h2><a href="${ct}">${echapper(t.name)}</a></h2>
${t.intro ? `<p>${riche(t.intro)}</p>` : ''}
<ol class="chapitres">${chapitres.map(({ ch, chemin: cc }) => `<li><a href="${cc}">${echapper(sansEmoji(ch.title))}</a></li>`).join('')}</ol>
</section>`).join('\n') + `\n<p class="action"><a class="bouton" href="/#/subject/${s.id}">Réviser ${echapper(s.name)} dans l’application</a></p>`,
      }),
    })

    for (const { t, chemin: ct, chapitres } of themes) {
      const arianeTheme = [...arianeMatiere, [t.name, ct]]
      const essentiel = Array.isArray(t.essentiel) && t.essentiel.length
        ? `<section class="bloc astuce"><p class="bloc-titre">L’essentiel du thème</p><ul>${t.essentiel.map((e) => `<li>${riche(typeof e === 'string' ? e : e?.c || e?.t || '')}</li>`).join('')}</ul></section>` : ''
      pages.push({
        chemin: ct,
        html: page({
          chemin: ct,
          titre: `${sansEmoji(texteBrut(t.name))} — ${s.name} ${N} STMG | RévizSTMG`,
          description: resume(t.intro || `${t.name} : le cours de ${s.name} en ${N} STMG, chapitre par chapitre, avec exercices corrigés.`),
          h1: t.name,
          sousTitre: `${echapper(s.name)} · ${N} STMG · ${pluriel(chapitres.length, 'chapitre', 'chapitres')}`,
          ariane: arianeTheme,
          contenu: `${t.intro ? `<p class="intro">${riche(t.intro)}</p>` : ''}
${essentiel}
<h2>Les chapitres</h2>
<ol class="chapitres">${chapitres.map(({ ch, chemin: cc }) => {
            const premier = (ch.section.blocks || []).find((b) => b.t === 'p' && b.c)
            return `<li><a href="${cc}">${echapper(sansEmoji(ch.title))}</a>${premier ? `<span class="extrait">${echapper(resume(premier.c, 140))}</span>` : ''}</li>`
          }).join('')}</ol>
<p class="action"><a class="bouton" href="${lienApp(s, t)}">S’entraîner sur ce thème</a></p>`,
        }),
      })

      chapitres.forEach(({ ch, chemin: cc }, i) => {
        const nbExos = ch.games.length
        const precedent = chapitres[i - 1], suivant = chapitres[i + 1]
        const premier = (ch.section.blocks || []).find((b) => (b.t === 'p' || b.t === 'example' || b.t === 'tip') && typeof b.c === 'string')
        const description = resume(`${sansEmoji(ch.title)} : cours de ${s.name} ${N} STMG. ${premier ? premier.c : ''}`)
        pages.push({
          chemin: cc,
          html: page({
            chemin: cc,
            titre: `${sansEmoji(texteBrut(ch.title))} — Cours ${s.name} ${N} STMG | RévizSTMG`,
            description,
            h1: sansEmoji(ch.title),
            sousTitre: `${echapper(s.name)} · ${N} STMG · <a href="${ct}">${echapper(t.name)}</a>`,
            ariane: [...arianeTheme, [sansEmoji(ch.title), cc]],
            donnees: [{
              '@context': 'https://schema.org', '@type': 'LearningResource',
              name: sansEmoji(texteBrut(ch.title)), description, url: SITE + cc, inLanguage: 'fr',
              learningResourceType: 'Cours', educationalLevel: `${N} STMG`, isAccessibleForFree: true,
              about: s.name, isPartOf: { '@type': 'CreativeWork', name: texteBrut(t.name), url: SITE + ct },
              publisher: { '@type': 'Organization', name: 'RévizSTMG', url: SITE + '/' },
            }],
            contenu: `<article class="cours">${(ch.section.blocks || []).map(bloc).join('\n')}</article>
<aside class="entrainement">
<p class="bloc-titre">Entraîne-toi sur ce chapitre</p>
<p>${nbExos ? `${pluriel(nbExos, 'exercice corrigé', 'exercices corrigés')}, tirés uniquement de ce cours, ` : 'Des exercices corrigés, '}avec des flashcards et un carnet qui te fait revoir tes erreurs. Gratuit.</p>
<p><a class="bouton" href="${lienApp(s, t, ch.idx)}">Faire les exercices</a></p>
</aside>
<nav class="voisins" aria-label="Chapitres voisins">${precedent ? `<a href="${precedent.chemin}">← ${echapper(sansEmoji(precedent.ch.title))}</a>` : '<span></span>'}${suivant ? `<a href="${suivant.chemin}">${echapper(sansEmoji(suivant.ch.title))} →</a>` : ''}</nav>`,
          }),
        })
      })
    }
  }

  // Page d'entrée de tous les cours.
  const parNiveau = (n) => matieres.filter((m) => m.niveau === n)
  const carte = ({ s, chemin, themes }) => `<li><a href="${chemin}"><strong>${echapper(s.name)}</strong><span>${pluriel(themes.length, 'thème', 'thèmes')} · ${pluriel(themes.reduce((k, th) => k + th.chapitres.length, 0), 'chapitre', 'chapitres')}</span></a></li>`
  const total = matieres.reduce((n, m) => n + m.themes.reduce((k, th) => k + th.chapitres.length, 0), 0)
  pages.unshift({
    chemin: '/cours/',
    html: page({
      chemin: '/cours/',
      titre: 'Cours du bac STMG, Première et Terminale : toutes les matières | RévizSTMG',
      description: resume(`Tous les cours du bac STMG en accès libre : ${matieres.length} matières de Première et de Terminale, ${total} chapitres, avec exercices corrigés, flashcards et sujets au format des épreuves. Gratuit.`),
      h1: 'Cours du bac STMG',
      sousTitre: `${matieres.length} matières · ${total} chapitres · Première et Terminale`,
      ariane: [accueilCours],
      donnees: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Cours du bac STMG', url: `${SITE}/cours/`, inLanguage: 'fr', isAccessibleForFree: true }],
      contenu: `<p class="intro">Tous les cours de RévizSTMG, matière par matière. Lis le cours ici, puis entraîne-toi dans l’application : exercices corrigés, flashcards, carnet d’erreurs et sujets au format de l’épreuve.</p>
<h2>Terminale STMG</h2>
<ul class="matieres">${parNiveau('terminale').map(carte).join('')}</ul>
<h2>Première STMG</h2>
<ul class="matieres">${parNiveau('premiere').map(carte).join('')}</ul>
<p class="action"><a class="bouton" href="/">Ouvrir RévizSTMG</a></p>`,
    }),
  })
  return pages
}

export function sitemap(pages) {
  const urls = ['/', ...pages.map((p) => p.chemin)]
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- L'app (adresses « #/… ») n'a qu'une adresse ; les cours sont aussi publiés en
     pages statiques sous /cours/ (scripts/pages-cours/). Fichier généré. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`
}
