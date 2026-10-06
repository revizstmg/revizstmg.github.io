import { useMemo, useState } from 'react'
import { FORMULAS } from '../data/formulas.js'
import { useT } from '../i18n.js'

const TOTAL = FORMULAS.reduce((n, c) => n + c.parts.reduce((m, p) => m + p.items.length, 0), 0)

// Une formule correspond à la recherche par son nom, son écriture ou sa note.
function correspond(it, query) {
  return !query || [it.name, it.f, it.note].some((s) => s && s.toLowerCase().includes(query))
}

export default function Formulas() {
  const t = useT()
  const [q, setQ] = useState('')
  const [matiere, setMatiere] = useState('')
  const query = q.trim().toLowerCase()
  const cats = useMemo(() => FORMULAS
    .filter((c) => !matiere || c.cat === matiere)
    .map((c) => ({
      ...c,
      parts: c.parts
        .map((p) => ({ ...p, items: p.items.filter((it) => correspond(it, query)) }))
        .filter((p) => p.items.length),
    }))
    .filter((c) => c.parts.length), [query, matiere])

  const puce = (actif) => `rounded-full px-3 py-1.5 text-xs font-semibold transition ${actif ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`

  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="text-center">
        <p className="kicker">📐 {t('formulasTitle')}</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{t('formulasTitle')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('formulasCount').replace('{n}', TOTAL)}</p>
        <span className="mx-auto mt-3 block h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,transparent,#c8a24e,transparent)' }} />
      </header>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('searchFormula')}
        aria-label={t('searchFormula')}
        className="w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-sm outline-none dark:border-slate-700"
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label={t('formulasFilter')}>
        <button type="button" onClick={() => setMatiere('')} aria-pressed={!matiere} className={puce(!matiere)}
          style={!matiere ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
          {t('formulasAll')}
        </button>
        {FORMULAS.map((c) => (
          <button key={c.cat} type="button" onClick={() => setMatiere(matiere === c.cat ? '' : c.cat)} aria-pressed={matiere === c.cat}
            className={puce(matiere === c.cat)} style={matiere === c.cat ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
            {c.icon} {c.cat}
          </button>
        ))}
      </div>

      {cats.map((c) => (
        <section key={c.cat} className="space-y-3">
          <h2 className="px-1 font-display text-lg font-semibold texte-matiere" style={{ '--mc': c.color }}>{c.icon} {c.cat}</h2>
          {c.parts.map((p) => (
            <div key={p.title} className="space-y-1.5">
              <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{p.title}</h3>
              <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
                {p.items.map((it) => (
                  <div key={it.name} className="grid gap-0.5 p-3.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center sm:gap-x-4">
                    <span className="text-sm font-semibold">{it.name}</span>
                    <span className={`font-mono text-sm text-slate-600 dark:text-slate-300 sm:text-right ${it.note ? 'sm:row-span-2' : ''}`}>{it.f}</span>
                    {it.note && <span className="text-xs text-slate-400 sm:col-start-1">{it.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
      {cats.length === 0 && <p className="card p-5 text-center text-sm text-slate-500 dark:text-slate-400">{t('noResult')}</p>}
    </div>
  )
}
