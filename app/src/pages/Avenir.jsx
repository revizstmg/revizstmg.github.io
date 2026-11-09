import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { TextePublic } from '../localisation/PublicText.jsx'
import { ETAPES, ECHELLE, TOTAL, SOURCES, nettoyerReponses, bilanAvenir, conseilsContexte } from '../data/avenir.js'
import './Avenir.css'

export default function Avenir(){
 const {state,setParcours}=useStore(),saved=state.parcours?.avenir||{}
 const answers=nettoyerReponses(saved.answers),count=Object.keys(answers).length
 const [step,setStep]=useState(()=>Number.isInteger(saved.step)?Math.max(0,Math.min(ETAPES.length-1,saved.step)):0)
 const [view,setView]=useState(saved.finished&&count===TOTAL?'bilan':'intro'),[error,setError]=useState(false),[reset,setReset]=useState(false)
 const heading=useRef(null),form=useRef(null)
 const stage=ETAPES[step]
 const focus=()=>requestAnimationFrame(()=>{heading.current?.focus();heading.current?.scrollIntoView({block:'start'})})
 const change=patch=>setParcours(p=>({...p,avenir:{...(p.avenir||{}),...patch,maj:Date.now()}}))
 const answer=(id,value)=>{change({answers:{...answers,[id]:value},finished:false});setError(false)}
 const move=next=>{setStep(next);change({step:next});setError(false);focus()}
 const next=()=>{
  if(stage.questions.some(q=>answers[q.id]===undefined)){setError(true);requestAnimationFrame(()=>form.current?.querySelector('fieldset[data-missing="true"] input')?.focus());return}
  if(step<ETAPES.length-1)move(step+1)
  else{change({finished:true});setView('bilan');focus()}
 }
 const results=bilanAvenir(answers),pistes=results.filter(d=>d.explorable).slice(0,3)
 return <article className="avenir space-y-6">
  <header className="avenir-hero">
   <p className="avenir-kicker"><TextePublic text={"Après le bac"}/></p><h1 ref={heading} tabIndex={-1}><TextePublic text={"Parcours Avenir"}/></h1>
   <p><TextePublic text={"Des pistes qui te ressemblent. Un prochain pas concret."}/></p>
   <div className="avenir-facts"><span>{TOTAL} <TextePublic text={"questions"}/></span><span>{ETAPES.length} <TextePublic text={"étapes"}/></span><span><TextePublic text={"À ton rythme"}/></span></div>
  </header>
  {view==='intro'&&<>
   <section className="card p-6"><h2><TextePublic text={"Construis ton orientation"}/></h2><p><TextePublic text={"Explore ce qui t’intéresse, puis précise tes conditions d’études. Tu peux répondre « Je ne sais pas encore » aux questions d’intérêt et reprendre plus tard."}/></p>
    <ol className="avenir-intro"><li><b>01</b><TextePublic text={"Repère tes intérêts"}/></li><li><b>02</b><TextePublic text={"Compare les formations"}/></li><li><b>03</b><TextePublic text={"Prépare tes démarches"}/></li></ol>
    <p className="text-sm"><TextePublic text={"Ce questionnaire maison n’est pas un test psychométrique validé. Il ne mesure ni tes capacités ni tes chances d’admission. Tes réponses servent à ouvrir une discussion avec ton professeur principal ou un PsyEN."}/></p>
    {count>0&&<p role="status">{count}/{TOTAL} <TextePublic text={"réponses renseignées"}/></p>}
    <button className="btn-primary mt-4" onClick={()=>{setView('questions');focus()}}><TextePublic text={count?'Reprendre mon questionnaire':'Commencer mon questionnaire'}/></button>
   </section>
   <p className="text-sm"><TextePublic text={"Les réponses suivent la sauvegarde habituelle de ton profil. Aucun service de génération n’est utilisé pour calculer ce bilan. Tu peux effacer ce questionnaire sans toucher à tes révisions."}/></p>
  </>}
  {view==='questions'&&<section className="card p-5">
   <div className="avenir-progress"><label htmlFor="avenir-progress"><TextePublic text={"Progression"}/> {count}/{TOTAL}</label><progress id="avenir-progress" value={count} max={TOTAL}/></div>
   <p className="avenir-kicker"><TextePublic text={"Étape"}/> {step+1}/{ETAPES.length}</p><h2><TextePublic text={stage.title}/></h2>
   <p className="text-sm"><TextePublic text={stage.id==='contexte'?'Ces réponses ajustent les conseils pratiques. Elles ne modifient pas tes intérêts.':'Pour chaque activité, indique si tu aurais envie de la découvrir, même si tu ne sais pas encore la réaliser.'}/></p>
   <form ref={form} onSubmit={e=>{e.preventDefault();next()}}>
    {stage.questions.map((q,i)=><fieldset key={q.id} data-missing={answers[q.id]===undefined} className="avenir-question"><legend>{i+1}. <TextePublic text={q.label}/></legend>
     <div className={q.options?'avenir-options contexte':'avenir-options'}>{(q.options?q.options.map((label,value)=>({label,value})):ECHELLE).map(o=><label key={o.value}><input type="radio" name={q.id} checked={answers[q.id]===o.value} onChange={()=>answer(q.id,o.value)}/><span><TextePublic text={o.label}/></span></label>)}</div>
    </fieldset>)}
    {error&&<p role="alert" className="text-red-700 dark:text-red-300"><TextePublic text={"Réponds à chaque question de cette étape. « Je ne sais pas encore » est une réponse possible pour les intérêts."}/></p>}
    <div className="avenir-actions"><button type="button" className="btn-ghost" onClick={()=>step?move(step-1):(setView('intro'),focus())}><TextePublic text={"Retour"}/></button><button className="btn-primary" type="submit"><TextePublic text={step===ETAPES.length-1?'Voir mon bilan':'Continuer'}/></button><button type="button" className="underline" onClick={()=>{setView('intro');focus()}}><TextePublic text={"Reprendre plus tard"}/></button></div>
   </form>
  </section>}
  {view==='bilan'&&<>
   <section className="card p-6"><p className="avenir-kicker"><TextePublic text={"Ton bilan"}/></p><h2><TextePublic text={"Des pistes à explorer"}/></h2>
    <p><TextePublic text={"Le classement utilise la moyenne de tes réponses connues, de 0 à 4. Une piste est mise en avant avec au moins quatre réponses connues et deux réponses « Plutôt oui » ou « Beaucoup ». « Je ne sais pas encore » n’est pas un refus. En cas d’égalité, explore les pistes au même niveau."}/></p>
    {!pistes.length&&<p className="mt-4"><TextePublic text={"Aucune piste ne se détache suffisamment. Ce n’est pas un échec : découvre les domaines ci-dessous, échange avec un conseiller puis reprends le questionnaire après une rencontre ou une immersion."}/></p>}
   </section>
   <div className="avenir-results">{pistes.map(d=><section className="card p-5" key={d.id}><h2><TextePublic text={d.title}/></h2><p><TextePublic text={d.intro}/></p><h3><TextePublic text={"Ce qui t’attire"}/></h3><ul>{d.positifs.slice(0,3).map(s=><li key={s}><TextePublic text={s}/></li>)}</ul><h3><TextePublic text={"Formations à comparer"}/></h3><ul>{d.formations.map(s=><li key={s}>{s}</li>)}</ul><h3><TextePublic text={"Exemples de métiers"}/></h3><ul>{d.metiers.map(s=><li key={s}><TextePublic text={s}/></li>)}</ul><h3><TextePublic text={"À vérifier"}/></h3><p><TextePublic text={d.vigilance}/></p></section>)}</div>
   <details className="card p-5"><summary><TextePublic text={"Tous mes domaines"}/></summary><p><TextePublic text={"Ces repères décrivent tes envies déclarées, pas un niveau scolaire ni une probabilité de réussite."}/></p>{results.map(d=><div className="avenir-domain" key={d.id}><h3><TextePublic text={d.title}/></h3><p>{d.positifs.length}/6 <TextePublic text={"envies positives"}/> · {6-d.known}/6 <TextePublic text={"à découvrir"}/></p><p><TextePublic text={d.intro}/></p><ul>{d.formations.map(s=><li key={s}>{s}</li>)}</ul></div>)}</details>
   <section className="card p-6"><h2><TextePublic text={"Mes conditions d’études"}/></h2><dl>{ETAPES.at(-1).questions.map(q=><div className="avenir-context" key={q.id}><dt><TextePublic text={q.label}/></dt><dd><TextePublic text={q.options[answers[q.id]]||'À préciser'}/></dd></div>)}</dl><ul>{conseilsContexte(answers).map(t=><li key={t}><TextePublic text={t}/></li>)}</ul></section>
   <section className="card p-6"><h2><TextePublic text={"Mon prochain pas"}/></h2><ol><li><TextePublic text={"Choisis trois formations sur Parcoursup et compare les attendus, le programme, les frais et les critères d’examen des candidatures."}/></li><li><TextePublic text={"Prépare une rencontre : « Quel travail personnel faut-il ? Quels stages ? Quel accompagnement ? Quelles poursuites d’études ? »"}/></li><li><TextePublic text={"Montre ce bilan à ton professeur principal ou à un PsyEN. Demande une journée portes ouvertes ou une immersion."}/></li></ol><p><TextePublic text={"BTS : généralement 2 ans. BUT et licence : généralement 3 ans. Les formations citées sont des pistes, pas une admission garantie. Certains métiers demandent une poursuite d’études ou de l’expérience."}/></p></section>
   <div className="avenir-actions no-print"><button className="btn-primary" onClick={()=>window.print()}><TextePublic text={"Imprimer mon bilan"}/></button><button className="btn-ghost" onClick={()=>{setView('questions');move(0)}}><TextePublic text={"Modifier mes réponses"}/></button></div>
  </>}
  <footer className="card p-5"><h2><TextePublic text={"Vérifier les pistes"}/></h2><p><TextePublic text={"Consulte les programmes et conditions d’admission de l’année de ta candidature. Les sources officielles restent la référence."}/></p><ul>{SOURCES.map(([label,href])=><li key={href}><a className="underline" href={href} target="_blank" rel="noopener noreferrer"><TextePublic text={label}/> ↗</a></li>)}</ul><Link className="underline" to="/cours"><TextePublic text={"Retour aux cours"}/></Link></footer>
  {count>0&&<div className="no-print">{reset?<div role="group" aria-label="Effacer le questionnaire"><p><TextePublic text={"Effacer uniquement tes réponses et ton bilan Parcours Avenir ?"}/></p><button className="btn-ghost" onClick={()=>{setParcours(p=>({...p,avenir:{answers:{},step:0,finished:false,maj:Date.now()}}));setView('intro');setStep(0);setReset(false);focus()}}><TextePublic text={"Confirmer l’effacement"}/></button><button className="btn-ghost" onClick={()=>setReset(false)}><TextePublic text={"Annuler"}/></button></div>:<button className="underline text-sm" onClick={()=>setReset(true)}><TextePublic text={"Effacer mon questionnaire"}/></button>}</div>}
 </article>
}
