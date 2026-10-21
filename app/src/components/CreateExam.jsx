import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { examMessages } from '../i18n/examens.js'
import { DURATIONS, examCatalog, examReady, requestExam, toCourses, draftKey, readDraft, secondsLeft } from '../data/examenPersonnalise.js'
import './CreateExam.css'
const clock = s => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
export default function CreateExam({ onOpenChange }) {
  const { state } = useStore()
  const owner = state.account?.id
  return <Creator key={owner || 'guest'} owner={owner} lang={state.lang || 'fr'} onOpenChange={onOpenChange} />
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
  const [confirm, setConfirm] = useState(false)
  const [replace, setReplace] = useState(false)
  const [now, setNow] = useState(Date.now)
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
  const left = draft ? secondsLeft(draft, now) : 0
  useEffect(() => {
    if (!draft?.startedAt || draft.submittedAt) return
    const tick = () => {
      const time = Date.now(); setNow(time)
      if (secondsLeft(draft, time) === 0) setDraft(d => d?.submittedAt ? d : { ...d, submittedAt: time, expired: true })
    }
    tick()
    const id = setInterval(tick, 1000)
    window.addEventListener('focus', tick)
    return () => { clearInterval(id); window.removeEventListener('focus', tick) }
  }, [draft?.startedAt, draft?.submittedAt])
  useEffect(() => {
    if (!draft?.startedAt || draft.submittedAt) return
    const warn = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [draft?.startedAt, draft?.submittedAt])
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
    setDraft(null); setReplace(false); setConfirm(false); setError('')
  }
  if (draft) {
    const done = !!draft.submittedAt
    const active = !!draft.startedAt && !done
    return <section className="exam-creator space-y-4" aria-label={m.title}>
      <div className="exam-toolbar card sticky top-24 z-20 flex flex-wrap items-center justify-between gap-3 p-3">
        <span className="text-sm font-semibold">{done ? m.completed : active ? `${m.remaining} · ${clock(left)}` : m.ready}</span>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => window.print()}>{m.print}</button>
          {active && <button className="btn-gold" onClick={() => setConfirm(true)}>{m.submit}</button>}
          {!active && <button className="btn-ghost" onClick={() => setReplace(true)}>{m.restart}</button>}
        </div>
      </div>
      <p role="status" className={`exam-no-print text-sm ${saveError ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300'}`}>{saveError ? m.saveError : m.local}</p>
      {draft.expired && <p className="card p-3 text-sm" role="status">{m.timed}</p>}
      {replace && <div className="card space-y-3 p-5" role="group" aria-label={m.discard}>
        <h3 className="font-semibold">{m.discard}</h3><p className="text-sm">{m.discardHelp}</p>
        <button className="btn-gold" onClick={reset}>{m.yes}</button>{' '}<button className="btn-ghost" onClick={() => setReplace(false)}>{m.no}</button>
      </div>}
      {confirm && active && <div className="card space-y-3 p-5" role="group" aria-label={m.confirm}>
        <p>{m.missing}</p><button className="btn-gold" onClick={() => { setDraft(d => ({ ...d, submittedAt: Date.now() })); setConfirm(false) }}>{m.confirm}</button>{' '}<button className="btn-ghost" onClick={() => setConfirm(false)}>{m.cancel}</button>
      </div>}
      <article className="exam-sheet rounded-2xl border border-slate-200 bg-white px-5 py-8 text-slate-900 shadow-sm sm:px-10" lang="fr" dir="ltr">
        <header className="border-b-2 border-slate-900 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">RévizSTMG · {m.title}</p>
          <h2 className="mt-4 font-display text-3xl font-semibold">{draft.exam.title}</h2>
          <div className="mt-4 flex justify-between text-sm"><span>{draft.duration} {m.min}</span><span>20 {m.points}</span></div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{draft.exam.instructions}</p>
          <p className="mt-3 text-xs">{m.notice}</p>
        </header>
        {!draft.startedAt && <div className="exam-no-print my-5 rounded-xl bg-amber-50 p-5">
          <p className="text-sm">{m.planned}</p><button className="btn-gold mt-3" onClick={() => { setNow(Date.now()); setDraft(d => ({ ...d, startedAt: Date.now() })) }}>{m.start}</button>
        </div>}
        {draft.exam.documents.map(d => <section key={d.id} className="mt-7 break-inside-avoid"><h3 className="font-semibold">{d.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{d.text}</p></section>)}
        <ol className="mt-8 space-y-8">
          {draft.exam.questions.map((q, i) => <li key={q.id} className="exam-question">
            <div className="flex items-start justify-between gap-4"><h3 className="whitespace-pre-wrap font-semibold">{i + 1}. {q.enonce}</h3><span className="shrink-0 text-sm">{q.points} / 20</span></div>
            {!!q.documentIds.length && <p className="mt-1 text-xs text-slate-600">{q.documentIds.map(id => draft.exam.documents.find(d => d.id === id)?.title).join(' · ')}</p>}
            {active && <div className="exam-no-print mt-3 text-sm"><label htmlFor={`exam-answer-${q.id}`}>{m.answer} {i + 1}</label><textarea id={`exam-answer-${q.id}`} value={draft.answers[q.id] || ''} maxLength={16000} rows={7} onChange={e => {
              const value = e.target.value
              setDraft(d => secondsLeft(d) === 0 ? { ...d, submittedAt: Date.now(), expired: true } : { ...d, answers: { ...d.answers, [q.id]: value } })
            }} className="mt-2 w-full rounded-xl border border-slate-400 bg-white p-3 text-base leading-relaxed text-slate-900" /></div>}
            <div className={active ? 'exam-print-only whitespace-pre-wrap' : 'mt-3 min-h-24 whitespace-pre-wrap rounded-lg border border-slate-200 p-3 text-sm'}>{draft.answers[q.id] || '\n\n\n\n'}</div>
            {done && <div className="mt-3 rounded-xl bg-slate-100 p-4 text-sm leading-relaxed">
              <h4 className="font-bold">{m.correction}</h4><p className="mt-2 whitespace-pre-wrap">{q.correction}</p>
              <h4 className="mt-3 font-semibold">{m.criteria}</h4><ul className="mt-1 list-disc space-y-1 pl-5">{q.criteria.map((c, n) => <li key={n}>{c}</li>)}</ul>
            </div>}
          </li>)}
        </ol>
        {done && <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm">{m.review}</p>}
        <footer className="mt-8 border-t border-slate-300 pt-4 text-xs"><h3 className="font-bold">{m.sources}</h3><ul className="mt-2 space-y-1">{draft.courses.map(c => <li key={c.id}>{c.subject} · {c.level === 'premiere' ? 'Première' : 'Terminale'} · {c.title}{done && <Link className="exam-no-print ml-2 underline" to={`/subject/${c.subjectId}/theme/${c.themeId}/chapter/${c.idx}`}>{m.seeCourse}</Link>}</li>)}</ul></footer>
      </article>
    </section>
  }
  return <section className="card card-lux space-y-5 p-5 sm:p-7" aria-label={m.title}>
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
  </section>
}
