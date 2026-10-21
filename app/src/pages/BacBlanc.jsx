import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore, useStudyTimer } from '../store.jsx'
import { buildExam, examSubjects } from '../data/study.js'
import Exam from '../games/Exam.jsx'
import CreateExam from '../components/CreateExam.jsx'
import AnnalesBac from '../components/AnnalesBac.jsx'
import './BacBlanc.css'
import SujetMaths from '../games/SujetMaths.jsx'
import { BO_MATHS } from '../data/sujetMaths.js'
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

  const subjects = examSubjects(state.track).filter(s => !['droit', 'economie', 'management', 'p1-droit', 'p1-economie', 'p1-management'].includes(s.id))
  // Une matière à la fois par défaut : un bac blanc mêlant toutes les matières
  // ne ressemble à aucune épreuve. Première : les maths (épreuve anticipée).
  const premiere = state.track?.level === 'premiere-stmg'
  const [subjectId, setSubjectId] = useState(() => (premiere && subjects.some((s) => s.id === 'p1-maths') ? 'p1-maths' : subjects[0]?.id) || 'all') // 'all' | subjectId
  const [dur, setDur] = useState(DURATIONS[2])
  const [exam, setExam] = useState(null) // { questions, durationSec }
  const [sujetMaths, setSujetMaths] = useState(false)


  const start = () => {
    const ids = subjectId === 'all' ? subjects.map(s => s.id) : [subjectId]
    const seen = state.examSeen?.[subjectId] || []
    const { questions, keys } = buildExam(state, state.track, ids, dur.q, seen)
    if (questions.length < 4) { setExam({ questions: [], durationSec: 0 }); return }
    recordExamSeen(subjectId, keys) // mémorise ce sujet pour ne pas le répéter
    setExam({ questions, durationSec: dur.min * 60 })
  }

  if (sujetMaths) return <SujetMaths onExit={() => setSujetMaths(false)} />

  if (exam && exam.questions.length >= 4) {
    return <Exam questions={exam.questions} durationSec={exam.durationSec} color="var(--c-accent)" onExit={() => setExam(null)} />
  }

  return (
    <div className="bac-page animate-lux space-y-9">
      <div className="space-y-9">
      <header className="bac-hero">
        <div><p className="bac-eyebrow">RÉVIZSTMG · LA SALLE D’EXAMEN</p><h1 className="font-display">Bac blanc</h1><p className="bac-hero-title font-display">Le jour J commence ici.</p><p className="bac-hero-desc">Un vrai sujet. Une copie. Du temps pour réfléchir. Prépare tes épreuves dans les conditions qui comptent.</p><div className="bac-hero-tags"><span>Sujets complets</span><span>Format PDF</span><span>À rédiger sur papier</span></div></div>
        <aside className="bac-hero-aside" aria-label="Préparer sa séance"><ol><li>Choisis ton épreuve et ouvre le PDF.</li><li>Prépare une copie et ton matériel.</li><li>Installe-toi au calme, comme le jour du bac.</li></ol></aside>
      </header>
      {!premiere && <AnnalesBac />}
      </div>

      <CreateExam />

      <div className="space-y-6">

      {exam && exam.questions.length < 4 && (
        <div className="card p-4 text-center text-sm text-rose-600 dark:text-rose-400">{t('notEnoughQuestions')}</div>
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

    </div>
  )
}
