import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useStore, useStudyTimer } from '../store.jsx'
import { Confetti } from '../components/ui.jsx'
import { PileCartes, useSerieCartes } from '../components/PileCartes.jsx'
import { useT } from '../i18n.js'

// Page plein écran d'un paquet de flashcards enregistré : la pile de cartes
// (voir PileCartes), une barre de progression, et l'écran de fin de série.
export default function FlashcardsPage() {
  const { deckId } = useParams()
  const { state } = useStore()
  const deck = (state.savedDecks || []).find((d) => d.id === deckId)
  if (!deck) return <Navigate to="/revision" replace />
  return <Paquet deck={deck} />
}

function Paquet({ deck }) {
  const navigate = useNavigate()
  const { addXp } = useStore()
  const t = useT()
  // Le temps passé à réviser des flashcards compte pour les récompenses
  // (attribué au thème du paquet si connu, sinon au compteur d'étude général).
  useStudyTimer(deck.themeId || null)
  const serie = useSerieCartes(deck.cards)
  const { phase, aRevoir, sues } = serie
  const total = deck.cards.length
  const color = deck.color || '#7c3aed'

  // Échap = quitter
  useEffect(() => {
    const touche = (e) => { if (e.key === 'Escape') navigate('/revision') }
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  }, [navigate])

  const finish = () => { try { addXp(Math.min(15, sues.size)) } catch { /* */ } navigate('/revision') }
  const fini = phase === 'fini'

  // Rendu via un portal sur <body> pour couvrir vraiment tout l'écran (au-dessus
  // de l'en-tête), sans être piégé par la transformation de la zone de contenu.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
        <button onClick={() => navigate('/revision')} aria-label={t('quit')} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-500 shadow dark:bg-slate-800 dark:text-slate-300">✕</button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{deck.title}</p>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${phase === 'etude' ? Math.round((serie.i / Math.max(1, serie.longueur)) * 100) : 100}%`, backgroundColor: color }} />
          </div>
        </div>
        {phase === 'etude' && <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color }}>{serie.i + 1}<span className="text-slate-400">/{serie.longueur}</span></span>}
      </div>

      {phase === 'etude' ? (
        <div className="flex flex-1 flex-col justify-center px-5 pb-7 pt-2">
          <div className="mx-auto w-full max-w-md">
            <PileCartes serie={serie} color={color} hauteur="h-[52vh] max-h-[500px]" grand />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Confetti show={fini} />
          <div className="score-pop text-5xl">{fini ? '🎉' : '🔁'}</div>
          {fini && <p className="mt-3 font-display text-2xl font-semibold">{t('flashWellDone')}</p>}
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t('cardsKnownOf').replace('{c}', sues.size).replace('{n}', total)}</p>
          {!fini && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{aRevoir.length} {t('toReviewLabel')}</p>}
          <div className="mt-7 w-full max-w-xs space-y-3">
            {!fini && <button onClick={serie.revoirRatees} className="btn-primary w-full text-white" style={{ backgroundColor: color }}>🔁 {t('reviewMissed')} ({aRevoir.length})</button>}
            <button onClick={serie.recommencer} className={`w-full ${fini ? 'btn-primary text-white' : 'btn-ghost'}`} style={fini ? { backgroundColor: color } : undefined}>↻ {t('restartDeck')}</button>
            <button onClick={finish} className="w-full py-2 text-sm text-slate-400 hover:text-slate-600">{t('finishNow')}</button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
