import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { usePublicText } from '../i18n.js'
import { CourseText } from '../components/Course.jsx'
import { useInfoCookiesLue } from '../components/BandeauCookies.jsx'
import { readWorkshop, saveWorkshop, formulaCourse } from '../data/workshopSession.js'
import { formulasForTrack, buildFormulaSession, checkFormulaAnswer, displayNumber } from '../data/formulaPractice.js'

export default function FormulaWorkshop() {
  const {state}=useStore()
  if(!state.track) return <Navigate to="/" replace />
  return <Workshop key={`${state.account?.id || 'trial'}:${state.track.level}:${state.track.specialty}`} track={state.track} scope={`${state.account?.id || 'trial'}:${state.track.level}:${state.track.specialty || ''}`} />
}
function Workshop({track, scope}) {
  const tr=usePublicText()
  const [programme,setProgramme]=useState('all')
  const formulas=formulasForTrack(track, programme==='all')
  const [initial] = useState(() => readWorkshop(scope))
  const cookiesLues = useInfoCookiesLue()
  const [selected,setSelected]=useState(initial?.selected || []),[category,setCategory]=useState(''),[group,setGroup]=useState(''),[search,setSearch]=useState(''),[repeat,setRepeat]=useState(initial?.repeat || 2)
  const [session,setSession]=useState(initial?.session || null),[index,setIndex]=useState(initial?.index || 0),[answer,setAnswer]=useState(initial?.answer || ''),[feedback,setFeedback]=useState(initial?.feedback ?? null),[invalid,setInvalid]=useState(false),[finished,setFinished]=useState(initial?.finished || false)
  const [results,setResults]=useState(initial?.results || []),[hint,setHint]=useState(false),[paused,setPaused]=useState(!!initial?.session && !initial?.finished),[storageError,setStorageError]=useState(false)
  const score=results.filter(r=>r.correct).length
  useEffect(()=>{setStorageError(!saveWorkshop(scope,{selected,repeat,session,index,feedback,finished,results,answer}))},[scope,selected,repeat,session,index,feedback,finished,results,answer])
  const chosen=formulas.filter(f=>selected.includes(f.id))
  const sessionFormulas=formulas.filter(f=>session?.some(q=>q.formula.id===f.id))
  const toggle=id=>setSelected(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id])
  const begin=(fs)=>{setSession(buildFormulaSession(fs,fs.length*repeat));setIndex(0);setResults([]);setFinished(false);setFeedback(null);setAnswer('');setInvalid(false);setHint(false);setPaused(false)}
  const start=()=>begin(chosen)
  const question=session?.[index]
  const visible=formulas.filter(f=>(!category || f.cat===category) && (!group || f.group===group) && (!search || `${f.name} ${f.formula} ${f.group} ${tr(f.name)}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())))
  const submit=e=>{
    e.preventDefault()
    if(feedback!==null) return
    const correct=checkFormulaAnswer(answer,question.answer,question.formula.decimals || 2)
    if(correct===null){setInvalid(true);return}
    setInvalid(false);setFeedback(correct);if(!results[index]) setResults(rs=>[...rs,{formulaId:question.formula.id,correct}])
  }
  const next=()=>{if(index+1===session.length){setFinished(true);return}setIndex(n=>n+1);setAnswer('');setFeedback(null);setInvalid(false);setHint(false)}
  const errors=[...new Set(results.filter(r=>!r.correct).map(r=>r.formulaId))]
  return <div className={`space-y-6 ${!session ? 'pb-32' : ''}`}>
    <header className="page-hero"><p className="kicker">Calcul et entraînement</p><h1 className="mt-1 font-display text-3xl font-medium">Atelier de formules</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choisis tes formules, puis entraîne-toi avec de nouvelles valeurs à chaque séance.</p></header>
    {storageError && <p role="alert" className="card p-3 text-sm">La séance ne peut pas être conservée sur cet appareil. Garde cette page ouverte pour continuer.</p>}
    {paused ? <section className="card space-y-4 p-5"><h2 className="font-display text-xl">Une séance t’attend</h2><p>Reprends avec les mêmes questions et tes réponses déjà enregistrées sur cet appareil.</p><div className="flex flex-wrap gap-3"><button className="btn-gold" onClick={()=>setPaused(false)}>Reprendre ma séance</button><button className="btn" onClick={()=>{setSession(null);setResults([]);setFeedback(null);setPaused(false)}}>Choisir une nouvelle séance</button></div></section> : !session ? <>
      <div className="card grid gap-3 p-4 sm:grid-cols-2">
        <label className="text-sm"><span className="mb-1 block font-semibold">{tr('Programme affiché')}</span><select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" value={programme} onChange={e=>{setProgramme(e.target.value);setCategory('');setGroup('')}}><option value="all">{tr('Toute la Première et Terminale STMG')}</option><option value="track">{tr('Ma classe et ma spécialité')}</option></select></label>
        <label className="text-sm"><span className="mb-1 block font-semibold">{tr('Domaine de calcul')}</span><select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" value={group} onChange={e=>setGroup(e.target.value)}><option value="">{tr('Tous les domaines')}</option>{[...new Set(formulas.filter(f=>!category || f.cat===category).map(f=>f.group))].map(g=><option key={g} value={g}>{tr(g)}</option>)}</select></label>
        <label className="text-sm"><span className="mb-1 block font-semibold">Rechercher une formule</span><input className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:border-slate-600 dark:bg-slate-800 w-full" type="search" value={search} onChange={e=>setSearch(e.target.value)} /></label>
        <label className="text-sm"><span className="mb-1 block font-semibold">Matière</span><select className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:border-slate-600 dark:bg-slate-800 w-full" value={category} onChange={e=>{setCategory(e.target.value);setGroup('')}}><option value="">{tr('Toutes les matières')}</option>{[...new Set(formulas.map(f=>f.cat))].map(cat=><option key={cat} value={cat}>{tr(cat)}</option>)}</select></label>
      </div>
      <section className="card space-y-4 p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">{tr('{visible} / {total} formules disponibles dans ce programme.',{visible:visible.length,total:formulas.length})}</p>
        <div className="flex flex-wrap items-center justify-between gap-2"><button className="btn text-xs" disabled={!visible.length} onClick={()=>setSelected(ids=>[...new Set([...ids,...visible.map(f=>f.id)])])}>{tr('Sélectionner les formules affichées')}</button><p><strong>{chosen.length}</strong> <span>formule(s) sélectionnée(s)</span></p><button className="btn text-xs" disabled={!chosen.length} onClick={()=>setSelected([])}>Effacer la sélection</button></div>
        <label className="flex flex-wrap items-center gap-3 text-sm"><span>Exercices par formule</span><select className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" value={repeat} onChange={e=>setRepeat(Number(e.target.value))}>{[1,2,3,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
        <p className="text-sm text-slate-500 dark:text-slate-400"><strong>{chosen.length*repeat}</strong> <span>exercice(s) au total</span></p>

      </section>
      <fieldset><legend className="mb-3 font-display text-xl">Les formules à travailler</legend><div className="grid gap-3 sm:grid-cols-2">
        {visible.map(f=><label key={f.id} className="card flex cursor-pointer items-start gap-3 p-4" style={selected.includes(f.id)?{outline:'2px solid var(--c-accent-texte)',outlineOffset:-2}:undefined}>
          <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={selected.includes(f.id)} onChange={()=>toggle(f.id)} />
          <span className="min-w-0"><strong className="block text-sm"><CourseText text={f.name}/></strong><span className="mt-1 block break-words text-xs text-slate-500 dark:text-slate-400"><CourseText text={f.formula}/></span><small className="mt-2 block text-slate-500 dark:text-slate-400">{tr(f.cat)} · <CourseText text={f.group}/><span className="mt-1 block">{tr(f.terminale ? 'Terminale' : 'Première et Terminale')}</span>{f.target && <span className="mt-1 block"><CourseText text={f.target}/></span>}</small></span>
        </label>)}
      </div>{!visible.length && <p className="card p-4 text-sm">Aucune formule ne correspond à ta recherche.</p>}</fieldset>

      <div className="fixed inset-x-3 z-30 mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-2xl border border-amber-700/30 p-3 shadow-xl" style={{background:'var(--c-card)',bottom:`calc(env(safe-area-inset-bottom) + ${cookiesLues ? '5rem' : '9rem'})`}} aria-label="Lancer les exercices">
        <p className="text-sm"><strong>{chosen.length}</strong> <span>formule(s)</span><span className="block text-xs text-slate-500 dark:text-slate-400">{chosen.length*repeat} <span>exercice(s)</span></span></p>
        <button className="btn-gold !min-h-11 disabled:opacity-50" disabled={!chosen.length} onClick={start}>Générer mes exercices</button>
      </div>
    </> : finished ? <section className="card space-y-4 p-6" aria-live="polite"><h2 className="font-display text-2xl">Séance terminée</h2><p className="text-3xl font-semibold">{score} / {session.length}</p><p>réponse(s) correcte(s) au premier essai</p><p className="text-sm text-slate-500 dark:text-slate-400">Ces exercices servent à t’entraîner et ne modifient pas la maîtrise de tes chapitres.</p><div className="space-y-2">{sessionFormulas.map(f=>{const rs=results.filter(r=>r.formulaId===f.id);return <div key={f.id} className="flex items-center justify-between gap-3 text-sm"><CourseText text={f.name}/><span>{rs.filter(r=>r.correct).length} / {rs.length}</span></div>})}</div><div className="flex flex-wrap gap-3">{errors.length>0 && <button className="btn-gold" onClick={()=>begin(formulas.filter(f=>errors.includes(f.id)))}>Refaire mes erreurs</button>}<button className="btn-gold" onClick={()=>begin(sessionFormulas)}>Recommencer avec de nouvelles valeurs</button><button className="btn" onClick={()=>setSession(null)}>Changer de formules</button></div></section> : <section className="card space-y-5 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3"><p className="text-sm"><span>Exercice</span> {index+1} / {session.length}</p><button className="btn text-xs" onClick={()=>setSession(null)}>Changer de formules</button></div>
      <h2 className="font-display text-2xl"><CourseText text={question.formula.name}/></h2>
      <dl className="grid gap-2 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">{question.formula.inputs.map(p=><div key={p.symbol} className="flex flex-wrap justify-between gap-2 text-sm"><dt><CourseText text={p.label}/></dt><dd className="font-semibold">{displayNumber(question.values[p.symbol])}</dd></div>)}</dl>
      {question.formula.target && <p className="text-sm font-semibold"><CourseText text={question.formula.target}/></p>}
      <div className="flex flex-wrap gap-3 text-sm"><button className="btn underline" aria-expanded={hint} onClick={()=>setHint(v=>!v)}>Un indice</button><Link className="btn underline" to={formulaCourse(question.formula,track)}>Revoir le cours</Link></div>
      {hint && <aside className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"><CourseText text={question.formula.formula}/>{question.formula.note && <p><CourseText text={question.formula.note}/></p>}</aside>}
      <form onSubmit={submit} className="space-y-3"><label className="block text-sm font-semibold" htmlFor="formula-answer">Ton résultat</label><p id="formula-rounding" className="text-xs text-slate-500 dark:text-slate-400">{tr(question.formula.decimals===4 ? 'Arrondis à quatre décimales si nécessaire. La virgule et le point sont acceptés.' : 'Arrondis au centième si nécessaire. La virgule et le point sont acceptés.')}</p><div className="flex items-center gap-2"><input autoFocus id="formula-answer" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-700 dark:border-slate-600 dark:bg-slate-800 min-w-0 flex-1" inputMode="decimal" value={answer} onChange={e=>{setAnswer(e.target.value);setInvalid(false)}} disabled={feedback!==null} aria-invalid={invalid} aria-describedby="formula-rounding"/><span>{question.formula.unit}</span></div>{invalid && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Saisis un nombre valide.</p>}{feedback===null && <button className="btn-gold" disabled={!answer.trim()}>Vérifier ma réponse</button>}</form>
      {feedback!==null && <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700" aria-live="polite"><p className="font-semibold">{tr(feedback ? 'Bonne réponse !' : 'Voici la correction.')}</p><p className="text-xl font-semibold">{displayNumber(question.answer,question.formula.decimals || 2)} {question.formula.unit}</p><p className="text-sm"><CourseText text={question.formula.formula}/></p>{question.formula.note && <p className="text-sm text-slate-500 dark:text-slate-400"><CourseText text={question.formula.note}/></p>}<p className="break-words font-mono text-sm">{question.calculation} = {displayNumber(question.answer,question.formula.decimals || 2)} {question.formula.unit}</p>{feedback===false && <button className="btn" onClick={()=>{setFeedback(null);setAnswer('')}}>Réessayer sans changer les valeurs</button>}<button className="btn-gold" onClick={next}>{tr(index+1===session.length ? 'Voir mon bilan' : 'Exercice suivant')}</button></div>}
    </section>}
  </div>
}
