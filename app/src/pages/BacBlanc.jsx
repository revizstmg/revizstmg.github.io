import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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
      {premiere&&<p className="text-sm">Les annales de droit et de management portent sur le programme de Terminale. Tu peux les découvrir dès la Première.</p>}
      <AnnalesBac>
        <div className="bac-preparation-column">
        <article className="bac-subject bac-subject-extra">
          <div className="bac-preview" aria-hidden="true"><span className="bac-preview-number">03</span><div className="bac-paper"><span className="bac-paper-small">RÉVIZSTMG</span><span className="bac-paper-rule"/><strong>{premiere?'Mathématiques':'Prix de l’excellence économique'}</strong><span className="bac-paper-duration">{premiere?'2 heures':'4 heures'}</span><span className="bac-paper-rule"/><span className="bac-paper-lines"/></div><span className="bac-pdf-stamp">{premiere?'ENTRAÎNEMENT':'DOSSIER COMPLET'}</span></div>
          <div className="bac-subject-body"><p className="bac-eyebrow">{premiere?'➗ Épreuve anticipée':'🏛️ Économie'}</p><h3 className="font-display text-3xl">{premiere?'Mathématiques':'Prix de l’excellence économique'}</h3>
          {premiere?<><p className="bac-subject-desc">Le 21 juin 2027, au titre de la session 2028 du bac. 2 heures, sans calculatrice : une partie d’automatismes à réponses courtes (6 points), puis deux ou trois exercices (14 points). 2 points sur 20 portent sur la maîtrise de la langue.</p><div className="bac-facts"><span>2 heures</span><span>20 points</span><span>Première</span></div><button onClick={()=>setSujetMaths(true)} className="bac-pdf-link">Faire un sujet d’entraînement (2 h) <span aria-hidden>→</span></button><p className="bac-source">Sujet composé par l’application. Ce n’est pas un sujet officiel.</p><a href={BO_MATHS} target="_blank" rel="noopener noreferrer" className="block mt-4 text-xs underline">Lire le Bulletin officiel</a></>:<><p className="bac-subject-desc">Les anciens sujets officiels, un dossier à analyser et une copie à rédiger. Retrouve une correction détaillée après ton entraînement.</p><div className="bac-facts"><span>4 heures</span><span>Terminale</span><span>Dossier complet</span></div><Link to="/excellence-economique" className="bac-pdf-link">Choisir un sujet <span aria-hidden>→</span></Link></>}
          </div>
        </article>
        <aside className="bac-preparation">
          <p className="bac-eyebrow">📝 Ta méthode</p>
          <h3 className="font-display">Une copie solide</h3>
          <ol>
            <li><strong>Avant</strong><p>Lis le sujet en entier et répartis ton temps selon les points.</p></li>
            <li><strong>Pendant</strong><p>Relie tes connaissances aux documents et justifie chaque réponse.</p></li>
            <li><strong>Après</strong><p>Relis ta copie, puis compare avec le corrigé pour cibler tes révisions.</p></li>
          </ol>
          <Link to="/revision" className="bac-preparation-link">Préparer mes révisions <span aria-hidden="true">→</span></Link>
        </aside>
        </div>
        <CreateExam />
      </AnnalesBac>
      </div>
    </div>
  )
}
