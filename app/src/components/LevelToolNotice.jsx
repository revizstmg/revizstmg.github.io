import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
// Outil d'un autre niveau : on le dit clairement et le contenu reste masqué
// tant que l'élève ne choisit pas de le voir quand même.
export default function LevelToolNotice({level, children}) {
  const {state}=useStore()
  const [voir,setVoir]=useState(false)
  if(state.track?.level===level || state.account?.role==='prof' || voir)return children ?? null
  return <aside className="card mb-4 border border-amber-700/30 p-4 text-sm"><p>{level==='premiere-stmg'?'Cet outil prépare l’étude de gestion de Première STMG. Il ne correspond pas à ton niveau.':'Cet outil prépare le Grand Oral de Terminale STMG. Il ne correspond pas à ton niveau.'}</p><div className="mt-3 flex flex-wrap items-center gap-4"><Link className="inline-block font-semibold underline" to={level==='premiere-stmg'?'/grand-oral':'/etude-de-gestion'}>Voir l’outil de mon niveau →</Link><button type="button" className="underline" onClick={()=>setVoir(true)}>Afficher quand même cet outil</button></div></aside>
}
