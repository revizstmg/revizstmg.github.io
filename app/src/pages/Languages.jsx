import { useState } from 'react'
import { useT } from '../i18n.js'
import { useStore } from '../store.jsx'
import { normalizeStudyLanguages } from '../data/studyLanguages.js'
import en from '../../resources/langues/en.json'
import es from '../../resources/langues/es.json'
import it from '../../resources/langues/it.json'
import ar from '../../resources/langues/ar.json'
import enPdf from '../../resources/langues/guide-en.pdf?url'
import esPdf from '../../resources/langues/guide-es.pdf?url'
import itPdf from '../../resources/langues/guide-it.pdf?url'
import arPdf from '../../resources/langues/guide-ar.pdf?url'
import './Languages.css'
const guides = [{...en,pdf:enPdf},{...es,pdf:esPdf},{...it,pdf:itPdf},{...ar,pdf:arPdf}]

export default function Languages() {
 const { state } = useStore()
 const t = useT()
 const names = {en:t('studyEnglish'),es:t('studySpanish'),it:t('studyItalian'),ar:t('studyArabic')}
 const selected = normalizeStudyLanguages(state.studyLanguages)
 const [language,setLanguage] = useState(selected[0] || 'en')
 const guide = guides.find(g=>g.id===language) || guides[0]
 return <div className="language-hub animate-lux space-y-6">
  <header className="page-hero"><p className="kicker">L’atelier des langues</p><h1 className="font-display text-4xl">Ose prendre la parole.</h1><p className="mt-3 max-w-xl">Des guides à garder, des voix à écouter et de petites habitudes pour te sentir plus à l’aise à l’oral.</p></header>
  <nav aria-label="Choisir une langue" className="language-choices">{guides.map(g=><button key={g.id} type="button" aria-pressed={language===g.id} onClick={()=>setLanguage(g.id)}>{names[g.id]}<span dir="auto">{g.label}</span></button>)}</nav>
  <section className="language-feature" aria-labelledby="language-guide-title">
   <div className="language-cover" aria-hidden="true"><span>RÉVIZSTMG · LES GUIDES</span><strong>{guide.name}</strong><span dir="auto">{guide.label}</span><i>Écouter.<br/>Parler.<br/>Recommencer.</i><span>18 fiches · méthode & conversation</span></div>
   <div className="language-guide-copy"><p className="kicker">Ton compagnon de conversation</p><h2 id="language-guide-title" className="font-display text-3xl">Un guide complet, à ton rythme.</h2><p>{guide.intro}</p><p>Prononciation, phrases utiles, dialogues, vocabulaire, situations de STMG et plan de quatre semaines : 18 fiches avec une activité orale à chaque étape.</p><div className="language-pdf-actions"><a className="btn-primary" href={guide.pdf} target="_blank" rel="noopener noreferrer">Ouvrir le guide PDF ↗</a><a className="btn-secondary" href={guide.pdf} download={`RevizSTMG-guide-${guide.id}.pdf`}>Télécharger le PDF ↓</a></div><p className="text-sm">Guide en français avec exemples dans la langue étudiée. À lire sur écran ou à imprimer ; conserve-le sur ton appareil pour le consulter hors connexion.</p></div>
  </section>
  <section aria-labelledby="language-listen"><p className="kicker">Écouter pour mieux parler</p><h2 id="language-listen" className="font-display text-2xl">Des voix pour t’accompagner.</h2><div className="language-resources">{guide.resources.map((r,i)=><a key={r.url} className="card" href={r.url} target="_blank" rel="noopener noreferrer"><span className="kicker">{i===0?'Vidéos & écoute':'Pour aller plus loin'}</span><h3 className="font-display text-xl">{r.title}</h3><p>{i===0?'Choisis une courte vidéo, écoute puis reprends une phrase à voix haute.':'Un complément pour vérifier, comprendre et pratiquer.'}</p><span className="font-semibold">Explorer la ressource ↗</span></a>)}</div><p className="mt-3 text-sm">Liens vers des sites externes : leurs conditions s’appliquent. Certaines activités peuvent demander un compte ou être payantes.</p></section>
  <section className="card p-5" aria-labelledby="language-routine"><p className="kicker">20 minutes, un petit pas</p><h2 id="language-routine" className="font-display text-2xl">Ta routine pour aujourd’hui.</h2><ol className="language-routine">{[['5 min','Retrouve cinq expressions sans regarder.'],['5 min','Écoute un extrait et repère trois informations.'],['5 min','Répète, puis enregistre ta propre réponse.'],['5 min','Note un progrès et une priorité pour demain.']].map(([time,text],i)=><li key={text}><strong>{String(i+1).padStart(2,'0')}</strong><div><b>{time}</b><p>{text}</p></div></li>)}</ol></section>
  <section aria-labelledby="language-advice"><h2 id="language-advice" className="font-display text-2xl">De petits déclics pour progresser.</h2><div className="language-advice">{[guide.sections[2],guide.sections[3],guide.sections[16]].map(s=><article className="card p-5" key={s.title}><h3 className="font-display text-xl">{s.title}</h3><p className="mt-3">{s.task}</p></article>)}</div></section>
  {language==='ar' && <p className="card p-5">Le guide présente l’arabe standard moderne. Pour les échanges du quotidien dans une région précise, complète-le avec la variété dialectale correspondante et un modèle audio adapté.</p>}
 </div>
}
