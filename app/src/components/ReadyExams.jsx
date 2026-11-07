import { useState } from 'react'
import { usePublicText } from '../i18n.js'
import { sujetsPourNiveau } from '../data/sujetsPrets.js'
const ORDER = ['Management', 'Droit', 'Économie', 'Sciences de gestion et numérique', 'Gestion et finance', 'Droit et économie']

export default function ReadyExams({ level }) {
  const tr = usePublicText()
  const subjects = sujetsPourNiveau(level)
  const matieres = ORDER.filter(m => subjects.some(s => s.subject === m))
  const [matiere, setMatiere] = useState(matieres[0])
  const selection = subjects.filter(s => s.subject === matiere)
  const pdf = (subject, type) => `${import.meta.env.BASE_URL}sujets-prets/${subject.id}-${type}.pdf`
  return <section className="bac-ready" aria-labelledby="ready-title">
    <header className="bac-ready-heading">
      <div><p className="bac-eyebrow">{tr('Prêts à commencer')}</p><h2 id="ready-title" className="font-display">{tr('Les sujets classiques')}</h2><p>{tr('Deux sujets par matière. Choisis ton entraînement et ouvre le PDF, sans attendre.')}</p></div>
      <div className="bac-ready-filter"><label htmlFor="ready-matiere">{tr('Choisir une matière')}</label>
        <select id="ready-matiere" value={matiere} onChange={e => setMatiere(e.target.value)}>
          {matieres.map(m => <option key={m} value={m}>{tr(m)}</option>)}
        </select>
      </div>
    </header>
    <div className="bac-ready-cards">
      {selection.map((subject, index) => <article key={subject.id} className="bac-ready-sheet" aria-labelledby={`ready-${subject.id}`}>
        <div className="bac-ready-cover" aria-hidden="true">
          <span className="bac-ready-number">{String(index + 1).padStart(2, '0')}</span>
          <div className="bac-paper"><span className="bac-paper-small">RÉVIZSTMG</span><span className="bac-paper-rule"/><strong lang="fr" translate="no">{subject.subject}</strong><span className="bac-paper-duration">{tr('{minutes} min', { minutes: subject.duration })}</span><span className="bac-paper-rule"/><span className="bac-paper-lines"/></div>
          <span className="bac-ready-stamp">PDF</span>
        </div>
        <div className="bac-ready-body">
          <h3 id={`ready-${subject.id}`} className="font-display" lang="fr" translate="no">{subject.title}</h3>
          <p className="bac-ready-description" lang="fr" translate="no">{subject.summary}</p>
          <p className="bac-facts"><span>{tr('{minutes} min', { minutes: subject.duration })}</span><span>{tr('{count} documents', { count: subject.documents })}</span><span>{tr('{count} questions', { count: subject.questions })}</span><span>{tr('20 points')}</span></p>
          <div className="bac-ready-actions"><a className="bac-pdf-link" href={pdf(subject, 'sujet')} download>{tr('Télécharger le sujet')}<span aria-hidden="true">↗</span></a><a className="bac-ready-correction" href={pdf(subject, 'corrige')} download>{tr('Télécharger le corrigé')}</a></div>
        </div>
      </article>)}
    </div>
    <p className="bac-ready-notice">{tr('Entraînements non officiels, en français. Les cas et les données sont fictifs.')} {tr('Rédige sur une copie séparée. Le corrigé détaille le raisonnement et les points attendus.')}</p>
  </section>
}
