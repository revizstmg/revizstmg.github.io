import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { usePublicText } from '../i18n.js'
import { CourseText } from '../components/Course.jsx'
import { formulasForTrack, buildFormulaSession, checkFormulaAnswer, displayNumber } from '../data/formulaPractice.js'

export default function FormulaWorkshop() {
  const {state}=useStore()
  if(!state.track) return <Navigate to="/" replace />
  return <Workshop key={`${state.account?.id || 'trial'}:${state.track.level}:${state.track.specialty}`} track={state.track} />
}
function Workshop({track}) {
  const tr=usePublicText()
  const formulas=formulasForTrack(track)
  const [selected,setSelected]=useState([]),[category,setCategory]=useState(''),[search,setSearch]=useState(''),[repeat,setRepeat]=useState(2)
  const [session,setSession]=useState(null),[index,setIndex]=useState(0),[answer,setAnswer]=useState(''),[feedback,setFeedback]=useState(null),[invalid,setInvalid]=useState(false),[score,setScore]=useState(0),[finished,setFinished]=useState(false)
  const chosen=formulas.filter(f=>selected.includes(f.id))
  const toggle=id=>setSelected(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id])
  const start=()=>{setSession(buildFormulaSession(chosen,chosen.length*repeat));setIndex(0);setScore(0);setFinished(false);setFeedback(null);setAnswer('');setInvalid(false)}
  const question=session?.[index]
  const visible=formulas.filter(f=>(!category || f.cat===category) && (!search || `${f.name} ${f.formula} ${tr(f.name)}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())))
  const submit=e=>{
    e.preventDefault()
    if(feedback!==null) return
    const correct=checkFormulaAnswer(answer,question.answer)
    if(correct===null){setInvalid(true);return}
    setInvalid(false);setFeedback(correct);if(correct) setScore(n=>n+1)
  }
  const next=()=>{if(index+1===session.length){setFinished(true);return}setIndex(n=>n+1);setAnswer('');setFeedback(null);setInvalid(false)}
  return <div className="space-y-6">
    <header><p className="kicker">Calcul et entraînement</p><h1 className="mt-1 font-display text-3xl font-medium">Atelier de formules</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choisis tes formules, puis entraîne-toi avec de nouvelles valeurs à chaque séance.</p></header>
    {!session ? <>
      <div className="card grid gap-3 p-4 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block font-semibold">Rechercher une formule</span><input className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:border-slate-600 dark:bg-slate-800 w-full" type="search" value={search} onChange={e=>setSearch(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-semibold">Matière</span><select className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:border-slate-600 dark:bg-slate-800 w-full" value={category} onChange={e=>setCategory(e.target.value)}><option value="">{tr('Toutes les matières')}</option>{[...new Set(formulas.map(f=>f.cat))].map(cat=><option key={cat} value={cat}>{tr(cat)}</option>)}</select></label>
      </div>
      <section className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><p><strong>{chosen.length}</strong> <span>formule(s) sélectionnée(s)</span></p><button className="btn text-xs" disabled={!chosen.length} onClick={()=>setSelected([])}>Effacer la sélection</button></div>
        <label className="flex flex-wrap items-center gap-3 text-sm"><span>Exercices par formule</span><select className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" value={repeat} onChange={e=>setRepeat(Number(e.target.value))}>{[1,2,3,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
        <p className="text-sm text-slate-500 dark:text-slate-400"><strong>{chosen.length*repeat}</strong> <span>exercice(s) au total</span></p>
        <button className="btn-gold" disabled={!chosen.length} onClick={start}>Générer mes exercices</button>
      </section>
      <fieldset><legend className="mb-3 font-display text-xl">Les formules à travailler</legend><div className="grid gap-3 sm:grid-cols-2">
        {visible.map(f=><label key={f.id} className="card flex cursor-pointer items-start gap-3 p-4" style={selected.includes(f.id)?{outline:'2px solid var(--c-accent-texte)',outlineOffset:-2}:undefined}>
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={selected.includes(f.id)} onChange={()=>toggle(f.id)} />
          <span className="min-w-0"><strong className="block text-sm"><CourseText text={f.name}/></strong><span className="mt-1 block break-words text-xs text-slate-500 dark:text-slate-400"><CourseText text={f.formula}/></span><small className="mt-2 block text-slate-500 dark:text-slate-400">{tr(f.cat)}</small></span>
        </label>)}
      </div>{!visible.length && <p className="card p-4 text-sm">Aucune formule ne correspond à ta recherche.</p>}</fieldset>

    </> : finished ? <section className="card space-y-4 p-6" aria-live="polite"><h2 className="font-display text-2xl">Séance terminée</h2><p className="text-3xl font-semibold">{score} / {session.length}</p><p>réponse(s) correcte(s) au premier essai</p><p className="text-sm text-slate-500 dark:text-slate-400">Ces exercices servent à t’entraîner et ne modifient pas la maîtrise de tes chapitres.</p><div className="flex flex-wrap gap-3"><button className="btn-gold" onClick={start}>Recommencer avec de nouvelles valeurs</button><button className="btn" onClick={()=>setSession(null)}>Changer de formules</button></div></section> : <section className="card space-y-5 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3"><p className="text-sm"><span>Exercice</span> {index+1} / {session.length}</p><button className="btn text-xs" onClick={()=>setSession(null)}>Changer de formules</button></div>
      <h2 className="font-display text-2xl"><CourseText text={question.formula.name}/></h2>
      <dl className="grid gap-2 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">{question.formula.inputs.map(p=><div key={p.symbol} className="flex flex-wrap justify-between gap-2 text-sm"><dt><CourseText text={p.label}/></dt><dd className="font-semibold">{displayNumber(question.values[p.symbol])}</dd></div>)}</dl>
      {question.formula.target && <p className="text-sm font-semibold"><CourseText text={question.formula.target}/></p>}
      <form onSubmit={submit} className="space-y-3"><label className="block text-sm font-semibold" htmlFor="formula-answer">Ton résultat</label><p id="formula-rounding" className="text-xs text-slate-500 dark:text-slate-400">Arrondis au centième si nécessaire. La virgule et le point sont acceptés.</p><div className="flex items-center gap-2"><input autoFocus id="formula-answer" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:border-slate-600 dark:bg-slate-800 min-w-0 flex-1" inputMode="decimal" value={answer} onChange={e=>{setAnswer(e.target.value);setInvalid(false)}} disabled={feedback!==null} aria-invalid={invalid} aria-describedby="formula-rounding"/><span>{question.formula.unit}</span></div>{invalid && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Saisis un nombre valide.</p>}{feedback===null && <button className="btn-gold" disabled={!answer.trim()}>Vérifier ma réponse</button>}</form>
      {feedback!==null && <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700" aria-live="polite"><p className="font-semibold">{tr(feedback ? 'Bonne réponse !' : 'Voici la correction.')}</p><p className="text-xl font-semibold">{displayNumber(question.answer)} {question.formula.unit}</p><p className="text-sm"><CourseText text={question.formula.formula}/></p>{question.formula.note && <p className="text-sm text-slate-500 dark:text-slate-400"><CourseText text={question.formula.note}/></p>}<p className="break-words font-mono text-sm">{question.calculation} = {displayNumber(question.answer)} {question.formula.unit}</p><button className="btn-gold" onClick={next}>{tr(index+1===session.length ? 'Voir mon bilan' : 'Exercice suivant')}</button></div>}
    </section>}
  </div>
}
