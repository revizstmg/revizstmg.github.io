import { nombre } from '../format.js'
import {Link} from 'react-router-dom'
import {useStore} from '../store.jsx'
import {SHOP_REWARDS,rewardProgress,rewardItemIds,shopById} from '../data/shop.js'
import {usePublicText} from '../i18n.js'
import './RewardVault.css'
export default function RewardVault({onCollection}){
 const {state,claimShopReward}=useStore(),tr=usePublicText()
 const rewards=SHOP_REWARDS.filter(r=>r.itemIds||r.collection),next=rewards.find(r=>!rewardProgress(state,r).claimed)
 return <section className="reward-vault" aria-labelledby="vault-title">
  <div className="vault-heading"><div><p className="kicker">{tr('À gagner maintenant')}</p><h2 id="vault-title" className="font-display text-3xl">{tr('Des collections à gagner')}</h2><p>{tr('Des objets permanents pour ton profil, sans dépenser tes pièces.')}</p></div><Link to="/seance" className="btn-primary">{tr('Gagner des XP →')}</Link></div>
  <p className="vault-boundary">{tr('Les suivis pédagogiques personnalisés restent réservés à Ultimate.')}</p>
  {next&&<p className="vault-next">🎯 {tr('Ton prochain objectif :')} <strong>{tr(next.name)}</strong> · {rewardProgress(state,next).pct} % {tr('des conditions remplies')}</p>}
  <div className="vault-grid">{rewards.map((r,i)=>{
   const p=rewardProgress(state,r),items=rewardItemIds(r).map(id=>shopById[id])
   return <article className="vault-card" key={r.id} aria-label={tr(r.name)}>
    <div className="vault-number"><span aria-hidden>{r.icon}</span><span>{String(i+1).padStart(2,'0')}</span></div>
    <h3 className="font-display text-2xl">{tr(r.name)}</h3><p>{tr(r.gift)}</p>
    {!r.collection&&<ul className="vault-objects" aria-label={tr('Les objets du lot')}>{items.map(item=><li key={item.id}><span aria-hidden>{item.icon}</span> {tr(item.name)}</li>)}</ul>}
    <ul className="vault-conditions"><li>{state.xp>=r.minXp?'✅':'○'} {nombre(r.minXp,state.lang||'fr')} XP</li><li>{p.tests>=r.tests?'✅':'○'} {tr('{tests} tests de thèmes différents à {score} % minimum',{tests:nombre(r.tests,state.lang||'fr'),score:nombre(r.score,state.lang||'fr')})} ({Math.min(p.tests,r.tests)}/{r.tests})</li></ul>
    <progress value={p.pct} max={100} aria-label={tr('Progression {v0}',{v0:tr(r.name)})}/>
    {p.claimed?<>
     <p className="vault-owned">{tr('✅ Récompense débloquée')}</p>
     {p.missingItems.length?<><p className="text-sm">{tr('Ton ancien lot donne droit à ces nouveaux objets. Tes gels et tes achats sont conservés.')}</p><button type="button" onClick={()=>claimShopReward(r.id)} className="btn-primary">{tr('Récupérer les nouveaux objets')}</button></>:<button type="button" onClick={onCollection} className="btn-primary">{tr('Choisir mes objets')}</button>}
    </>:<button disabled={!p.eligible} onClick={()=>claimShopReward(r.id)} className="btn-primary">{tr(p.eligible?'Débloquer mon lot':'Objectif en cours')}</button>}
   </article>
  })}</div>
 </section>
}
