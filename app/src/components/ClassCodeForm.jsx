import { useRef, useState } from 'react'
import { classCodeProblem, normalizeCode } from '../classroom.js'
import { isSignedIn, upsertProfile } from '../auth.js'

// Les deux entrées (Classe et Classement) valident avant tout enregistrement.
export default function ClassCodeForm({ onJoin, t, id }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const join = async (event) => {
    event.preventDefault()
    const cc = normalizeCode(code)
    if (pending.current || cc.length < 2) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const problem = await classCodeProblem(cc)
      if (problem) { setError(t(problem)); return }
      if (isSignedIn()) await upsertProfile({ class_code: cc })
      onJoin(cc)
    } catch {
      setError(t('classCodeCheckFailed'))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  return (
    <form onSubmit={join} aria-busy={busy}>
      <label htmlFor={id} className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-400">{t('classCodeField')}</label>
      <input id={id} value={code} onChange={(e) => { setCode(e.target.value); setError('') }}
        disabled={busy} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
        placeholder="ex : stmg-abc23" maxLength={24} autoFocus
        className="mt-1 w-full rounded-xl border border-[color-mix(in_srgb,var(--c-accent)_30%,transparent)] bg-transparent px-3 py-2.5 text-base outline-none focus:border-[var(--c-accent)]" />
      <button type="submit" disabled={busy || normalizeCode(code).length < 2} className="btn-primary mt-4 w-full">{busy ? t('pleaseWait') : t('joinBtn')}</button>
      {error && <p id={`${id}-error`} role="alert" className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  )
}
