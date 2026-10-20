import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore, starsFromScore } from '../store.jsx'
import { chapitreDuJeu } from '../data/index.js'
import { ContexteCorrection } from './common.jsx'
import { Stars, Confetti, Icon } from '../components/ui.jsx'
import { useT } from '../i18n.js'
import SignalerErreur from '../components/SignalerErreur.jsx'
import { useFenetreClavier } from '../components/clavier.js'
import Qcm from './Qcm.jsx'
import VraiFaux from './VraiFaux.jsx'
import Flashcards from './Flashcards.jsx'
import Association from './Association.jsx'
import Tri from './Tri.jsx'
import Trou from './Trou.jsx'
import Ordre from './Ordre.jsx'
import Calcul from './Calcul.jsx'
import Memory from './Memory.jsx'
import DocStudy from './DocStudy.jsx'
import TypedGen from './TypedGen.jsx'
import Comprehension from './Comprehension.jsx'
import SqlQuery from './SqlQuery.jsx'
import Saisie from './Saisie.jsx'
import CasPratique from './CasPratique.jsx'

const COMPONENTS = {
  qcm: Qcm,
  vraifaux: VraiFaux,
  flashcard: Flashcards,
  association: Association,
  tri: Tri,
  trou: Trou,
  ordre: Ordre,
  calcul: Calcul,
  memory: Memory,
  doc: DocStudy,
  verbs: TypedGen,
  grammar: TypedGen,
  comprehension: Comprehension,
  sql: SqlQuery,
  saisie: Saisie,
  caspratique: CasPratique,
}

export const GAME_LABELS = {
  qcm: 'QCM',
  vraifaux: 'Vrai / Faux',
  flashcard: 'Flashcards',
  association: 'Association',
  tri: 'Tri par catégories',
  trou: 'Texte à trous',
  ordre: 'Remise en ordre',
  calcul: 'Calcul express',
  memory: 'Memory',
  doc: 'Étude de documents',
  verbs: 'Verbes irréguliers',
  grammar: 'Grammaire',
  comprehension: 'Compréhension',
  sql: 'Requête SQL',
  saisie: 'Réponse à écrire',
  caspratique: 'Cas pratique chiffré',
}

// Types sans « mode » (Entraînement / Défi) : on entre directement dans le jeu.
const NO_MODE = new Set(['doc', 'comprehension', 'sql', 'caspratique'])

// Types dont on peut refaire seulement les questions ratées, en fin de série.
const REJOUABLES = new Set(['qcm', 'vraifaux', 'trou', 'saisie'])

// L'exercice occupe tout l'écran (ni en-tête ni barre du bas) : moins de
// distractions et de touchers perdus. La page en dessous ne défile plus.
// Au clavier, Tab reste dans l'exercice et le focus revient ensuite sur la page ;
// Échap ne quitte pas, pour ne pas perdre une série par mégarde (« Quitter » le fait).
function PleinEcran({ titre, children }) {
  const fenetre = useRef(null)
  useFenetreClavier(fenetre, null, true, { focusSurRacine: true })
  useEffect(() => {
    const avant = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = avant }
  }, [])
  return createPortal(
    <div ref={fenetre} data-exercice className="no-print fixed inset-0 z-[60] overflow-y-auto focus:outline-none" style={{ background: 'var(--c-bg)' }} role="dialog" aria-modal="true" aria-label={titre}>
      <div className="mx-auto max-w-2xl px-4 pb-10" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>{children}</div>
    </div>,
    document.body,
  )
}

// `modeInitial` lance l'exercice sans écran de choix (séance du jour) ;
// `suite` ({ label, onClick }) remplace « Terminé » en fin de série.
export default function GameHost({ game, chapterId, color, quiz = false, onExit, modeInitial = null, suite = null }) {
  const { recordResult, noterReponses } = useStore()
  const t = useT()
  const [mode, setMode] = useState(NO_MODE.has(game.type) ? 'solo' : modeInitial)
  const [result, setResult] = useState(null)
  const [runKey, setRunKey] = useState(0)
  // « Refaire mes erreurs » : les questions ratées de la série, rejouées seules.
  // Cette reprise ne compte ni dans la maîtrise ni en XP (elle n'entraîne que
  // sur ce qu'on vient de rater).
  const [reprise, setReprise] = useState(null)

  const Comp = COMPONENTS[game.type]
  const jeu = reprise ? { ...game, questions: reprise, count: reprise.length } : game
  const correction = { themeId: chapterId, idx: chapitreDuJeu(chapterId, game.id) }

  const handleDone = ({ correct, total, timeBonus = 0, ratees, reussies }) => {
    const pct = total ? Math.round((correct / total) * 100) : 0
    const base = mode === 'defi' ? 15 : 10
    const xp = reprise ? 0 : correct * base + (mode === 'defi' ? timeBonus : 0)
    if (!reprise) recordResult({ chapterId, gameId: game.id, quiz, pct, correct, total, xp })
    // Carnet d'erreurs : les questions ratées y entrent ; réussies le jour où
    // elles sont dues, elles avancent vers la sortie (voir majCarnet).
    if (chapterId && (ratees?.length || reussies?.length)) noterReponses({ themeId: chapterId, type: game.type, ratees, reussies })
    setResult({ correct, total, pct, xp, ratees: ratees || [] })
  }

  const replay = () => {
    setReprise(null)
    setResult(null)
    setRunKey((k) => k + 1)
  }
  const refaireErreurs = () => {
    setReprise(result.ratees)
    setResult(null)
    setRunKey((k) => k + 1)
  }

  if (!Comp) return null

  if (!mode) {
    return (
      <div className="card animate-pop-in p-5">
        <button onClick={onExit} className="lien-retour mb-3">← {t('backToGames')}</button>
        <h3 className="mb-1 font-display text-xl font-semibold">{game.title}</h3>
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{t('chooseMode')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => setMode('train')} className="rounded-2xl p-4 text-left ring-1 transition hover:-translate-y-0.5"
            style={{ background: 'var(--c-card)', color: 'var(--c-ink)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-ink) 14%, transparent)' }}>
            <div style={{ color: 'color-mix(in srgb, var(--c-ink) 45%, transparent)' }}><Icon.Brain size={22} /></div>
            <div className="mt-2 font-display text-lg font-semibold">{t('training')}</div>
            <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--c-ink) 62%, transparent)' }}>{t('trainingDesc')}</div>
          </button>
          <button onClick={() => setMode('defi')} className="rounded-2xl p-4 text-left ring-1 transition hover:-translate-y-0.5"
            style={{ background: 'color-mix(in srgb, var(--c-accent) 12%, var(--c-card))', color: 'var(--c-ink)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 42%, transparent)' }}>
            <div style={{ color: 'var(--c-accent)' }}><Icon.Timer size={22} /></div>
            <div className="mt-2 font-display text-lg font-semibold">{t('challenge')}</div>
            <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--c-ink) 62%, transparent)' }}>{t('challengeDesc')}</div>
          </button>
        </div>
      </div>
    )
  }

  if (result) {
    const stars = starsFromScore(result.pct)
    const great = result.pct >= 80
    const aRefaire = REJOUABLES.has(game.type) ? result.ratees.length : 0
    return (
      <PleinEcran titre={game.title}>
      <div className="card animate-pop-in p-6 text-center">
        <Confetti show={great} />
        <div className="animate-bounce-in text-5xl">{great ? '🎉' : result.pct >= 50 ? '👍' : '💪'}</div>
        <h3 className="mt-2 text-xl font-bold">{game.title}</h3>
        <div className="score-pop my-3 text-4xl font-extrabold texte-matiere" style={{ '--mc': color }}>{result.pct}%</div>
        <div className="mb-1"><Stars count={stars} size="text-2xl" /></div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {result.correct} / {result.total} {t('goodAnswers')}{!reprise && <> · <span className="pop-badge font-semibold text-violet-600 dark:text-violet-400">+{result.xp} XP</span></>}
        </p>
        {aRefaire > 0 && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{aRefaire > 1 ? `${aRefaire} questions ratées sont dans ton carnet d’erreurs : tu les reverras demain, puis dans 3 et 7 jours.` : 'La question ratée est dans ton carnet d’erreurs : tu la reverras demain, puis dans 3 et 7 jours.'}</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {aRefaire > 0 && <button onClick={refaireErreurs} className="btn-primary" style={{ backgroundColor: color }}>{`↻ Refaire mes erreurs (${aRefaire})`}</button>}
          <button onClick={replay} className={aRefaire > 0 ? 'btn-ghost' : 'btn-primary'} style={aRefaire > 0 ? undefined : { backgroundColor: color }}>{t('replay')}</button>
          {!NO_MODE.has(game.type) && <button onClick={() => { setMode(null); setResult(null); setReprise(null) }} className="btn-ghost">{t('changeMode')}</button>}
          {suite
            ? <button onClick={suite.onClick} className="btn-ghost font-semibold">{suite.label}</button>
            : <button onClick={onExit} className="btn-ghost">{t('done')}</button>}
        </div>
      </div>
      </PleinEcran>
    )
  }

  return (
    <PleinEcran titre={game.title}>
    <div className="animate-pop-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button onClick={onExit} className="lien-retour">← {t('quit')}</button>
        <span className="min-w-0 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{reprise ? '↻ Mes erreurs' : game.title}</span>
        <span className="chip shrink-0 gap-1.5 text-slate-500 ring-1 ring-slate-200 dark:text-slate-400 dark:ring-slate-800">
          {mode === 'defi' ? <Icon.Timer size={14} /> : <Icon.Brain size={14} />}
          {mode === 'defi' ? t('challenge') : t('training')}
        </span>
      </div>
      <ContexteCorrection.Provider value={correction}>
        <Comp key={runKey} game={jeu} mode={mode} color={color} onDone={handleDone} />
      </ContexteCorrection.Provider>
      <div className="mt-3 text-right">
        <SignalerErreur themeId={chapterId} exercice={`${game.title || ''} (${game.id || game.type})`} libelle="Signaler une erreur dans cet exercice" />
      </div>
    </div>
    </PleinEcran>
  )
}
