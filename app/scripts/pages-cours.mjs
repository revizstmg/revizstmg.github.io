// Génération statique adaptée du travail de Claude (#41), sur le contenu courant.
import {mkdirSync,writeFileSync,rmSync,copyFileSync,readFileSync,readdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname,join} from 'node:path'
import {chargerContenu,construirePages,sitemap,SITE,arborescence} from './pages-cours/generer.mjs'
const ICI=dirname(fileURLToPath(import.meta.url)),DIST=join(ICI,'..','dist')
await chargerContenu()
const pages=construirePages()
for(const dir of ['cours','a-propos','partager'])rmSync(join(DIST,dir),{recursive:true,force:true})
const assets=readdirSync(join(DIST,'assets'))
const display=assets.find(n=>/^cormorant-garamond-latin-wght-normal-.*\.woff2$/.test(n)),body=assets.find(n=>/^inter-latin-wght-normal-.*\.woff2$/.test(n))
if(!display||!body)throw Error('Polices locales de l’application introuvables')
// Découverte dès le HTML : évite d’attendre le téléchargement et l’analyse du CSS.
const preloadFonts=[display,body].map(f=>`<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`).join('\n')
for(const p of pages){const dir=join(DIST,p.chemin.replace(/^\//,''));mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'index.html'),p.html.replace('</head>',preloadFonts+'\n</head>'))}
const fonts=`@font-face{font-family:PublicDisplay;src:url('/assets/${display}') format('woff2');font-weight:300 700;font-display:swap}@font-face{font-family:PublicBody;src:url('/assets/${body}') format('woff2');font-weight:100 900;font-display:swap}\n`
writeFileSync(join(DIST,'cours','cours.css'),fonts+readFileSync(join(ICI,'pages-cours','cours.css'),'utf8'))
for(const id of ['en','es','it','ar','de'])copyFileSync(join(ICI,'..','resources','langues',`guide-${id}.pdf`),join(DIST,'cours','langues',`guide-${id}.pdf`))
writeFileSync(join(DIST,'sitemap.xml'),sitemap(pages))
writeFileSync(join(DIST,'sitemap.txt'),['/',...pages.map(p=>p.chemin)].map(p=>SITE+p).join('\n')+'\n')
const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
const matieres=arborescence()
const links=matieres.map(m=>`<li><a href="${m.chemin}">${escape(m.s.name)} (${m.niveau==='premiere'?'Première':'Terminale'})</a></li>`).join('')
const root=join(DIST,'index.html');let html=readFileSync(root,'utf8')
const fallback=`<main class="public-entry" id="contenu-public"><p>RévizSTMG</p><h1>Révision du bac STMG</h1><p>Cours de Première et Terminale, exercices corrigés, flashcards et examens blancs. Un projet indépendant créé par Matys DONAT et Gabriel MERLIN, élèves.</p><p><a href="/cours/">Lire les cours sans inscription</a> · <a href="/a-propos/">À propos et sources</a></p><h2>Choisis ta matière</h2><ul>${links}<li><a href="/cours/langues/">Guides de langues avec exercices et vidéos</a></li></ul><p>Les cours se lisent sans JavaScript. L’application interactive utilise JavaScript pour les exercices et la progression.</p></main>`
if(!html.includes('<div id="root"></div>'))throw Error('Repère de rendu public introuvable')
html=html.replace('<div id="root"></div>',`<div id="root">${fallback}</div>`).replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript>Tu peux lire les cours avec les liens ci-dessus ; active JavaScript pour utiliser les exercices interactifs.</noscript>')
html=html.replace('</head>',preloadFonts+'\n<style>.public-entry{max-width:850px;margin:24px auto;padding:28px;background:#f5f1e8;color:#203e36;font:17px/1.65 system-ui,sans-serif;border:1px solid #d7cba8;border-radius:16px}.public-entry h1,.public-entry h2{font-family:Georgia,serif;line-height:1.2}.public-entry a{color:#66501b;text-underline-offset:3px}.public-entry li{margin:10px 0}.public-entry a:focus-visible{outline:3px solid #66501b;outline-offset:3px}</style></head>')
writeFileSync(root,html)
writeFileSync(join(DIST,'llms.txt'),`# RévizSTMG\n\n> Cours publics de Première et Terminale STMG. Projet indépendant de deux élèves, sans certification professorale revendiquée.\n\nLes pages HTML de cours sont lisibles sans JavaScript et reprennent le contenu courant de l’application. Les exercices interactifs nécessitent JavaScript. Les sources et limites sont précisées dans chaque fiche et la page À propos.\n\n- [Tous les cours](${SITE}/cours/)\n- [Auteurs, méthode et sources](${SITE}/a-propos/)\n- [Sitemap](${SITE}/sitemap.xml)\n${matieres.map(m=>`- [${m.s.name} ${m.niveau}](${SITE}${m.chemin})`).join('\n')}\n- [Guides de langues](${SITE}/cours/langues/)\n`)
console.log(`[pages-cours] ${pages.length} pages HTML publiques, sitemap XML/texte, guides PDF et llms.txt générés`)
