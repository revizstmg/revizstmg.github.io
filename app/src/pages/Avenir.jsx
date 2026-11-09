import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {subjectsForTrack} from '../data/tracks.js'
import {lireNote,formaterNote} from '../notesClasse.js'
import { useStore } from '../store.jsx'
import { TextePublic } from '../localisation/PublicText.jsx'
import { ETAPES, ECHELLE, TOTAL, SOURCES, nettoyerReponses, bilanAvenir, conseilsContexte,notesPourAvenir,MATIERES_DOMAINES } from '../data/avenir.js'
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
 const matieres=subjectsForTrack(state.track).filter(m=>Object.values(MATIERES_DOMAINES).some(ids=>ids.includes(m.id.replace(/^p1-/,''))))
 const allowed=matieres.map(m=>m.id)
 const autoNotes=notesPourAvenir(state.notesClasse,{},allowed)
 const notes=notesPourAvenir(state.notesClasse,saved.grades||{},allowed)
 const useNotes=saved.useGrades!==false
 const results=bilanAvenir(answers,useNotes?notes:{}),pistes=results.filter(d=>d.explorable).slice(0,3)
 return <article className="avenir space-y-6">
  <header className="avenir-hero">
   <p className="avenir-kicker"><TextePublic text={"Après le bac"}/></p><h1 ref={heading} tabIndex={-1}><TextePublic text={"Parcours Avenir"}/></h1>
   <p><TextePublic text={"Des pistes qui te ressemblent. Un prochain pas concret."}/></p>
   <div className="avenir-facts"><span>{TOTAL} <TextePublic text={"questions"}/></span><span>{ETAPES.length} <TextePublic text={"étapes"}/></span><span><TextePublic text={"À ton rythme"}/></span></div>
  </header>
  {view!=='questions'&&<details className="card p-5 no-print"><summary><TextePublic text="Mes notes (facultatif)"/></summary>
   <p><TextePublic text="Les intérêts restent prioritaires. Les notes ajustent seulement les pistes proches, sans exclure un domaine. Elles ne prédisent pas une admission."/></p>
   <label className="flex gap-3 my-3"><input type="checkbox" checked={useNotes} onChange={e=>change({useGrades:e.target.checked})}/><span><TextePublic text="Prendre mes notes en compte"/></span></label>
   <p className="text-sm"><TextePublic text="Le site propose la moyenne simple des cinq dernières notes saisies par matière dans ton niveau actuel. Tu peux la remplacer par ta moyenne de bulletin. Vide un champ pour ignorer cette matière."/></p>
   <button type="button" className="btn-ghost my-3" disabled={!Object.keys(saved.grades||{}).length} onClick={()=>change({grades:{}})}><TextePublic text="Reprendre les notes du site"/></button>
   <div className="avenir-grades">{matieres.map(m=>{const id=m.id.replace(/^p1-/,''),value=Object.hasOwn(saved.grades||{},id)?saved.grades[id]:autoNotes[id]??'',invalid=String(value)!==''&&lireNote(value)===null;return <div key={id}><label htmlFor={'avenir-grade-'+id}><TextePublic text={m.name}/> /20</label><input id={'avenir-grade-'+id} type="text" inputMode="decimal" maxLength={5} value={String(value).replace('.',',')} aria-invalid={invalid||undefined} aria-describedby={invalid?'avenir-grade-error-'+id:undefined} disabled={!useNotes} onChange={e=>change({grades:{...(saved.grades||{}),[id]:e.target.value}})}/>{invalid&&<p id={'avenir-grade-error-'+id} className="text-sm text-red-700 dark:text-red-300"><TextePublic text="Indique une note de 0 à 20, ou laisse le champ vide."/></p>}</div>})}</div>
  </details>}
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
    {useNotes&&Object.keys(notes).length>0&&<p><TextePublic text="Avec les notes activées, la moyenne des matières liées à chaque domaine ajoute ou retire au maximum 0,2 point au score d’intérêt, calculé de 0 à 4. Sans note pertinente, l’indice reste inchangé."/></p>}
    {!pistes.length&&<p className="mt-4"><TextePublic text={"Aucune piste ne se détache suffisamment. Ce n’est pas un échec : découvre les domaines ci-dessous, échange avec un conseiller puis reprends le questionnaire après une rencontre ou une immersion."}/></p>}
   </section>
   <div className="avenir-results">{pistes.map(d=><section className="card p-5" key={d.id}><h2><TextePublic text={d.title}/></h2><p><TextePublic text={d.intro}/></p><h3><TextePublic text={"Ce qui t’attire"}/></h3><ul>{d.positifs.slice(0,3).map(s=><li key={s}><TextePublic text={s}/></li>)}</ul><h3><TextePublic text={"Formations à comparer"}/></h3><ul>{d.formations.map(s=><li key={s}>{s}</li>)}</ul><h3><TextePublic text={"Exemples de métiers"}/></h3><ul>{d.metiers.map(s=><li key={s}><TextePublic text={s}/></li>)}</ul>{d.notes.length>0&&<><h3><TextePublic text="Repères scolaires"/></h3><ul>{d.notes.map(n=><li key={n.id}><TextePublic text={matieres.find(m=>m.id.replace(/^p1-/,'')===n.id)?.name||n.id}/> : {formaterNote(n.note,state.lang)}/20</li>)}</ul><p><TextePublic text={d.notes.some(n=>n.note<10)?'Certaines bases méritent un accompagnement. Demande les attendus et les aides disponibles : cette piste reste à explorer.':'Appuie-toi sur ces résultats pour comparer les attendus et préparer tes questions lors des portes ouvertes.'}/></p></>}
<h3><TextePublic text={"À vérifier"}/></h3><p><TextePublic text={d.vigilance}/></p></section>)}</div>
   <details className="card p-5"><summary><TextePublic text={"Tous mes domaines"}/></summary><p><TextePublic text={"Ces repères décrivent tes envies déclarées, pas un niveau scolaire ni une probabilité de réussite."}/></p>{results.map(d=><div className="avenir-domain" key={d.id}><h3><TextePublic text={d.title}/></h3><p>{d.positifs.length}/6 <TextePublic text={"envies positives"}/> · {6-d.known}/6 <TextePublic text={"à découvrir"}/></p><p><TextePublic text={d.intro}/></p><ul>{d.formations.map(s=><li key={s}>{s}</li>)}</ul></div>)}</details>
   <section className="card p-6"><h2><TextePublic text={"Mes conditions d’études"}/></h2><dl>{ETAPES.at(-1).questions.map(q=><div className="avenir-context" key={q.id}><dt><TextePublic text={q.label}/></dt><dd><TextePublic text={q.options[answers[q.id]]||'À préciser'}/></dd></div>)}</dl><ul>{conseilsContexte(answers).map(t=><li key={t}><TextePublic text={t}/></li>)}</ul></section>
   <section className="card p-6"><h2><TextePublic text={"Mon prochain pas"}/></h2><ol><li><TextePublic text={"Choisis trois formations sur Parcoursup et compare les attendus, le programme, les frais et les critères d’examen des candidatures."}/></li><li><TextePublic text={"Prépare une rencontre : « Quel travail personnel faut-il ? Quels stages ? Quel accompagnement ? Quelles poursuites d’études ? »"}/></li><li><TextePublic text={"Montre ce bilan à ton professeur principal ou à un PsyEN. Demande une journée portes ouvertes ou une immersion."}/></li></ol><p><TextePublic text={"BTS : généralement 2 ans. BUT et licence : généralement 3 ans. Les formations citées sont des pistes, pas une admission garantie. Certains métiers demandent une poursuite d’études ou de l’expérience."}/></p></section>
   <div className="avenir-actions no-print"><button className="btn-primary" onClick={()=>window.print()}><TextePublic text={"Imprimer mon bilan"}/></button><button className="btn-ghost" onClick={()=>{setView('questions');move(0)}}><TextePublic text={"Modifier mes réponses"}/></button></div>
  </>}
  <footer className="card p-5"><h2><TextePublic text={"Vérifier les pistes"}/></h2><p><TextePublic text={"Consulte les programmes et conditions d’admission de l’année de ta candidature. Les sources officielles restent la référence."}/></p><ul>{SOURCES.map(([label,href])=><li key={href}><a className="underline" href={href} target="_blank" rel="noopener noreferrer"><TextePublic text={label}/> ↗</a></li>)}</ul><Link className="underline" to="/cours"><TextePublic text={"Retour aux cours"}/></Link></footer>
  {count>0&&<div className="no-print">{reset?<div role="group" aria-label="Effacer le questionnaire"><p><TextePublic text={"Effacer uniquement tes réponses et ton bilan Parcours Avenir ?"}/></p><button className="btn-ghost" onClick={()=>{setParcours(p=>({...p,avenir:{answers:{},step:0,finished:false,maj:Date.now()}}));setView('intro');setStep(0);setReset(false);focus()}}><TextePublic text={"Confirmer l’effacement"}/></button><button className="btn-ghost" onClick={()=>setReset(false)}><TextePublic text={"Annuler"}/></button></div>:<button className="underline text-sm" onClick={()=>setReset(true)}><TextePublic text={"Effacer mon questionnaire"}/></button>}</div>}
 </article>
}
