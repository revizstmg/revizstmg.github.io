import { useEffect, useState } from 'react'
import { examCatalog, toCourses } from '../data/examenPersonnalise.js'
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export default function ExamChapterPicker({ m, selected, onChange, onCatalog, disabled }) {
 const [catalog, setCatalog] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(false), [attempt, setAttempt] = useState(0)
 const [level, setLevel] = useState(''), [subject, setSubject] = useState(''), [search, setSearch] = useState('')
 useEffect(() => {
  let alive = true
  setLoading(true); setError(false)
  examCatalog().then(all => {
   const usable = all.filter(c => { const text = toCourses([c], [c.id])[0].text; return text.trim() && text.length <= 30000 })
   if (alive) { setCatalog(usable); onCatalog(usable); setLoading(false) }
  }).catch(() => { if (alive) { setError(true); setLoading(false) } })
  return () => { alive = false }
 }, [attempt, onCatalog])
 const subjects = [...new Map(catalog.filter(c => !level || c.level === level).map(c => [c.subjectId, c])).values()]
 const visible = catalog.filter(c => (!level || c.level === level) && (!subject || c.subjectId === subject) && normalize(`${c.title} ${c.subject}`).includes(normalize(search.trim())))
 const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : selected.length < 24 ? [...selected, id] : selected)
 const field = 'mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white'
 return <fieldset disabled={disabled} className="space-y-3 rounded-xl border border-slate-300 p-4 dark:border-slate-600">
  <legend className="px-1 text-sm font-semibold">{m.manual}</legend>
  <p className="text-sm">{m.manualHelp}</p>
  {loading ? <p role="status" className="text-sm">{m.chaptersLoading}</p> : error ? <div role="alert" className="text-sm"><p>{m.chaptersError}</p><button type="button" className="mt-2 underline" onClick={() => setAttempt(n => n + 1)}>{m.retry}</button></div> : <>
   <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">{m.levelLabel}<select className={field} value={level} onChange={e => { setLevel(e.target.value); setSubject('') }}><option value="">{m.allLevels}</option><option value="premiere">{m.premiere}</option><option value="terminale">{m.terminale}</option></select></label><label className="text-sm font-semibold">{m.subjectLabel}<select className={field} value={subject} onChange={e => setSubject(e.target.value)}><option value="">{m.allSubjects}</option>{subjects.map(c => <option key={c.subjectId} value={c.subjectId}>{c.subject} · {m[c.level]}</option>)}</select></label></div>
   <label className="block text-sm font-semibold">{m.chapterSearch}<input type="search" value={search} onChange={e => setSearch(e.target.value)} className={field} /></label>
   <p role="status" className="text-sm font-semibold">{selected.length} {m.selectedCount}</p>
   {selected.length === 24 && <p className="text-sm">{m.chapterLimit}</p>}
   <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-300 p-2 dark:border-slate-600">{visible.length ? visible.map(c => <label key={c.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><input type="checkbox" checked={selected.includes(c.id)} disabled={!selected.includes(c.id) && selected.length >= 24} onChange={() => toggle(c.id)} className="mt-1" /><span lang="fr">{c.subject} · {m[c.level]} — {c.title}</span></label>) : <p className="p-2 text-sm">{m.noChapters}</p>}</div>
   {selected.length > 0 && <div className="space-y-2"><ul className="space-y-1 text-xs" lang="fr">{selected.map(id => { const c = catalog.find(c => c.id === id); return c ? <li key={id}>{c.subject} · {m[c.level]} — {c.title}</li> : null })}</ul><button type="button" onClick={() => onChange([])} className="text-sm underline">{m.clearChapters}</button></div>}
  </>}
 </fieldset>
}
