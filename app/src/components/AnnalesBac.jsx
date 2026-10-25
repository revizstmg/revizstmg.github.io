import { useState } from 'react'
import { TextePublic } from '../localisation/PublicText.jsx'
import { ANNALES_BAC, CENTRES_BAC, annaleUrl, ANNALES_SOURCE, BAC_BO } from '../data/annalesBac.js'
export default function AnnalesBac({children}) {
  const [centres, setCentres] = useState({})
  return <section aria-labelledby="annales-title" className="space-y-5">
    <div className="bac-section-heading"><div><p className="bac-eyebrow">SUJETS ET ENTRAÎNEMENTS</p><h2 id="annales-title" className="font-display text-3xl">Choisis ton épreuve.</h2></div><span className="bac-session">Session 2026</span></div>
    <div className="bac-subjects">{ANNALES_BAC.map(s => {
      const centre = centres[s.id] || 'metropole'
      return <article key={s.id} className={`bac-subject bac-subject-${s.color}`}>
        <div className="bac-preview" aria-hidden="true"><span className="bac-preview-number">{s.number}</span><div className="bac-paper"><span className="bac-paper-small">BACCALAURÉAT TECHNOLOGIQUE</span><span className="bac-paper-rule" /><span className="bac-paper-session">SESSION 2026 · STMG</span><strong>{s.officialName}</strong><span className="bac-paper-duration">Durée de l’épreuve : 4 heures</span><span className="bac-paper-rule" /><span className="bac-paper-lines" /><span className="bac-paper-code">{centre === 'metropole' ? s.code : 'SUJET OFFICIEL · PDF'}</span></div><span className="bac-pdf-stamp">PDF<br />COMPLET</span></div>
        <div className="bac-subject-body"><p className="bac-eyebrow"><TextePublic text={s.tag} /></p><h3 className="font-display text-3xl">{s.name}</h3><p className="bac-subject-desc"><TextePublic text={s.desc} /></p>
          <div className="bac-facts"><span>4 heures</span><span>20 points</span><span>{centre === 'metropole' ? `${s.pages} pages` : 'Annexes incluses'}</span></div>
          <label className="bac-centre-label" htmlFor={`centre-${s.id}`}>Centre d’examen</label><select id={`centre-${s.id}`} value={centre} onChange={e => setCentres(c => ({ ...c, [s.id]: e.target.value }))} className="bac-centre">{CENTRES_BAC.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
          <a className="bac-pdf-link" href={annaleUrl(s.id, centre)} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir le sujet PDF complet — ${s.officialName}`}>Ouvrir le sujet PDF complet <span aria-hidden="true">↗</span></a>
          <p className="bac-source">Document original du ministère · ouvre un nouvel onglet</p>
        </div>
      </article>
    })}{children}</div>
    <div className="bac-source-note"><span aria-hidden="true">↗</span><p>Les annales de droit et de management sont les sujets officiels de 2026, sans réécriture. Les réponses se rédigent sur une copie séparée. <a href={ANNALES_SOURCE} target="_blank" rel="noopener noreferrer">Vérifier la source</a></p></div>
    <details className="bac-rules"><summary>Préparer la session 2027</summary><p>Les annales restent datées de 2026. À partir de 2027, 2 points sur 20 portent sur l’orthographe et la syntaxe. En droit-économie, ils se répartissent en 1,5 point en droit et 0,5 point en économie. Le format reste de 4 heures. Les corrigés de ces annales ne sont pas fournis ici.</p><a href={BAC_BO} target="_blank" rel="noopener noreferrer">Lire la définition officielle des épreuves →</a></details>
  </section>
}
