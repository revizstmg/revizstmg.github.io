import { useState } from 'react'
import { usePublicText } from '../i18n.js'
import { sujetsPourNiveau } from '../data/sujetsPrets.js'

export default function ReadyExams({ level }) {
  const tr = usePublicText()
  const subjects = sujetsPourNiveau(level)
  const [selected, setSelected] = useState(subjects[0].id)
  const subject = subjects.find(s => s.id === selected) || subjects[0]
  const pdf = type => `${import.meta.env.BASE_URL}sujets-prets/${subject.id}-${type}.pdf`
  return <section className="bac-ready" aria-labelledby="ready-title">
    <header><p className="bac-eyebrow">{tr('Prêts à commencer')}</p><h2 id="ready-title" className="font-display">{tr('Les sujets classiques')}</h2><p>{tr('Choisis un sujet déjà préparé, puis ouvre son PDF. Aucun délai de génération.')}</p></header>
    <div className="bac-ready-content">
      <div><label htmlFor="ready-subject" className="block font-semibold mb-2">{tr('Choisir un sujet')}</label>
        <select id="ready-subject" className="input w-full" value={subject.id} onChange={e => setSelected(e.target.value)} lang="fr" translate="no">
          {subjects.map(s => <option key={s.id} value={s.id}>{s.subject} · {s.title} · {s.duration} min</option>)}
        </select>
        <p className="mt-3 text-sm">{tr('Entraînements non officiels, en français. Les cas et les données sont fictifs.')}</p>
      </div>
      <article className="bac-ready-sheet" aria-labelledby="ready-name">
        <h3 id="ready-name" className="font-display" lang="fr" translate="no">{subject.title}</h3>
        <p lang="fr" translate="no">{subject.summary}</p>
        <p className="bac-facts"><span>{tr('{minutes} min', { minutes: subject.duration })}</span><span>{tr('{count} documents', { count: subject.documents })}</span><span>{tr('{count} questions', { count: subject.questions })}</span><span>{tr('20 points')}</span></p>
        <div className="bac-ready-actions"><a className="bac-pdf-link" href={pdf('sujet')} download>{tr('Télécharger le sujet')}</a><a className="btn-ghost" href={pdf('corrige')} download>{tr('Télécharger le corrigé')}</a></div>
        <p className="text-xs">{tr('Rédige sur une copie séparée. Le corrigé détaille le raisonnement et les points attendus.')}</p>
      </article>
    </div>
  </section>
}
