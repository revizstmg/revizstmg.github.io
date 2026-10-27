import {Link} from 'react-router-dom'
import {DEMO} from '../data/studyJourney.js'
import {JourneySteps} from '../components/StudyJourney.jsx'
import {usePublicText} from '../i18n.js'

export default function ExampleStudy(){
 const tr=usePublicText()
 return <div className="study-demo">
  <header><p className="study-kicker">{tr('Voir avant de commencer')}</p><h1>{tr('Du devoir au déclic')}</h1><p>{tr('Voici comment une erreur devient un point de départ pour réviser.')}</p></header>
  <p className="study-notice">{tr('Exemple fictif rédigé pour la démonstration. Ce n’est ni une vraie copie, ni une analyse générée en direct. Aucun fichier ni compte nécessaire.')}</p>
  <p className="mt-3 text-sm">{tr('L’exemple pédagogique est présenté en français.')}</p>
  <JourneySteps/>
  <section lang="fr" data-no-translate aria-labelledby="demo-sujet"><p className="study-kicker">01 · Le devoir</p><h2 id="demo-sujet">{DEMO.title}</h2><p>{DEMO.subject}</p><div className="study-document"><h3>Sujet fictif</h3><p>{DEMO.question}</p></div><div className="study-document"><h3>Réponse fictive de l’élève</h3><p>« {DEMO.answer} »</p></div></section>
  <section lang="fr" data-no-translate aria-labelledby="demo-bilan"><p className="study-kicker">02 · Le bilan</p><h2 id="demo-bilan">La TVA collectée est juste. Le résultat final est faux.</h2><p>Tu sais calculer la TVA collectée. Tu as oublié de tenir compte de la TVA déductible sur les achats : tu confonds la TVA collectée avec la TVA à décaisser.</p><p className="study-score"><strong>{DEMO.criteria.reduce((n,c)=>n+c.points,0)}/5</strong> · Note illustrative, selon ce barème de démonstration</p><p>Une correction automatique fournit une estimation expliquée. Le professeur reste la référence pour le barème et la note du devoir.</p><ol className="study-criteria">{DEMO.criteria.map(c=><li key={c.label}><strong>{c.label} · {c.points}/{c.max}</strong><p>{c.feedback}</p></li>)}</ol><div className="study-document"><h3>La méthode à retenir</h3><p>1. TVA collectée = ventes HT × taux de TVA.<br/>2. TVA déductible = achats HT ouvrant droit à déduction × taux de TVA.<br/>3. TVA à décaisser = TVA collectée − TVA déductible.<br/>Si la différence est négative, il s’agit d’un crédit de TVA.</p></div><p className="mt-4"><a href={DEMO.courseUrl} className="study-link">Relire le cours sur la TVA</a></p></section>
  <section lang="fr" data-no-translate aria-labelledby="demo-exercices"><p className="study-kicker">03 · L’entraînement</p><h2 id="demo-exercices">À toi de refaire le raisonnement</h2><p>Trois situations différentes pour retravailler la même compétence. Tes réponses dans cette démonstration restent sur la page et ne sont ni envoyées ni notées.</p>{DEMO.exercises.map((e,i)=><article className="study-exercise" key={e.skill}><h3>{i+1}. {e.skill}</h3><p>{e.question}</p><label className="mt-3 block">Ta réponse à l’exercice {i+1}<textarea rows={3} maxLength={4000}/></label><details><summary>Comparer avec la correction</summary><p>{e.correction}</p></details></article>)}<p className="study-notice">Avant ton prochain contrôle : vérifie que tu sais distinguer les deux TVA, effectuer les calculs et interpréter leur différence. Cet exemple montre une méthode ; il ne garantit aucune note future.</p></section>
  <div className="study-actions"><Link to="/mes-notes" className="study-link">{tr('Préparer mon bilan')}</Link><Link to="/offres" className="study-link">{tr('Comparer les offres')}</Link><Link to="/" className="study-link">{tr('Commencer à réviser')}</Link></div>
 </div>
}
