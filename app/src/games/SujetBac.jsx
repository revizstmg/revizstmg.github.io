// Sujet au format de l'épreuve : les parties s'enchaînent sous un même
// chronomètre de 4 h (indicatif : on peut finir avant ou dépasser), puis une note
// sur 20 récapitule le tout. Chaque partie se corrige au fil des réponses.
import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { noteSur20 } from '../data/sujetBac.js'
import { useT } from '../i18n.js'
import DocStudy from './DocStudy.jsx'
import CasPratique from './CasPratique.jsx'

const COMPOSANTS = { doc: DocStudy, caspratique: CasPratique }
const hms = (s) => `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`

export default function SujetBac({ sujet, color = 'var(--c-accent)', onExit }) {
  const { recordResult, noterReponses } = useStore()
  const t = useT()
  const [partie, setPartie] = useState(0)
  const [resultats, setResultats] = useState([])
  const [debut] = useState(() => Date.now())
  const [ecoule, setEcoule] = useState(0)
  const fini = resultats.length === sujet.parties.length

  useEffect(() => {
    if (fini) return
    const id = setInterval(() => setEcoule(Math.floor((Date.now() - debut) / 1000)), 1000)
    return () => clearInterval(id)
  }, [debut, fini])

  const terminerPartie = ({ correct, total, ratees, reussies }) => {
    const p = sujet.parties[partie]
    const pct = total ? Math.round((correct / total) * 100) : 0
    recordResult({ chapterId: p.themeId, gameId: 'sujet-bac', pct, correct, total, xp: correct * 12 })
    if (ratees?.length || reussies?.length) noterReponses({ themeId: p.themeId, type: p.game.type, ratees, reussies })
    setResultats((r) => [...r, { titre: p.titre, correct, total }])
    setPartie((k) => k + 1)
  }

  if (fini) {
    const note = noteSur20(resultats)
    return (
      <div className="card animate-pop-in space-y-4 p-6 text-center">
        <p className="kicker">{sujet.icon} {sujet.titre}</p>
        <p className="font-display text-5xl font-semibold" style={{ color: 'var(--c-accent-texte)' }}>{String(note).replace('.', ',')} / 20</p>
        <ul className="mx-auto max-w-sm space-y-1 text-left text-sm">
          {resultats.map((r) => (
            <li key={r.titre} className="flex justify-between gap-3"><span>{r.titre}</span><span className="font-semibold">{r.correct} / {r.total}</span></li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('sujetTimeUsed').replace('{t}', hms(ecoule))}</p>
        <button onClick={onExit} className="btn-primary" style={{ backgroundColor: 'var(--c-accent-fort)' }}>{t('done')}</button>
      </div>
    )
  }

  const p = sujet.parties[partie]
  const Comp = COMPOSANTS[p.game.type]
  const reste = sujet.duree - ecoule
  return (
    <div className="space-y-3">
      <div className="card flex flex-wrap items-center justify-between gap-2 p-3.5">
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{sujet.icon} {sujet.titre}</span>
          <span className="block font-display font-semibold">{p.titre} · {t('sujetPart').replace('{k}', partie + 1).replace('{n}', sujet.parties.length)}</span>
        </span>
        <span className={`font-mono text-sm font-semibold ${reste < 0 ? 'text-rose-600 dark:text-rose-400' : ''}`} aria-label={t('sujetTimeLeft')}>
          ⏱ {reste >= 0 ? hms(reste) : `+${hms(-reste)}`}
        </span>
      </div>
      {Comp && <Comp key={partie} game={p.game} color={color} onDone={terminerPartie} />}
      <button onClick={onExit} className="lien-retour">← {t('quit')}</button>
    </div>
  )
}
