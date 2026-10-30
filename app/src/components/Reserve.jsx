import {useEffect,useState,useSyncExternalStore} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {useLang,usePublicText} from '../i18n.js'
import {niveauAcces,rafraichirAcces,abonnerAcces,estPagePayante,estPageAvecCompte,graceJusqua,DELAI_ACCES_MS} from '../data/acces.js'
import {OFFRES,prixAffiche} from '../data/abonnement.js'
import {isSignedIn,getSession} from '../auth.js'
import {creerMonCompte} from './CompteRequis.jsx'

// Niveau d'accès lu sur l'appareil, sans réseau ('gratuit' | 'premium' | 'ultimate').
export function useNiveauAcces(){
  return useSyncExternalStore(abonnerAcces,niveauAcces,()=>'gratuit')
}

// Niveau d'accès du compte connecté et indication que l'abonnement a été vérifié sur cette page
// (au plus quelques secondes : sans réponse du serveur, on garde ce qui est connu).
export function useAcces(){
  const niveau=useNiveauAcces()
  const compte=useSyncExternalStore(abonnerAcces,()=>getSession()?.user?.id||null,()=>null)
  const [verifie,setVerifie]=useState(false)
  useEffect(()=>{
    let vivant=true
    setVerifie(false)
    const fin=()=>{if(vivant)setVerifie(true)}
    rafraichirAcces().finally(fin)
    const garde=setTimeout(fin,DELAI_ACCES_MS+500)
    return()=>{vivant=false;clearTimeout(garde)}
  },[compte])
  return {niveau,verifie}
}

// Bandeau de la période de grâce : l'accès offert à un ancien compte et sa date de fin.
export function BandeauGrace(){
  const tr=usePublicText()
  const lang=useLang()
  useNiveauAcces()
  const fin=graceJusqua()
  if(!fin)return null
  const date=new Date(fin).toLocaleDateString(lang||'fr',{calendar:'gregory',numberingSystem:'latn',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})
  return <p role="status" className="study-notice mb-4">{tr('Accès offert jusqu’au {date}. Ensuite, un abonnement Premium ou Ultimate sera nécessaire.',{date})} <Link to="/offres" className="underline">{tr('Voir les offres')}</Link></p>
}

// Les pages hors cours et exercices de base demandent un abonnement (data/acces.js).
export default function GardeAcces({children}){
  const {pathname}=useLocation()
  const tr=usePublicText()
  const lang=useLang()
  const {niveau,verifie}=useAcces()
  const [relecture,setRelecture]=useState(false)
  const payante=estPagePayante(pathname)
  // Un paiement ou une résiliation récents : on relit l'abonnement à chaque ouverture d'une page payante
  // (sans attendre cinq minutes quand l'accès est refusé : le webhook de Stripe peut arriver en retard).
  useEffect(()=>{if(payante)rafraichirAcces({force:niveau==='gratuit'})},[pathname])
  if(!payante)return children
  if(niveau!=='gratuit')return <><BandeauGrace/>{children}</>
  if(!isSignedIn()&&estPageAvecCompte(pathname))return children
  if(!verifie)return <section className="card mx-auto max-w-lg p-6 text-center" aria-busy="true"><p className="text-sm">{tr('Vérification de ton abonnement…')}</p></section>
  const relire=async()=>{setRelecture(true);await rafraichirAcces({force:true});setRelecture(false)}
  return (
    <section className="card mx-auto max-w-lg p-6 text-center" aria-labelledby="reserve-titre">
      <p className="text-4xl" aria-hidden>⭐</p>
      <h1 id="reserve-titre" className="mt-2 font-display text-2xl font-medium">{tr('Réservé aux abonnés')}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tr('Cette page est incluse dans Premium et Ultimate, à partir de {prix} TTC par mois. Les cours et les exercices de base restent gratuits.',{prix:prixAffiche(OFFRES.premium.mensuel.centimes,lang)})}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link to="/offres" className="btn-primary inline-block">{tr('Voir les offres')}</Link>
        <Link to="/cours" className="btn-ghost inline-block">{tr('Retour aux cours')}</Link>
      </div>
      {isSignedIn()
        ?<p className="mt-3"><button type="button" className="text-sm underline" disabled={relecture} onClick={relire}>{tr('Vérifier à nouveau mon abonnement')}</button></p>
        :<p className="mt-3"><button type="button" className="text-sm underline" onClick={creerMonCompte}>{tr('Créer mon compte')}</button></p>}
    </section>
  )
}
