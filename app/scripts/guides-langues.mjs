// Génération locale des manuels et de leur catalogue léger :
//   cd app && node scripts/guides-langues.mjs
import { chromium } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'

const esc = s => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
function inline(value) {
  return esc(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/([\u0600-\u06FF](?:[\u0600-\u06FF\sـ]*[\u0600-\u06FF])?)/g, '<bdi dir="rtl" lang="ar">$1</bdi>')
}
const css = `
@page {size:A4;margin:14mm 15mm 18mm}
*{box-sizing:border-box}body{font-family:Arial,'Noto Sans Arabic',sans-serif;font-size:10pt;line-height:1.48;color:#203b32}
h1,h2,h3{font-family:Georgia,serif;line-height:1.2;break-after:avoid}h1{font-size:39pt}h2{font-size:21pt;margin:18pt 0 9pt}h3{font-size:14pt;margin:13pt 0 6pt}
p{margin:6pt 0;orphans:3;widows:3}a{color:#214f41;text-decoration:underline;overflow-wrap:anywhere}bdi{font-family:Arial,'Noto Sans Arabic',sans-serif}
.cover{height:245mm;border-top:6pt solid #ae8737;display:flex;flex-direction:column;justify-content:center;break-after:page}.cover .native{font-size:24pt}.cover .intro{font-size:14pt;max-width:85%}.stats{font-size:16pt;font-weight:bold;padding:15pt 0;border-block:1pt solid #c3cdbf;margin:20pt 0}
.tag{font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:1.3pt;color:#755c26}.muted{font-size:8.5pt;color:#4c5e52}.part{break-before:page}.toc{columns:2;column-gap:24pt;font-size:9pt;padding-left:18pt}.toc li{break-inside:avoid;margin:5pt 0}.lesson{border-bottom:1pt solid #cdd6c9;padding-bottom:12pt;margin-bottom:14pt}.lesson>.tag{break-after:avoid}.lesson>h2{margin-top:10pt}.lexicon{columns:2;column-gap:18pt;padding:0;list-style:none;font-size:9pt}.lexicon li{break-inside:avoid;padding:3pt 0;border-bottom:.4pt solid #e3e7dc}.lexicon strong{display:block}.box{background:#f3f0e6;border-left:3pt solid #b39149;padding:9pt 12pt;margin:10pt 0;break-inside:avoid}.exercise{margin:10pt 0;break-inside:avoid}.exercise p{margin:4pt 0}.choices{list-style:none;padding:0;margin:5pt 0 5pt 12pt}.choices li{padding:2pt 0}.answer-space{height:18pt;border-bottom:.5pt dotted #9ca99d}.reading{font-size:9.5pt;background:#edf1ea;padding:10pt;break-inside:avoid}.solutions{columns:2;column-gap:20pt}.solution{break-inside:avoid;margin:0 0 12pt;border-bottom:.5pt solid #ccd6ca;padding-bottom:8pt;font-size:9pt}.solution h3{font-family:Arial,sans-serif;font-size:10pt;margin-top:0}.video-list{columns:2;column-gap:20pt;padding-left:19pt;font-size:9pt}.video-list li{break-inside:avoid;margin-bottom:12pt}.method{break-inside:avoid;margin-bottom:16pt}.checklist{margin:7pt 0;padding-left:18pt}
`
function exercise(e, number, showContext = true) {
  return `<article class="exercise" id="${esc(e.id)}"><p><strong>Exercice ${number}</strong> · <span class="muted">${esc(e.type === 'production' ? 'Expression guidée' : e.type === 'qcm' ? 'Choisir et justifier' : 'Mini-exercice')}</span></p>${e.context && showContext ? `<div class="reading"><strong>Document à lire</strong><p>${e.context.split(/\n\n+/).map(inline).join('</p><p>')}</p></div>` : ''}<p>${inline(e.prompt)}</p>${e.choices?.length ? `<ul class="choices">${e.choices.map((c,i) => `<li><b>${String.fromCharCode(65+i)}.</b> ${inline(c)}</li>`).join('')}</ul>` : '<div class="answer-space"></div>'}<p class="muted"><a href="#corr-${esc(e.id)}">Voir le corrigé expliqué de l’exercice ${number}</a></p></article>`
}
function exerciseSeries(items, numbers) {
  let previousContext = null
  return items.map(e => {
    const key = e.origin + '|' + e.context
    const html = exercise(e, numbers.get(e.id), key !== previousContext)
    previousContext = key
    return html
  }).join('')
}
function render(d) {
  const byLesson = new Map(d.lessons.map(l => [l.id,d.exercises.filter(e => e.lessonId === l.id)]))
  const units = [...new Set(d.exercises.filter(e => !e.lessonId).map(e => e.unit))]
  const ordered = [...d.lessons.flatMap(l => byLesson.get(l.id)), ...units.flatMap(u => d.exercises.filter(e => !e.lessonId && e.unit === u))]
  const numbers = new Map(ordered.map((e,i) => [e.id,i+1]))
  const lessons = d.lessons.map((l,i) => `<section class="lesson" id="lecon-${i+1}"><p class="tag">Leçon ${i+1} · ${esc(l.part)}</p><h2>${inline(l.title)}</h2>${l.paragraphs.map(p => `<p>${inline(p)}</p>`).join('')}${l.lexicon.length ? `<h3>Formes, exemples et vocabulaire à retenir</h3><ul class="lexicon">${l.lexicon.map(r => `<li><strong>${inline(r.term)}</strong>${inline(r.meaning)}</li>`).join('')}</ul>` : ''}${l.oral ? `<div class="box"><strong>Application orale</strong><p>${inline(l.oral)}</p></div>` : ''}${byLesson.get(l.id).length ? `<h3>À toi de jouer · sans regarder les réponses</h3>${exerciseSeries(byLesson.get(l.id),numbers)}` : ''}</section>`).join('')
  const solutions = ordered.map((e,i) => `<article class="solution" id="corr-${esc(e.id)}"><h3>Exercice ${i+1} · ${e.type === 'production' ? 'Exemple de réponse' : 'Réponse attendue'}</h3><p><strong>${e.choices.length ? String.fromCharCode(65+e.choices.indexOf(e.answer))+'. ' : ''}${inline(e.answer)}</strong></p><p>${inline(e.explanation)}</p>${e.alternatives?.length ? `<p>Autres formes acceptées : ${e.alternatives.map(inline).join(' ; ')}.</p>` : ''}<p><a href="#${esc(e.id)}">Revenir à l’énoncé ${i+1}</a></p></article>`).join('')
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><title>RévizSTMG — Manuel : ${esc(d.name)}</title><style>${css}</style><body>
<section class="cover"><p class="tag">RévizSTMG · Manuel d’apprentissage</p><h1>${esc(d.name)}<br><span class="native" dir="auto">${esc(d.label)}</span></h1><p class="intro">Cours détaillés, exemples, vocabulaire et entraînement progressif pour comprendre et prendre la parole.</p><div class="stats">${d.lessons.length} leçons · ${d.exercises.length} exercices corrigés<br>${d.videos.length} pages vidéo sélectionnées</div><p dir="auto">${inline(d.hello)}</p><p class="muted">Première et Terminale · Du socle aux approfondissements<br>Édition octobre 2026 · Cours et exercices RévizSTMG<br>Les niveaux des vidéos sont ceux indiqués par leurs éditeurs, pas une garantie de niveau à l’issue du manuel.</p></section>
<section><h2>Comment travailler avec ce manuel</h2><p>Lis une leçon, reformule ses règles, puis fais les exercices sans ouvrir le corrigé. Les liens « Voir le corrigé » te conduisent aux réponses expliquées en fin de manuel ; chaque réponse permet de revenir à son énoncé. Pour les traductions et les productions libres, la correction donne une formulation possible : d’autres réponses peuvent être justes.</p><p>Pour une vidéo, écoute une première fois pour le sujet, une deuxième fois pour trois informations, puis résume à voix haute. Vérifie avec la transcription ou les activités de l’éditeur lorsqu’elles existent. Les vidéos nécessitent une connexion ; les cours et corrigés de ce PDF restent utilisables hors ligne.</p><p>${d.id==='ar' ? 'Ce manuel porte sur l’arabe standard moderne. Les dialectes sont distincts et doivent être travaillés avec des modèles régionaux adaptés. L’écriture non vocalisée ne permet pas de deviner toutes les voyelles : vérifie les modèles sonores.' : 'Adapte la difficulté : commence par les bases, puis élargis le vocabulaire, les temps et l’argumentation. Les cultures et situations professionnelles fournissent des sujets de prise de parole.'}</p><h2>Sommaire cliquable</h2><ol class="toc">${d.lessons.map((l,i) => `<li><a href="#lecon-${i+1}">${inline(l.title)}</a></li>`).join('')}</ol><p><a href="#bilans">Bilans et exercices transversaux</a> · <a href="#videos">Bibliothèque vidéo</a> · <a href="#corriges">Tous les corrigés expliqués</a> · <a href="#methodes">Méthodes et programme de travail</a></p></section>
<div class="part">${lessons}</div><section class="part" id="bilans"><p class="tag">Mobiliser plusieurs acquis</p><h2>Bilans et exercices transversaux</h2><p>Les exercices suivants réutilisent plusieurs notions d’une même unité ou proposent un transfert vers une nouvelle situation. Justifie tes choix ; ne te limite pas à reconnaître une réponse.</p>${units.map(u => `<section><h3>${inline(u)}</h3>${exerciseSeries(d.exercises.filter(e => !e.lessonId && e.unit===u),numbers)}</section>`).join('')}</section>
<section class="part" id="videos"><p class="tag">Écouter, observer, réemployer</p><h2>${d.videos.length} pages vidéo pour pratiquer</h2><p>Liens directs vers les pages des éditeurs avec lecteur vidéo. Ces vidéos ne sont pas hébergées par RévizSTMG. Les conditions de l’éditeur s’appliquent : compte, zone géographique ou options payantes peuvent varier. Clique sur un titre depuis la version numérique du PDF.</p><div class="box"><strong>Un mini-parcours pour chaque vidéo</strong><ol class="checklist"><li>Avant : prédis le thème à partir du titre et note trois mots utiles.</li><li>Pendant : relève trois informations et une expression nouvelle.</li><li>Après : résume en cinq phrases puis formule un avis avec un exemple.</li><li>Vérifie les informations avec le support de l’éditeur ; ne présente pas une supposition comme un fait.</li></ol></div><ol class="video-list">${d.videos.map(v => `<li><a href="${esc(v.url)}">${inline(v.title)}</a><br><span class="muted">${esc(v.provider)} · ${esc(v.level)}</span></li>`).join('')}</ol></section>
<section class="part" id="corriges"><p class="tag">Comprendre ses erreurs</p><h2>Corrigés expliqués · ${d.exercises.length} exercices</h2><p>Une bonne correction explique le choix : auxiliaire, accord, temps, sens du mot ou information du document. Pour progresser, cache la réponse et refais l’exercice le lendemain. Les productions libres sont des exemples, pas des textes à apprendre mot à mot.</p><div class="solutions">${solutions}</div></section>
<section class="part" id="methodes"><p class="tag">Installer des habitudes utiles</p><h2>Méthodes et programme de travail</h2>${d.methodSections.map(i => {const s=d.sections[i];return `<article class="method"><h3>${inline(s.title)}</h3><p>${inline(s.text)}</p><div class="box"><strong>Application</strong><p>${inline(s.task)}</p></div></article>`}).join('')}<h3>Ressources de référence</h3><ul>${d.resources.map(r => `<li><a href="${esc(r.url)}">${esc(r.title)}</a></li>`).join('')}</ul><p class="muted">Les cours et exercices viennent des contenus RévizSTMG et d’activités complémentaires originales. Les vidéos et leurs textes restent ceux de leurs éditeurs ; ils ne sont pas reproduits dans le manuel. Les attentes d’évaluation restent celles données par ton professeur.</p></section></body></html>`
}
const browser = await chromium.launch()
const catalogue = []
try {
  for (const id of ['en','es','it','ar','de']) {
    const d = JSON.parse(await readFile(new URL(`../resources/langues/${id}.json`,import.meta.url),'utf8'))
    if (!d.lessons?.length || !d.exercises?.length || !d.videos?.length) throw new Error(`Manuel ${id} incomplet`)
    const page = await browser.newPage()
    await page.setContent(render(d))
    await page.evaluate(() => document.fonts.ready)
    await page.pdf({path:new URL(`../resources/langues/guide-${id}.pdf`,import.meta.url).pathname,printBackground:true,preferCSSPageSize:true,outline:true,tagged:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:`<div style="font:8px Arial;width:100%;text-align:center;color:#52645a">RévizSTMG · ${esc(d.name)} · Cours & exercices corrigés · <span class="pageNumber"></span> / <span class="totalPages"></span></div>`})
    await page.close()
    catalogue.push({id,name:d.name,label:d.label,intro:d.intro,resources:d.resources,videos:d.videos,stats:{lessons:d.lessons.length,exercises:d.exercises.length,videos:d.videos.length},advice:[2,3,16].map(i => d.sections[i])})
    console.log(`${d.name} : ${d.lessons.length} leçons, ${d.exercises.length} exercices, ${d.videos.length} vidéos`)
  }
  await writeFile(new URL('../resources/langues/catalogue.json',import.meta.url),JSON.stringify(catalogue,null,2)+'\n')
} finally { await browser.close() }
