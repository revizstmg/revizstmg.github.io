import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore, useStudyTimer } from '../store.jsx'
import { buildExam, examSubjects } from '../data/study.js'
import Exam from '../games/Exam.jsx'
import SujetBac from '../games/SujetBac.jsx'
import SujetMaths from '../games/SujetMaths.jsx'
import { BO_MATHS } from '../data/sujetMaths.js'
import { composerSujet, sujetsDisponibles } from '../data/sujetBac.js'
import { useT } from '../i18n.js'

const DURATIONS = [
  { min: 10, q: 8 },
  { min: 15, q: 12 },
  { min: 30, q: 20 },
  { min: 45, q: 30 },
  { min: 60, q: 40 },
]

// Sans filière (élève déconnecté), retour à l'accueil. Le test se fait ici, avant
// tout hook de la page : React exige les mêmes hooks à chaque affichage, sinon la
// déconnexion depuis cette page laisse un écran blanc.
export default function BacBlanc() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <BacBlancPage />
}

function BacBlancPage() {
  const { state, recordExamSeen } = useStore()
  const t = useT()
  useStudyTimer() // le temps du bac blanc compte pour les récompenses

  const subjects = examSubjects(state.track)
  // Une matière à la fois par défaut : un bac blanc mêlant toutes les matières
  // ne ressemble à aucune épreuve. Première : les maths (épreuve anticipée).
  const premiere = state.track?.level === 'premiere-stmg'
  const [subjectId, setSubjectId] = useState(() => (premiere && subjects.some((s) => s.id === 'p1-maths') ? 'p1-maths' : subjects[0]?.id) || 'all') // 'all' | subjectId
  const [dur, setDur] = useState(DURATIONS[2])
  const [exam, setExam] = useState(null) // { questions, durationSec }
  const [sujet, setSujet] = useState(null) // sujet au format de l'épreuve en cours
  const [sansSujet, setSansSujet] = useState(false)
  const [sujetMaths, setSujetMaths] = useState(false)
  const sujets = sujetsDisponibles(state.track)
  const lancerSujet = (id) => { const s = composerSujet(id, state.track); setSansSujet(!s); setSujet(s) }

  const start = () => {
    const ids = subjectId === 'all' ? null : [subjectId]
    const seen = state.examSeen?.[subjectId] || []
    const { questions, keys } = buildExam(state, state.track, ids, dur.q, seen)
    if (questions.length < 4) { setExam({ questions: [], durationSec: 0 }); return }
    recordExamSeen(subjectId, keys) // mémorise ce sujet pour ne pas le répéter
    setExam({ questions, durationSec: dur.min * 60 })
  }

  if (sujet) return <SujetBac sujet={sujet} onExit={() => setSujet(null)} />
  if (sujetMaths) return <SujetMaths onExit={() => setSujetMaths(false)} />

  if (exam && exam.questions.length >= 4) {
    return <Exam questions={exam.questions} durationSec={exam.durationSec} color="var(--c-accent)" onExit={() => setExam(null)} />
  }

  return (
    <div className="animate-lux space-y-6">
      <header className="text-center">
        <p className="kicker">📝 {t('mockExam')}</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{t('mockExam')}</h1>
        <span className="mx-auto mt-3 block h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,transparent,#c8a24e,transparent)' }} />
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('mockExamSub')}</p>
      </header>

      {exam && exam.questions.length < 4 && (
        <div className="card p-4 text-center text-sm text-rose-600 dark:text-rose-400">{t('notEnoughQuestions')}</div>
      )}

      {/* Sujets au format des épreuves écrites de spécialité (Terminale) */}
      {sujets.length > 0 && (
        <section className="card p-5">
          <h2 className="font-display text-xl font-medium">📜 {t('sujetTitle')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('sujetSub')}</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ces dossiers guidés ne constituent pas encore un sujet complet avec rédaction et barème officiel. Pour la session 2027, l’écrit de management porte sur l’enseignement commun et réserve 2 points sur 20 à l’orthographe et à la syntaxe. <a className="underline" href="https://www.education.gouv.fr/bo/2026/Special4/MENE2622652N" target="_blank" rel="noreferrer">Bulletin officiel du 17 septembre 2026</a></p>
          <div className="mt-4 grid gap-2">
            {sujets.map((s) => (
              <button key={s.id} onClick={() => lancerSujet(s.id)} className="flex items-center gap-3 rounded-xl bg-slate-100 p-3.5 text-left transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
                <span className="text-2xl" aria-hidden>{s.icon}</span>
                <span className="min-w-0 flex-1"><span className="block font-semibold">{s.titre}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{t('sujetDuration')}</span></span>
                <span className="text-slate-400" aria-hidden>›</span>
              </button>
            ))}
          </div>
          {sansSujet && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{t('sujetNoContent')}</p>}
        </section>
      )}
      {/* Première : l'épreuve anticipée de mathématiques et ses automatismes */}
      {premiere && (
        <section className="card p-5">
          <h2 className="font-display text-xl font-medium">➗ Épreuve anticipée de mathématiques</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Le 21 juin 2027, au titre de la session 2028 du bac. 2 heures, sans calculatrice : une partie d’automatismes à réponses courtes (6 points), puis deux ou trois exercices (14 points). 2 points sur 20 portent sur la maîtrise de la langue.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400"><a href={BO_MATHS} target="_blank" rel="noopener" className="underline">Note de service du 11 septembre 2026, Bulletin officiel spécial n° 4 (PDF)</a></p>
          <button onClick={() => setSujetMaths(true)} className="btn-gold mt-4 w-full !py-3">Faire un sujet d’entraînement (2 h)</button>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Sujet composé par l’application au format de l’épreuve, avec une correction détaillée. Ce n’est pas un sujet officiel.</p>
        </section>
      )}

      <section className="card card-lux p-5">
        <h2 className="font-display text-xl font-medium">⏱ QCM chronométré</h2>
        <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-slate-400">Pour vérifier tes connaissances, matière par matière. Ce n’est pas le format de l’épreuve écrite.</p>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('chooseSubject')}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {subjects.map((s) => (
            <button key={s.id} onClick={() => setSubjectId(s.id)} aria-pressed={subjectId === s.id} className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-center text-sm font-semibold transition ${subjectId === s.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`} style={subjectId === s.id ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
              <span aria-hidden>{s.icon}</span> {s.short || s.name}
            </button>
          ))}
          <button onClick={() => setSubjectId('all')} aria-pressed={subjectId === 'all'} className={`rounded-xl px-3 py-3 text-center text-sm font-semibold transition ${subjectId === 'all' ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`} style={subjectId === 'all' ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
            🎓 {t('wholeTrack')}
          </button>
        </div>

        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{t('duration')}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {DURATIONS.map((d) => (
            <button key={d.min} onClick={() => setDur(d)} className={`rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition ${dur.min === d.min ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`} style={dur.min === d.min ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
              {d.min} {t('minShort')}<br /><span className="opacity-70">{d.q} {t('questionsShort')}</span>
            </button>
          ))}
        </div>

        <button onClick={start} className="btn-gold mt-6 w-full !py-3.5 text-base">⏱ {t('startExam')}</button>
        <p className="mt-3 text-center text-xs text-slate-400">{t('examNote')}</p>
      </section>

    </div>
  )
}
