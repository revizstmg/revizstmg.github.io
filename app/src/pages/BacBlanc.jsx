import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore, useStudyTimer } from '../store.jsx'
import CreateExam from '../components/CreateExam.jsx'
import AnnalesBac from '../components/AnnalesBac.jsx'
import './BacBlanc.css'
import SujetMaths from '../games/SujetMaths.jsx'
import { BO_MATHS } from '../data/sujetMaths.js'

// Sans filière (élève déconnecté), retour à l'accueil. Le test se fait ici, avant
// tout hook de la page : React exige les mêmes hooks à chaque affichage, sinon la
// déconnexion depuis cette page laisse un écran blanc.
export default function BacBlanc() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <BacBlancPage />
}

function BacBlancPage() {
  const { state } = useStore()
  useStudyTimer() // le temps du bac blanc compte pour les récompenses

  const premiere = state.track?.level === 'premiere-stmg'
  const [sujetMaths, setSujetMaths] = useState(false)

  if (sujetMaths) return <SujetMaths onExit={() => setSujetMaths(false)} />

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


      </div>

    </div>
  )
}
