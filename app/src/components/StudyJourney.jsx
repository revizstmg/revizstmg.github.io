import {Link} from 'react-router-dom'
import {usePublicText} from '../i18n.js'
import './StudyJourney.css'

export function JourneySteps(){
 const tr=usePublicText()
 return <ol className="study-steps" aria-label={tr('Du devoir à la révision')}>
  {[['01','Dépose ton devoir','Ton sujet et ta copie, ou tes questions manquées.'],['02','Comprends tes erreurs','Un bilan expliqué, relié aux notions du cours.'],['03','Entraîne-toi','Des questions ciblées avec leur correction.']].map(([n,title,desc])=><li key={n}><span aria-hidden="true">{n}</span><div><h3>{tr(title)}</h3><p>{tr(desc)}</p></div></li>)}
 </ol>
}
export function StudyPromise({start='/cours',compact=false,onStart}){
 const tr=usePublicText()
 return <section className={`study-promise${compact?' study-promise-compact':''}`} aria-label={tr('Prépare ton prochain contrôle')}>
  <p className="study-kicker">{tr('Ton prochain contrôle')}</p>
  <h2>{tr('Comprends tes erreurs.')}<br/>{tr('Prépare ton prochain contrôle.')}</h2>
  <p>{tr('Pars de ton dernier devoir pour savoir quoi revoir et comment t’entraîner.')}</p>
  <div className="study-actions">{onStart?<button type="button" onClick={onStart} className="study-primary">{tr('Commencer à réviser')}</button>:<Link to={start} className="study-primary">{tr('Commencer à réviser')}</Link>}<Link to="/exemple-bilan" className="study-secondary">{tr('Voir un exemple de bilan')}</Link></div>
  {!compact&&<JourneySteps/>}
 </section>
}
