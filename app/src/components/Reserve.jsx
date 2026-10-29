import {useEffect,useState,useSyncExternalStore} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {useLang,usePublicText} from '../i18n.js'
import {niveauAcces,rafraichirAcces,abonnerAcces,estPagePayante,graceJusqua,PAGES_AVEC_COMPTE} from '../data/acces.js'
import {isSignedIn} from '../auth.js'

// Niveau d'accès du compte connecté ('gratuit' | 'premium' | 'ultimate') et
// indication que l'abonnement a été vérifié au moins une fois sur cette page.
export function useAcces(){
  const niveau=useSyncExternalStore(abonnerAcces,niveauAcces,()=>'gratuit')
  const [verifie,setVerifie]=useState(niveau!=='gratuit')
  useEffect(()=>{
    let vivant=true
    rafraichirAcces().finally(()=>{if(vivant)setVerifie(true)})
    const relire=()=>{rafraichirAcces({force:true})}
    window.addEventListener('stmg-session-change',relire)
    return()=>{vivant=false;window.removeEventListener('stmg-session-change',relire)}
  },[])
  return {niveau,verifie}
}

// Les pages hors cours et exercices de base demandent un abonnement (data/acces.js).
export default function GardeAcces({children}){
  const {pathname}=useLocation()
  const tr=usePublicText()
  const lang=useLang()
  const {niveau,verifie}=useAcces()
  if(!estPagePayante(pathname))return children
  if(niveau!=='gratuit'){
    // Ancien compte sans abonnement : accès offert pendant la période de grâce, annoncé ici.
    const fin=graceJusqua()
    if(!fin)return children
    const date=new Date(fin).toLocaleDateString(lang||'fr',{calendar:'gregory',numberingSystem:'latn',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})
    return <>
      <p role="status" className="study-notice mb-4">{tr('Accès offert jusqu’au {date}. Ensuite, un abonnement Premium ou Ultimate sera nécessaire.',{date})} <Link to="/offres" className="underline">{tr('Voir les offres')}</Link></p>
      {children}
    </>
  }
  if(!isSignedIn()&&PAGES_AVEC_COMPTE.some(p=>pathname===p||pathname.startsWith(`${p}/`)))return children
  if(!verifie)return <section className="card mx-auto max-w-lg p-6 text-center" aria-busy="true"><p className="text-sm">{tr('Vérification de ton abonnement…')}</p></section>
  return (
    <section className="card mx-auto max-w-lg p-6 text-center" aria-labelledby="reserve-titre">
      <p className="text-4xl" aria-hidden>⭐</p>
      <h1 id="reserve-titre" className="mt-2 font-display text-2xl font-medium">{tr('Réservé aux abonnés')}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tr('Les cours et les exercices de base restent gratuits. Le reste du site, dont le bac blanc, les sujets et les outils de révision, est inclus dans Premium et Ultimate.')}</p>
      <Link to="/offres" className="btn-primary mt-4 inline-block">{tr('Voir les offres')}</Link>
    </section>
  )
}
