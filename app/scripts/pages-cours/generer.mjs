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
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import Infographic from '../../src/components/Infographic.jsx'
import {StoreProvider} from '../../src/store.jsx'
import {sourcesFor,PROGRAMME} from './sources.mjs'
import langues from '../../resources/langues/catalogue.json'
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

const echapper = (t) => String(t ?? '').replace(/[—–]/g,'-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
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
// Coupe à une phrase entière quand c'est possible (jamais au milieu d'une phrase tant qu'on
// garde au moins 60 caractères), sinon au dernier mot avec « … » compté dans la limite.
function resume(t, max = 155) {
  const s = texteBrut(t)
  if (s.length <= max) return s
  const phrase = s.slice(0, max).match(/^(.*[.!?])(?=\s)/s)
  if (phrase && phrase[1].length >= 60) return phrase[1]
  const coupe = s.slice(0, max - 1)
  return `${coupe.slice(0, coupe.lastIndexOf(' '))}…`
}
// Titre de page : 60 caractères au plus (au-delà, Google le coupe). La marque suit quand elle tient.
const MAX_TITRE = 60
const MARQUE = ' | RévizSTMG'
export function titreSeo(base) {
  const b = sansEmoji(texteBrut(base)).replace(/[—–]/g, '-').replace(/\s*\|\s*RévizSTMG$/, '')
  if (b.includes(' | ')) return b // titre de chapitre déjà composé (matière, niveau)
  return b.length + MARQUE.length <= MAX_TITRE + 2 ? b + MARQUE : resume(b, MAX_TITRE)
}
// Premier candidat qui tient en entier (jamais de mot coupé par « … ») ; le dernier sert de repli.
export function titreChoisi(candidats) {
  for (const c of candidats) { const t = titreSeo(c); if (!t.endsWith('…') && t.length <= MAX_TITRE + 2) return t }
  return titreSeo(candidats[candidats.length - 1])
}
// Titre d'un chapitre : le suffixe reste entier, c'est le titre du chapitre qui se raccourcit. Plusieurs
// suffixes possibles, du plus complet au plus court : on prend le premier qui laisse 38 caractères au chapitre.
export function titreChapitre(chapitre, suffixes, max = MAX_TITRE) {
  const c = sansEmoji(texteBrut(chapitre)).replace(/[—–]/g, '-')
  const liste = [].concat(suffixes)
  const suffixe = liste.find((x) => max - x.length >= Math.min(c.length, 38)) || liste[liste.length - 1]
  return c.length + suffixe.length <= max ? c + suffixe : resume(c, max - suffixe.length) + suffixe
}
// Deux chapitres ne partagent jamais le même titre : en cas de collision après raccourcissement, on rallonge le second.
const titresVus = new Set()
function titreUnique(chapitre, suffixes) {
  let t = titreChapitre(chapitre, suffixes)
  for (let max = MAX_TITRE + 10; titresVus.has(t) && max <= 200; max += 10) t = titreChapitre(chapitre, suffixes, max)
  titresVus.add(t)
  return t
}
// Description d'un chapitre : d'abord le contenu (phrases entières, environ 110 caractères), puis un rappel de la matière si la place le permet.
export function descriptionChapitre(contenus, rappel) {
  const phrases = [].concat(contenus).flatMap((c) => texteBrut(c).split(/(?<=[.!?])\s+/)).filter((p) => p.length > 1)
  let d = ''
  for (const p of phrases) {
    const suite = d ? `${d} ${p}` : p
    if (d && suite.length > 150) { if (d.length < 70) d = resume(suite, 155); break }
    d = suite
    if (d.length >= 110) break
  }
  if (!d) return rappel
  if (d.length > 155) d = resume(d, 155)
  d = d.replace(/\s*:$/, '.')
  return !/[;,…]$/.test(d) && d.length + rappel.length + 1 <= 160 ? `${d} ${rappel}` : d
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
    case 'figure': return renderToStaticMarkup(createElement(StoreProvider,null,createElement(Infographic,{name:b.name,color:'#0f766e'})))
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
  titre=titreSeo(titre)
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
<a class="evitement" href="#contenu">Aller au contenu</a>
<header class="entete"><a class="marque" href="/"><span aria-hidden="true">◇</span> RévizSTMG</a><nav aria-label="Navigation"><a href="/cours/">Cours</a><a href="/a-propos/">À propos</a><a class="ouvrir" href="/#/accueil">Ouvrir l’application</a></nav></header>
<nav class="ariane" aria-label="Fil d’Ariane"><ol>${ariane.map(([nom, ch], i) => (i === ariane.length - 1 ? `<li aria-current="page">${echapper(nom)}</li>` : `<li><a href="${ch}">${echapper(nom)}</a></li>`)).join('')}</ol></nav>
<main id="contenu">
<h1>${echapper(h1)}</h1>
${sousTitre ? `<p class="sous-titre">${sousTitre}</p>` : ''}
${contenu}
</main>
<footer class="pied">
<p><strong>RévizSTMG</strong> : révision du bac STMG, en Première et en Terminale. Cours et exercices corrigés gratuits ; flashcards, sujets au format des épreuves et bacs blancs avec Premium.</p>
<p><a href="/a-propos/">À propos et sources</a> · <a href="/partager/">Partager une ressource</a> · <a href="/cours/">Tous les cours</a> · <a href="/">Ouvrir l’application</a> · <a href="/#/confidentialite">Confidentialité</a> · <a href="/#/cgu">CGU et mentions légales</a></p>
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
  for (const s of C.SUBJECTS.filter(s=>!s.comingSoon&&!s.resourceOnly&&!['langues','p1-langues'].includes(s.id))) {
    const niveau = niveauDe(s)
    const base = `/cours/${niveau}/${slug(s.name)}/`
    const themesVus = new Set()
    const themes = s.chapters.filter(t=>!t.comingSoon&&C.themeChapters(t).length).map((t) => {
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
  titresVus.clear()
  const matieres = arborescence()
  const pages = []
  const flat=matieres.flatMap(m=>m.themes.flatMap(t=>t.chapitres.map(ch=>({...ch,subject:m.s,niveau:m.niveau}))))
  const liens=hrefs=>hrefs.map(r=>`<li><a href="${echapper(r.url)}" rel="noopener noreferrer">${echapper(r.name)}</a></li>`).join('')
  const provenance=s=>`<section class="sources"><h2>Sources et vérification</h2><p>Fiche de RévizSTMG, projet de Matys DONAT et Gabriel MERLIN, élèves. Ce support indépendant peut comporter des erreurs ; les références ci-dessous permettent de vérifier le cadre du programme et les notions. <a href="/a-propos/">Notre méthode</a>.</p><ul>${liens(sourcesFor(s.id))}</ul></section>`
  const accueilCours = ['Cours du bac STMG', '/cours/']

  for (const { s, niveau, chemin, themes } of matieres) {
    const N = NIVEAUX[niveau]
    const nomMatiere = `${s.name} - ${N} STMG`
    const nbChapitres = themes.reduce((n, th) => n + th.chapitres.length, 0)
    const arianeMatiere = [accueilCours, [nomMatiere, chemin]]

    pages.push({
      chemin,
      html: page({
        chemin,
        titre: titreChoisi([`Révision ${s.name} ${N} STMG : cours et exercices`, `Cours ${s.name} ${N} STMG : exercices gratuits`, `Cours ${s.name} ${N} STMG`, `Cours ${s.short || s.name} ${N} STMG`]),
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
          titre: titreChoisi([`${sansEmoji(texteBrut(t.name))} - ${s.name} ${N} STMG`, `${sansEmoji(texteBrut(t.name))} - ${s.short || s.name} ${N} STMG`, `${sansEmoji(texteBrut(t.name))} | ${N} STMG`, sansEmoji(texteBrut(t.name))]),
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
        const nbExos = C.jeuxDuChapitre(ch,t).length
        const defs=C.sectionDefinitions(ch.section,t.id,s.id,ch.idx,3).defs
        const recap=defs.length?`<section class="reperes"><h2>Les notions clés</h2><dl>${defs.map(d=>`<dt>${echapper(d.term)}</dt><dd>${riche(d.def)}</dd>`).join('')}</dl></section>`:''
        const questions=ch.games.filter(g=>g.type==='qcm').flatMap(g=>g.questions||[]).filter(q=>Array.isArray(q.choices)&&Number.isInteger(q.answer)&&q.choices[q.answer]!==undefined).slice(0,2)
        const exemples=questions.length?`<section class="questions"><h2>Exercices corrigés</h2>${questions.map((q,k)=>`<h3>${k+1}. ${riche(q.q)}</h3><ol>${q.choices.map(c=>`<li>${riche(c)}</li>`).join('')}</ol><details><summary>Voir la correction</summary><p>${riche(q.choices[q.answer])}</p>${q.explain?`<p>${riche(q.explain)}</p>`:''}</details>`).join('')}</section>`:''
        const related=relatedLessons({ch,subject:s,niveau},flat).map(r=>`<li><a href="${r.chemin}">${echapper(r.ch.title)} (${echapper(r.subject.short||r.subject.name)})</a></li>`).join('')
        const precedent = chapitres[i - 1], suivant = chapitres[i + 1]
        const premier = (ch.section.blocks || []).find((b) => (b.t === 'p' || b.t === 'example' || b.t === 'tip') && typeof b.c === 'string')
        const description = descriptionChapitre((ch.section.blocks || []).filter((b) => (b.t === 'p' || b.t === 'example' || b.t === 'tip') && typeof b.c === 'string').slice(0, 4).map((b) => b.c).concat(sansEmoji(ch.title)), `Cours ${s.name} ${N} STMG.`)
        pages.push({
          chemin: cc,
          html: page({
            chemin: cc,
            titre: titreUnique(ch.title, [` | ${s.short || s.name} ${N} STMG`, ` | ${N} STMG`]),
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
              author: { '@type': 'Organization', name: 'RévizSTMG', url: SITE + '/a-propos/' },
              citation: sourcesFor(s.id).map(r=>r.url),
            }],
            contenu: `${recap}<article class="cours">${(ch.section.blocks || []).map(bloc).join('\n')}</article>${exemples}${related?`<section><h2>Pour relier les notions</h2><ul>${related}</ul></section>`:''}${provenance(s)}
<aside class="entrainement">
<p class="bloc-titre">Entraîne-toi sur ce chapitre</p>
<p>${nbExos ? `${pluriel(nbExos, 'exercice corrigé', 'exercices corrigés')}, tirés uniquement de ce cours. Retrouve aussi les flashcards et les parcours de révision avec Premium.` : 'Lis et révise les notions de ce chapitre dans l’application.'} Gratuit.</p>
<p><a class="bouton" href="${lienApp(s, t, ch.idx)}">${nbExos?'Faire les exercices':'Ouvrir ce chapitre'}</a></p>
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
      titre: 'Cours du bac STMG, Première et Terminale',
      description: resume(`Tous les cours du bac STMG en accès libre : ${matieres.length} matières de Première et de Terminale, ${total} chapitres, avec exercices corrigés. Cours et exercices gratuits ; flashcards et sujets au format des épreuves avec Premium.`),
      h1: 'Cours du bac STMG',
      sousTitre: `${matieres.length} matières · ${total} chapitres · Première et Terminale`,
      ariane: [accueilCours],
      donnees: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Cours du bac STMG', url: `${SITE}/cours/`, inLanguage: 'fr', isAccessibleForFree: true }],
      contenu: `<p class="intro">Tous les cours de RévizSTMG, matière par matière. Lis le cours ici, puis entraîne-toi dans l’application : exercices corrigés, flashcards, révisions personnalisées et sujets au format de l’épreuve.</p>
<h2>Terminale STMG</h2>
<ul class="matieres">${parNiveau('terminale').map(carte).join('')}</ul>
<p><a href="/cours/langues/">Anglais, espagnol, italien, arabe et allemand : guides PDF et vidéos</a></p>
<h2>Première STMG</h2>
<ul class="matieres">${parNiveau('premiere').map(carte).join('')}</ul>
<p class="action"><a class="bouton" href="/">Ouvrir RévizSTMG</a></p>`,
    }),
  })
  pages.push(...extraPages(matieres))
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

// Liens de lecture seulement : les exercices restent exclusivement rattachés au chapitre.
export function relatedLessons(current,all){
 const title=texteBrut(current.ch.title).toLowerCase()
 const rules=[
 {from:/droit/,to:/rh-communication/,source:/contrat de travail|salari|conditions de travail/,target:/travail|motivation|cadre juridique/},
 {from:/rh-communication/,to:/droit/,source:/travail|cadre juridique/,target:/contrat de travail|salari/},
 {from:/management/,to:/gestion-finance|p1-sgn/,source:/performance/,target:/performance|rentabilit|valeur ajout/},
 {from:/economie/,to:/mercatique|management/,source:/march|concurrence/,target:/march|concurrence|prix/},
 ]
 const rule=rules.find(r=>r.from.test(current.subject.id)&&r.source.test(title))
 if(!rule)return []
 return all.filter(r=>r.niveau===current.niveau&&r.subject.id!==current.subject.id&&rule.to.test(r.subject.id)&&rule.target.test(texteBrut(r.ch.title).toLowerCase())).slice(0,3)
}
function extraPages(matieres){
 const result=[]
 const add=(chemin,titre,description,contenu)=>result.push({chemin,html:page({chemin,titre:titre+' | RévizSTMG',description,h1:titre,ariane:[['Cours','/cours/'],[titre,chemin]],contenu})})
 add('/a-propos/','À propos de RévizSTMG','Qui crée RévizSTMG, comment les cours sont préparés et corrigés, et quelles sources officielles consulter pour réviser le bac STMG.',`<section><h2>Les créateurs</h2><p>Matys DONAT et Gabriel MERLIN sont les éditeurs de RévizSTMG. Ils sont élèves et portent ce projet à titre non professionnel, comme l’indiquent les <a href="/#/cgu">mentions légales</a>. Ce site indépendant n’est pas un service du ministère de l’Éducation nationale.</p></section><section><h2>Notre méthode</h2><p>Les fiches et exercices sont organisés pour les programmes de Première et Terminale STMG. Certaines parties ont été préparées avec l’aide d’outils automatiques, puis corrigées et relues au fil des vérifications et des retours. Cela ne signifie pas que chaque fiche a été validée par un professeur. Les supports peuvent encore contenir des erreurs ; le cours de ton enseignant et les textes officiels restent les références.</p><p>Les pages publiques et l’application utilisent le même contenu. Les exercices proposés sur un chapitre portent uniquement sur son cours. Les guides de langues actuels remplacent les anciennes fiches de langues.</p><p>Les corrections sont documentées dans le <a href="https://github.com/revizstmg/revizstmg.github.io/blob/main/docs/RELECTURE-RAPPORTS-CLAUDE.md">bilan des corrections pédagogiques</a> et le <a href="https://github.com/revizstmg/revizstmg.github.io/blob/main/docs/RELECTURE-MANUELS-LANGUES-20261024.md">bilan de relecture des guides de langues</a>.</p></section><section id="sources"><h2>Sources officielles</h2><ul>${[PROGRAMME,...sourcesFor('droit').slice(1),...sourcesFor('economie').slice(1)].map(r=>`<li><a href="${r.url}">${echapper(r.name)}</a></li>`).join('')}</ul><p>Pour le droit et l’économie, vérifie aussi la date des textes et des données. Une fiche de révision n’est pas un conseil juridique.</p></section><section><h2>Signaler une erreur</h2><p>Dans l’application, utilise le signalement depuis le cours. Tu peux aussi écrire à <a href="mailto:revizstmg@gmail.com">revizstmg@gmail.com</a> en indiquant la matière, le thème, le chapitre et le passage à revoir.</p></section>`)
 const picks=matieres.filter(m=>['droit','management','p1-sgn'].includes(m.s.id)).map(m=>`<li><a href="${m.chemin}">Cours ${echapper(m.s.name)} ${NIVEAUX[m.niveau]} STMG</a></li>`).join('')
 add('/partager/','Partager RévizSTMG','Des ressources STMG gratuites et lisibles sans compte à partager avec une classe, un enseignant ou un groupe de révision.',`<p>Tu peux partager une fiche précise avec ta classe ou ton enseignant. Les pages de cours se lisent sans compte et sans JavaScript ; les exercices s’ouvrent dans l’application.</p><h2>Quelques points de départ</h2><ul>${picks}<li><a href="/cours/">Toutes les matières de Première et Terminale</a></li></ul><h2>Un message à adapter</h2><blockquote>Bonjour, voici RévizSTMG, un projet de révision créé par deux élèves. Les cours sont consultables librement et proposent des liens vers les exercices. Si une ressource vous semble utile, vous pouvez la partager. Les retours pédagogiques et signalements d’erreurs sont les bienvenus.</blockquote><p>Choisis un cours en lien avec la discussion et respecte les règles de la communauté. Aucun partenariat ni soutien d’un établissement n’est revendiqué.</p>`)
 const cartes=langues.map(g=>`<li><a href="/cours/langues/${g.id}/">${echapper(g.name)}</a></li>`).join('')
 add('/cours/langues/','Guides de langues','Anglais, espagnol, italien, arabe et allemand : guides PDF avec cours, mini-exercices corrigés, conseils et liens vidéo.',`<p>Choisis ton guide pour travailler la compréhension et l’expression. Les vidéos sont proposées par des sites externes.</p><ul>${cartes}</ul>`)
 for(const g of langues)add(`/cours/langues/${g.id}/`,`Cours d’${g.name.toLowerCase()}`,`${g.name} : un guide PDF de cours, exercices corrigés et conseils, avec une sélection de vidéos pour pratiquer les langues en STMG.`,`<p>${echapper(g.intro)}</p><p><a class="bouton" href="/cours/langues/guide-${g.id}.pdf">Ouvrir le guide PDF ${echapper(g.name)}</a></p><h2>Ressources et vidéos</h2><ul>${g.resources.map(r=>`<li><a href="${echapper(r.url)}">${echapper(r.title)}</a></li>`).join('')}</ul><details><summary>La bibliothèque vidéo (${g.videos.length} ressources)</summary><ul>${g.videos.map(v=>`<li><a href="${echapper(v.url)}" dir="auto">${echapper(v.title)}</a> - ${echapper(v.provider)} · ${echapper(v.level)}</li>`).join('')}</ul></details><h2>Conseils de pratique</h2>${g.advice.map(a=>`<h3>${echapper(a.title)}</h3><p>${echapper(a.task)}</p>`).join('')}<p>Les liens externes nécessitent une connexion ; leurs propres conditions s’appliquent. <a href="/#/subject/langues">Retrouver les guides dans l’application</a>.</p>`)
 return result
}
