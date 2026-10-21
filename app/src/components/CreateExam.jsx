import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { examMessages } from '../i18n/examens.js'
import { DURATIONS, examCatalog, examReady, requestExam, toCourses, draftKey, readDraft } from '../data/examenPersonnalise.js'
export default function CreateExam({ onOpenChange }) {
  const { state } = useStore()
  const owner = state.account?.id
  return <Creator key={owner || 'guest'} owner={owner} lang={state.lang || 'fr'} onOpenChange={onOpenChange} />
}
// Même couverture papier et même carte que les sujets de la collection officielle.
function ExamCard({ title, duration, min, children }) {
  return <section className="bac-subject bac-creator" aria-label={title}>
    <div className="bac-preview" aria-hidden="true">
      <span className="bac-preview-number">03</span>
      <div className="bac-paper"><span className="bac-paper-small">RÉVIZSTMG</span><span className="bac-paper-rule" /><strong>{title}</strong><span className="bac-paper-duration">{duration} {min}</span><span className="bac-paper-rule" /><span className="bac-paper-lines" /></div>
      <span className="bac-pdf-stamp">PDF</span>
    </div>
    <div className="bac-subject-body space-y-5">{children}</div>
  </section>
}
function Creator({ owner, lang, onOpenChange }) {
  const m = examMessages[lang] || examMessages.fr
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(120)
  const [available, setAvailable] = useState(null)
  const [check, setCheck] = useState(0)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [draft, setDraft] = useState(() => readDraft(owner))
  const [saveError, setSaveError] = useState(false)
  const [replace, setReplace] = useState(false)
  const abort = useRef(null)
  const locked = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; abort.current?.abort() } }, [])
  useEffect(() => {
    const ac = new AbortController()
    setAvailable(null)
    examReady(ac.signal).then(setAvailable, () => { if (!ac.signal.aborted) setAvailable(false) })
    return () => ac.abort()
  }, [check])
  useEffect(() => {
    if (!draft || !owner) return
    try { localStorage.setItem(draftKey(owner), JSON.stringify(draft)); setSaveError(false) } catch { setSaveError(true) }
  }, [draft, owner])
  useEffect(() => { onOpenChange?.(!!draft) }, [!!draft, onOpenChange])
  const failure = e => {
    const key = e.message
    setError(key === 'out_of_scope' ? m.out : key === 'rate_limit' ? m.limit : key === 'login_required' ? m.session : key === 'not_configured' ? m.unavailable : key === 'invalid_response' ? m.invalid : ['too_large', 'invalid_request'].includes(key) ? m.tooLarge : m.error)
  }
  const run = async action => {
    if (locked.current) return
    if (prompt.trim().length < 15) { setError(m.empty); return }
    locked.current = true; setError(''); setBusy(action)
    const ac = new AbortController(); abort.current = ac
    const timeout = setTimeout(() => ac.abort(), 180000)
    try {
      if (action === 'plan') {
        const all = await examCatalog()
        const usable = all.filter(c => {
          const courses = toCourses([c], [c.id]); return courses[0].text.trim() && courses[0].text.length <= 30000
        })
        if (!mounted.current || ac.signal.aborted) return
        const catalog = usable.map(({ id, title, subject, level }) => ({ id, title, subject, level }))
        const result = await requestExam({ action, prompt, duration, catalog }, owner, ac.signal)
        if (mounted.current) { setCatalog(usable); setPlan(result) }
      } else {
        const courses = toCourses(catalog, plan.chapterIds)
        if (JSON.stringify(courses).length > 300000) throw new Error('too_large')
        const result = await requestExam({ action, prompt, duration, courses }, owner, ac.signal)
        if (mounted.current) { setDraft({ owner, prompt, duration, exam: result, courses: courses.map(({ text, ...c }) => ({ ...c, ...catalog.find(x => x.id === c.id), section: undefined })), answers: {}, startedAt: null, submittedAt: null }); setPlan(null) }
      }
    } catch (e) { if (mounted.current) failure(e) }
    finally { clearTimeout(timeout); locked.current = false; if (mounted.current) setBusy('') }
  }
  const reset = () => {
    try { localStorage.removeItem(draftKey(owner)) } catch { /* warning remains visible until next save */ }
    setDraft(null); setReplace(false); setError('')
  }
  const download = async correction => {
    if (busy) return
    setBusy('pdf'); setError('')
    try { const { downloadExamPdf } = await import('../data/examPdf.js'); downloadExamPdf(draft, correction) }
    catch { setError(m.error) }
    finally { setBusy('') }
  }
  if (draft) return <ExamCard title={m.title} duration={draft.duration} min={m.min}>
    <div className="flex items-start justify-between gap-4"><div><p className="kicker">PDF · RÉVIZSTMG</p><h2 className="mt-2 font-display text-3xl">{draft.exam.title}</h2><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{draft.duration} {m.min} · {draft.exam.questions.length} questions · 20 {m.points}</p></div><span aria-hidden className="text-3xl">↗</span></div>
    <p className="text-sm leading-relaxed">{m.pdfHelp}</p>
    <div className="grid gap-3 sm:grid-cols-2"><button disabled={!!busy} className="btn-gold !py-4" onClick={() => download(false)}>{m.downloadSubject}</button><button disabled={!!busy} className="btn-ghost !py-4" onClick={() => download(true)}>{m.downloadCorrection}</button></div>
    {busy === 'pdf' && <p role="status" className="text-sm">{m.pdfCreating}</p>}
    {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    <p className="text-xs text-slate-600 dark:text-slate-300">{m.notice}</p>
    <p role="status" className={`text-sm ${saveError ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300'}`}>{saveError ? m.saveError : m.local}</p>
    {replace ? <div className="space-y-3 border-t border-slate-300 pt-4" role="group" aria-label={m.discard}><p className="font-semibold">{m.discard}</p><p className="text-sm">{m.discardHelp}</p><button className="btn-gold" onClick={reset}>{m.yes}</button>{' '}<button className="btn-ghost" onClick={() => setReplace(false)}>{m.no}</button></div> : <button className="btn-ghost" onClick={() => setReplace(true)}>{m.restart}</button>}
  </ExamCard>
  return <ExamCard title={m.title} duration={duration} min={m.min}>
    <div><p className="kicker">✦ RévizSTMG</p><h2 className="mt-2 font-display text-2xl font-semibold">{m.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{m.sub}</p></div>
    <form onSubmit={e => { e.preventDefault(); run('plan') }} className="space-y-4">
      <label className="block text-sm font-semibold">{m.prompt}<textarea value={prompt} onChange={e => { setPrompt(e.target.value); setPlan(null) }} placeholder={m.placeholder} maxLength={1500} minLength={15} required rows={4} disabled={!!busy} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-base font-normal text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white" /></label>
      <fieldset disabled={!!busy}><legend className="mb-2 text-sm font-semibold">{m.duration}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{DURATIONS.map(d => <label key={d} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${duration === d ? 'border-amber-600 bg-amber-100 text-amber-950 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100' : 'border-slate-300 dark:border-slate-600'}`}><input type="radio" name="exam-duration" value={d} checked={duration === d} onChange={() => { setDuration(d); setPlan(null) }} />{d} {m.min}</label>)}</div></fieldset>
      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{m.consent} {m.french}</p>
      {!owner ? <p className="text-sm"><Link to="/moi" className="underline">{m.login}</Link></p> : available === null ? <p className="text-sm" role="status">{m.checking}</p> : !available ? <div role="status" className="rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800"><p>{m.unavailable}</p><button type="button" className="mt-2 underline" onClick={() => setCheck(x => x + 1)}>{m.retry}</button></div> : !plan && <button type="submit" disabled={!!busy} className="btn-gold w-full !py-3">{m.analyze}</button>}
    </form>
    {busy && <p role="status" aria-live="polite" className="text-sm">⏳ {busy === 'plan' ? m.analyzing : m.generating}</p>}
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">{error}</p>}
    {plan && <div className="space-y-3 rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><h3 className="font-semibold">{m.scope}</h3><p className="text-sm" lang="fr">{plan.summary}</p><ul className="max-h-64 space-y-2 overflow-y-auto text-sm" lang="fr">{plan.chapterIds.map(id => { const c = catalog.find(c => c.id === id); return <li key={id}>{c.subject} · {c.level === 'premiere' ? 'Première' : 'Terminale'} — {c.title}</li> })}</ul><button disabled={!!busy} className="btn-gold w-full" onClick={() => run('generate')}>{m.generate}</button><button disabled={!!busy} className="btn-ghost w-full" onClick={() => setPlan(null)}>{m.edit}</button></div>}
  </ExamCard>
}
