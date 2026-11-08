import PastillePremium from '../components/PastillePremium.jsx'
import {Link} from 'react-router-dom'
import {PLANS} from '../data/studyJourney.js'
import {useLang,usePublicText} from '../i18n.js'
import Abonnement from '../components/Abonnement.jsx'
import {BandeauGrace} from '../components/Reserve.jsx'
import {OFFRES,OFFRE_GO,prixAffiche} from '../data/abonnement.js'
import '../components/StudyJourney.css'
// Prix de chaque offre, TTC, affichés à tous (parents compris), connectés ou non.
function prixPlan(id,tr,lang){
 if(id==='free')return tr('0 €, sans carte bancaire')
 const o=OFFRES[id]
 return tr('{mois} TTC par mois, sans engagement',{mois:prixAffiche(o.mensuel.centimes,lang)})
}
export default function Offers(){
 const tr=usePublicText()
 const lang=useLang()
 return <div className="study-offers"><header><p className="study-kicker">{tr('Choisis ton accompagnement')}</p><h1>{tr('Les offres, simplement')}</h1><p>{tr('Les cours pour apprendre. Le bilan pour comprendre. L’entraînement pour progresser.')}</p></header><BandeauGrace/><p className="study-notice">{tr('Les cours et les exercices de base sont gratuits. Premium ouvre les outils de révision. Ultimate ajoute les parcours et programmes personnalisés. Chaque aide par IA s’utilise une fois par mois avec Premium, presque sans limite avec Ultimate. Ces aides dépendent de services externes : leur état est indiqué au moment de les utiliser.')}</p><div className="study-offer-grid">{PLANS.map(p=><article key={p.id}><p className="study-kicker">{tr(p.intro)}</p><h2>{tr(p.name)}</h2><p className="font-semibold">{prixPlan(p.id,tr,lang)}</p><ul>{p.features.map(f=><li key={f}>{tr(f)}</li>)}</ul></article>)}</div>
<section className="study-school-offer" aria-labelledby="go-titre">
  <p className="study-kicker">{tr('Pour les établissements scolaires')}</p>
  <h2 id="go-titre" className="font-display text-2xl">{tr('Go lycée')}</h2>
  <p className="font-semibold mt-3">{tr('{eleve} par élève et par an + {lycee} par établissement et par an',{eleve:prixAffiche(OFFRE_GO.eleveAnnuelCentimes,lang),lycee:prixAffiche(OFFRE_GO.etablissementAnnuelCentimes,lang)})}</p>
  <p className="mt-3">{tr('Licences réservées aux lycées. Aucun abonnement Go individuel. La durée, les accès et les conditions de facturation sont précisés au devis.')}</p>
  <a className="btn-primary mt-4 inline-block" href="mailto:revizstmg@gmail.com?subject=Licence%20Go%20lyc%C3%A9e">{tr('Demander une licence lycée')}</a>
</section>
<Abonnement />
<div className="study-actions"><Link to="/exemple-bilan" className="study-link">{tr('Voir un exemple de bilan')}</Link><Link to="/mes-notes" className="study-link">{tr('Préparer mon bilan')}<PastillePremium to="/mes-notes" /></Link></div><p className="study-notice">{tr('Les analyses automatiques peuvent se tromper. Les notes sont des estimations expliquées ; aucune note future n’est garantie. Le cours et les indications du professeur restent les références.')}</p><p className="mt-4"><Link to="/cgu" className="underline">{tr('Conditions d’utilisation')}</Link> · <Link to="/confidentialite" className="underline">{tr('Confidentialité')}</Link></p></div>
}
