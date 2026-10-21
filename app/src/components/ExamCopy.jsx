import { useEffect, useRef, useState } from 'react'
import { requestExam } from '../data/examenPersonnalise.js'
import { COPY_TYPES, MAX_COPY_BYTES, MAX_COPY_FILES, checkFiles } from '../../../supabase/functions/examen-blanc/grading.js'
import { copyMessages } from '../i18n/copies.js'
const readFile = file => new Promise((resolve, reject) => {
 const reader = new FileReader()
 reader.onload = () => resolve({ mimeType: file.type, data: String(reader.result).split(',')[1] })
 reader.onerror = () => reject(new Error('invalid_files'))
 reader.readAsDataURL(file)
})
export default function ExamCopy({ draft, owner, lang, onGrade, onBusy }) {
 const m = copyMessages[lang] || copyMessages.fr
 const [files, setFiles] = useState([])
 const [consent, setConsent] = useState(false)
 const [busy, setBusy] = useState(false)
 const [error, setError] = useState('')
 const mounted = useRef(true), abort = useRef(null), locked = useRef(false)
 useEffect(() => { mounted.current = true; return () => { mounted.current = false; abort.current?.abort() } }, [])
 const update = next => { setFiles(next); setConsent(false); setError(''); onGrade(null) }
 const add = event => {
  const next = [...files, ...Array.from(event.target.files || [])]
  event.target.value = ''
  if (next.some(f => !COPY_TYPES.includes(f.type) || !f.size)) { setError(m.invalidFiles); return }
  if (next.length > MAX_COPY_FILES || next.reduce((n, f) => n + f.size, 0) > MAX_COPY_BYTES) { setError(m.tooLarge); return }
  update(next)
 }
 const move = (i, offset) => { const next = [...files]; [next[i], next[i + offset]] = [next[i + offset], next[i]]; update(next) }
 const send = async event => {
  event.preventDefault()
  if (locked.current) return
  if (!files.length || !consent) { setError(m.empty); return }
  locked.current = true; setBusy(true); onBusy(true); setError(''); onGrade(null)
  const ac = new AbortController(); abort.current = ac
  const timeout = setTimeout(() => ac.abort(), 180000)
  try {
   const attachments = checkFiles(await Promise.all(files.map(readFile)))
   if (!mounted.current || ac.signal.aborted) return
   const grade = await requestExam({ action: 'grade', prompt: draft.prompt, duration: draft.duration, courses: draft.courses.map(({ id, title, subject, level }) => ({ id, title, subject, level })), exam: draft.exam, files: attachments }, owner, ac.signal)
   if (mounted.current) { onGrade(grade); setFiles([]); setConsent(false) }
  } catch (e) {
   if (mounted.current) setError(e.message === 'invalid_files' ? m.invalidFiles : e.message === 'too_large' ? m.tooLarge : e.message === 'rate_limit' ? m.limit : e.message === 'login_required' ? m.session : e.message === 'grading_unavailable' ? m.unavailable : e.message === 'invalid_response' ? m.invalid : m.error)
  } finally {
   clearTimeout(timeout); locked.current = false
   if (mounted.current) { setBusy(false); onBusy(false) }
  }
 }
 const grade = draft.grade
 return <section className="space-y-4 border-t border-slate-300 pt-6 dark:border-slate-600" aria-label={m.title}>
  <div><p className="kicker">✦ Gemini</p><h3 className="mt-2 font-display text-2xl">{m.title}</h3><p className="mt-2 text-sm leading-relaxed">{m.help}</p></div>
  <form onSubmit={send} className="space-y-4">
   <fieldset disabled={busy} className="space-y-3"><legend className="sr-only">{m.files}</legend>
    <label className="block text-sm font-semibold">{m.files}<input type="file" multiple accept={COPY_TYPES.join(',')} onChange={add} className="mt-2 block w-full max-w-full text-sm" aria-describedby="copy-formats" /></label>
    <label className="block text-sm font-semibold">{m.photo}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={add} className="mt-2 block w-full max-w-full text-sm" /></label>
    <p id="copy-formats" className="text-xs text-slate-600 dark:text-slate-300">{m.formats}</p>
    {files.length > 0 && <ol className="space-y-2">{files.map((file, i) => <li key={`${i}-${file.name}`} className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800"><p className="break-all">{i + 1}. {file.name} · {(file.size / 1024 / 1024).toFixed(2)} Mo</p><div className="mt-2 flex flex-wrap gap-3"><button type="button" disabled={!i} className="underline disabled:opacity-40" onClick={() => move(i, -1)} aria-label={`${m.up} ${file.name}`}>{m.up}</button><button type="button" disabled={i === files.length - 1} className="underline disabled:opacity-40" onClick={() => move(i, 1)} aria-label={`${m.down} ${file.name}`}>{m.down}</button><button type="button" className="underline" onClick={() => update(files.filter((_, n) => n !== i))} aria-label={`${m.remove} ${file.name}`}>{m.remove}</button></div></li>)}</ol>}
    {files.length > 0 && <button type="button" className="text-sm underline" onClick={() => update([])}>{m.clear}</button>}
    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{m.privacy}</p>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" /><span>{m.consent}</span></label>
    <button type="submit" disabled={!files.length || !consent} className="btn-gold w-full !py-3">{m.send}</button>
   </fieldset>
  </form>
  {busy && <p role="status" className="text-sm">{m.sending}</p>}
  {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">{error}</p>}
  {grade && <div className="space-y-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800" aria-live="polite" lang="fr">
   <h4 className="font-display text-2xl">{grade.status === 'graded' ? grade.total === null ? m.partial : `${m.result} : ${grade.total.toLocaleString(lang)} / 20` : grade.status === 'unreadable' ? m.unreadable : m.mismatch}</h4>
   <p className="whitespace-pre-wrap text-sm">{grade.feedback}</p>
   {grade.questions.map((q, i) => <details key={q.id} className="rounded-xl border border-slate-300 p-3 dark:border-slate-600"><summary className="cursor-pointer font-semibold">{i + 1}. {q.status === 'unreadable' ? m.unreadableQuestion : `${q.points} / ${q.maxPoints}`}</summary><p className="mt-3 whitespace-pre-wrap text-sm">{draft.exam.questions[i].enonce}</p>{q.status === 'unanswered' && <p className="mt-2 text-sm">{m.unanswered}</p>}{q.transcription && <div className="mt-3 text-sm"><h5 className="font-semibold">{m.read}</h5><p className="mt-1 whitespace-pre-wrap">{q.transcription}</p></div>}<h5 className="mt-3 text-sm font-semibold">{m.feedback}</h5><p className="mt-1 whitespace-pre-wrap text-sm">{q.feedback}</p></details>)}
   {!!grade.advice.length && <div><h5 className="font-semibold">{m.advice}</h5><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{grade.advice.map((a, i) => <li key={i}>{a}</li>)}</ul></div>}
  </div>}
 </section>
}
