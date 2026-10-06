import { useMemo, useState } from 'react'
import { FORMULAS } from '../data/formulas.js'
import { useT } from '../i18n.js'

export default function Formulas() {
  const t = useT()
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const cats = useMemo(() => FORMULAS.map((c) => ({
    ...c,
    items: c.items.filter((it) => !query || it.name.toLowerCase().includes(query) || it.f.toLowerCase().includes(query)),
  })).filter((c) => c.items.length), [query])

  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="text-center">
        <p className="kicker">📐 {t('formulasTitle')}</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{t('formulasTitle')}</h1>
        <span className="mx-auto mt-3 block h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,transparent,#c8a24e,transparent)' }} />
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('searchFormula')}
        className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none dark:border-slate-700"
      />

      {cats.map((c) => (
        <section key={c.cat} className="space-y-2">
          <h2 className="px-1 font-display text-lg font-semibold texte-matiere" style={{ '--mc': c.color }}>{c.icon} {c.cat}</h2>
          <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
            {c.items.map((it) => (
              <div key={it.name} className="flex flex-col gap-0.5 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-sm font-semibold">{it.name}{it.note ? <span className="ml-1 text-xs font-normal text-slate-400">({it.note})</span> : null}</span>
                <span className="font-mono text-sm text-slate-600 dark:text-slate-300">{it.f}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
      {cats.length === 0 && <p className="card p-5 text-center text-sm text-slate-500 dark:text-slate-400">{t('noResult')}</p>}
    </div>
  )
}
