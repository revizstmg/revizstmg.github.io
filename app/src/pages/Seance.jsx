import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore, useStudyTimer } from '../store.jsx'
import { composerSeance } from '../data/seance.js'
import { todayKey } from '../data/srs.js'
import { readPosition } from '../data/readingPosition.js'
import GameHost from '../games/GameHost.jsx'
import { usePublicText } from '../i18n.js'

const ICONES = { erreurs: '📒', revision: '🧠', avancer: '▶' }

// « Ma séance du jour » : un toucher depuis l'accueil, et la première question
// est à l'écran. Les étapes s'enchaînent ; « Quitter » arrête la séance.
export default function Seance() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <SeancePage />
}

function SeancePage() {
  const { state } = useStore()
  const tr = usePublicText()
  useStudyTimer()
  const [etapes] = useState(() => composerSeance(state, state.track, todayKey(), readPosition(state.account?.id)?.themeId))
  const [k, setK] = useState(0)
  const [faites, setFaites] = useState([])
  const [fin, setFin] = useState(etapes.length === 0)

  const etape = etapes[k]
  if (!fin && etape) {
    const derniere = k + 1 >= etapes.length
    const suivante = () => {
      setFaites((f) => [...f, etape.id])
      if (derniere) setFin(true)
      else setK(k + 1)
    }
    return (
      <GameHost
        key={etape.id}
        game={{ ...etape.game, title: tr('Étape {k}/{n} · {titre}', { k: k + 1, n: etapes.length, titre: tr(etape.titre) }) }}
        chapterId={etape.themeId}
        color={etape.color || 'var(--c-accent-fort)'}
        modeInitial="train"
        onExit={() => setFin(true)}
        suite={{ label: tr(derniere ? 'Terminer la séance' : 'Étape suivante →'), onClick: suivante }}
      />
    )
  }

  return (
    <div className="animate-lux mx-auto max-w-md space-y-5 text-center">
      <header>
        <p className="kicker">☀️ Ma séance du jour</p>
        <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight">{faites.length === etapes.length && etapes.length ? 'Séance terminée' : 'Séance du jour'}</h1>
      </header>
      {etapes.length === 0 ? (
        <p className="card p-5 text-sm text-slate-500 dark:text-slate-400">Rien à proposer pour l’instant : ouvre un cours pour commencer.</p>
      ) : (
        <ul className="card divide-y divide-slate-100 p-0 text-start dark:divide-slate-800">
          {etapes.map((e) => (
            <li key={e.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl" aria-hidden>{ICONES[e.id]}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-tight">{tr(e.titre)}</span>
                {e.detail && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{e.detail}</span>}
              </span>
              <span className={faites.includes(e.id) ? 'text-emerald-600' : 'text-slate-300'} aria-label={faites.includes(e.id) ? 'faite' : 'à faire'}>{faites.includes(e.id) ? '✓' : '○'}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {faites.length < etapes.length && <button onClick={() => { setK(faites.length); setFin(false) }} className="btn-gold !py-2.5">Reprendre la séance</button>}
        <Link to="/accueil" className="btn-ghost">Retour à l’accueil</Link>
      </div>
    </div>
  )
}
