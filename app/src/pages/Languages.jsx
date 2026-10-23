import { useState } from 'react'
import { useT, usePublicText } from '../i18n.js'
import { useStore } from '../store.jsx'
import { normalizeStudyLanguages } from '../data/studyLanguages.js'
import catalogue from '../../resources/langues/catalogue.json'
import dePdf from '../../resources/langues/guide-de.pdf?url'
import enPdf from '../../resources/langues/guide-en.pdf?url'
import esPdf from '../../resources/langues/guide-es.pdf?url'
import itPdf from '../../resources/langues/guide-it.pdf?url'
import arPdf from '../../resources/langues/guide-ar.pdf?url'
import './Languages.css'
const pdfs = {de:dePdf,en:enPdf,es:esPdf,it:itPdf,ar:arPdf}
const guides = catalogue.map(g => ({...g,pdf:pdfs[g.id]}))

export default function Languages() {
 const { state } = useStore()
 const t = useT()
 const publicText = usePublicText()
 const names = {de:t('studyGerman'),en:t('studyEnglish'),es:t('studySpanish'),it:t('studyItalian'),ar:t('studyArabic')}
 const selected = normalizeStudyLanguages(state.studyLanguages)
 const [language,setLanguage] = useState(selected[0] || 'en')
 const [videoLevel,setVideoLevel] = useState('all')
 const guide = guides.find(g=>g.id===language) || guides[0]
 const levels = [...new Set(guide.videos.map(v=>v.level))]
 const videos = guide.videos.filter(v=>videoLevel==='all'||v.level===videoLevel)
 return <div className="language-hub animate-lux space-y-6">
  <header className="page-hero"><p className="kicker">L’atelier des langues</p><h1 className="font-display text-4xl">Ose prendre la parole.</h1><p className="mt-3 max-w-xl">Des guides à garder, des voix à écouter et de petites habitudes pour te sentir plus à l’aise à l’oral.</p></header>
  <nav aria-label="Choisir une langue" className="language-choices">{guides.map(g=><button key={g.id} type="button" aria-pressed={language===g.id} onClick={()=>{setLanguage(g.id);setVideoLevel('all')}}>{names[g.id]}<span dir="auto">{g.label}</span></button>)}</nav>
  <section className="language-feature" aria-labelledby="language-guide-title">
   <div className="language-cover" aria-hidden="true"><span>RÉVIZSTMG · LES GUIDES</span><strong>{names[guide.id]}</strong><span dir="auto">{guide.label}</span><i>Écouter.<br/>Parler.<br/>Recommencer.</i><span>Cours · exercices · corrigés</span></div>
   <div className="language-guide-copy"><p className="kicker">Ton compagnon de conversation</p><h2 id="language-guide-title" className="font-display text-3xl">Un guide complet, à ton rythme.</h2><p>{publicText(guide.intro)}</p><p>Des cours détaillés, des exemples et du vocabulaire, suivis de mini-exercices avec leurs corrigés expliqués. Un sommaire cliquable permet de retrouver les leçons et les réponses.</p><p className="font-semibold">{guide.stats.lessons} leçons · {guide.stats.exercises} exercices corrigés · {guide.stats.videos} vidéos</p><div className="language-pdf-actions"><a className="btn-primary" href={guide.pdf} target="_blank" rel="noopener noreferrer">Ouvrir le guide PDF ↗</a><a className="btn-secondary" href={guide.pdf} download={`RevizSTMG-guide-${guide.id}.pdf`}>Télécharger le PDF ↓</a></div><p className="text-sm">Guide en français avec exemples dans la langue étudiée. À lire sur écran ou à imprimer ; conserve-le sur ton appareil pour le consulter hors connexion.</p></div>
  </section>
  <section aria-labelledby="language-listen"><p className="kicker">Écouter pour mieux parler</p><h2 id="language-listen" className="font-display text-2xl">Des voix pour t’accompagner.</h2><div className="language-resources">{guide.resources.map((r,i)=><a key={r.url} className="card" href={r.url} target="_blank" rel="noopener noreferrer"><span className="kicker">{i===0?'Vidéos & écoute':'Pour aller plus loin'}</span><h3 className="font-display text-xl">{publicText(r.title)}</h3><p>{i===0?'Choisis une courte vidéo, écoute puis reprends une phrase à voix haute.':'Un complément pour vérifier, comprendre et pratiquer.'}</p><span className="font-semibold">Explorer la ressource ↗</span></a>)}</div><p className="mt-3 text-sm">Liens vers des sites externes : leurs conditions s’appliquent. Certaines activités peuvent demander un compte ou être payantes.</p></section>
  <details className="card p-5 language-video-library"><summary className="cursor-pointer font-semibold">Toute la bibliothèque vidéo · {guide.stats.videos} ressources</summary><p className="mt-3 text-sm">Des pages sélectionnées avec lecteur vidéo. Choisis un niveau, écoute un extrait puis résume-le avec tes propres mots. Les vidéos nécessitent une connexion Internet.</p><label className="mt-4 block font-semibold" htmlFor="language-video-level">Niveau des vidéos</label><select id="language-video-level" className="mt-2 w-full rounded-xl border p-3" style={{background:'var(--c-card)',color:'var(--c-ink)'}} value={videoLevel} onChange={e=>setVideoLevel(e.target.value)}><option value="all">Tous les niveaux</option>{levels.map(l=><option key={l} value={l}>{l}</option>)}</select><ul className="language-video-list">{videos.map(v=><li key={v.url}><a href={v.url} target="_blank" rel="noopener noreferrer"><span className="font-semibold" dir="auto">{v.title} ↗</span><span className="block text-sm">{v.provider} · {v.level}</span></a></li>)}</ul></details>
  <section className="card p-5" aria-labelledby="language-routine"><p className="kicker">20 minutes, un petit pas</p><h2 id="language-routine" className="font-display text-2xl">Ta routine pour aujourd’hui.</h2><ol className="language-routine">{[['5 min','Retrouve cinq expressions sans regarder.'],['5 min','Écoute un extrait et repère trois informations.'],['5 min','Répète, puis enregistre ta propre réponse.'],['5 min','Note un progrès et une priorité pour demain.']].map(([time,text],i)=><li key={text}><strong>{String(i+1).padStart(2,'0')}</strong><div><b>{time}</b><p>{publicText(text)}</p></div></li>)}</ol></section>
  <section aria-labelledby="language-advice"><h2 id="language-advice" className="font-display text-2xl">De petits déclics pour progresser.</h2><div className="language-advice">{guide.advice.map(s=><article className="card p-5" key={s.title}><h3 className="font-display text-xl">{publicText(s.title)}</h3><p className="mt-3">{publicText(s.task)}</p></article>)}</div></section>
  {language==='ar' && <p className="card p-5">Le guide présente l’arabe standard moderne. Pour les échanges du quotidien dans une région précise, complète-le avec la variété dialectale correspondante et un modèle audio adapté.</p>}
 </div>
}
