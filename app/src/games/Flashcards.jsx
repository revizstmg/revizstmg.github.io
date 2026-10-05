import { Confetti } from '../components/ui.jsx'
import { PileCartes, useSerieCartes } from '../components/PileCartes.jsx'
import { useT } from '../i18n.js'

// Flashcards d'un chapitre : une pile de cartes à retourner puis à glisser
// (« Je savais » / « À revoir »), puis la possibilité de ne rejouer que les
// cartes ratées, ou de tout recommencer.
export default function Flashcards({ game, color = '#7c3aed', onDone }) {
  const t = useT()
  const total = game.cards.length
  const serie = useSerieCartes(game.cards)
  const { phase, aRevoir, sues } = serie
  const finish = () => { try { onDone?.({ correct: sues.size, total }) } catch { /* */ } }

  // ---- Fin de série : il reste des cartes à revoir, ou tout est acquis ----
  if (phase !== 'etude') {
    const fini = phase === 'fini'
    return (
      <div className="card p-6 text-center">
        <Confetti show={fini} />
        <div className="score-pop text-4xl">{fini ? '🎉' : '🔁'}</div>
        {fini && <p className="mt-2 font-display text-xl font-semibold">{t('flashWellDone')}</p>}
        <p className={`${fini ? 'mt-1 text-sm text-slate-500 dark:text-slate-400' : 'mt-2 font-display text-xl font-semibold'}`}>{t('cardsKnownOf').replace('{c}', sues.size).replace('{n}', total)}</p>
        {!fini && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{aRevoir.length} {t('toReviewLabel')}</p>}
        <div className="mt-5 space-y-2.5">
          {!fini && <button onClick={serie.revoirRatees} className="btn-primary w-full text-white" style={{ backgroundColor: color }}>🔁 {t('reviewMissed')} ({aRevoir.length})</button>}
          <button onClick={serie.recommencer} className={`w-full ${fini ? 'btn-primary text-white' : 'btn-ghost'}`} style={fini ? { backgroundColor: color } : undefined}>↻ {t('restartDeck')}</button>
          <button onClick={finish} className={fini ? 'btn-ghost w-full' : 'w-full py-2 text-sm text-slate-400 hover:text-slate-600'}>{t('finishNow')}</button>
        </div>
      </div>
    )
  }

  // ---- Étude ----
  const pct = Math.round((serie.i / serie.longueur) * 100)
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>{serie.i + 1}<span className="text-slate-400"> / {serie.longueur}</span></span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
      <PileCartes serie={serie} color={color} />
    </div>
  )
}
