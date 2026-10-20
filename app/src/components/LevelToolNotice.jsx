import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
export default function LevelToolNotice({level}) {
  const {state}=useStore()
  if(state.track?.level===level || state.account?.role==='prof')return null
  return <aside className="card mb-4 border border-amber-700/30 p-4 text-sm"><p>{level==='premiere-stmg'?'Cet outil prépare l’étude de gestion de Première STMG.':'Cet outil prépare le Grand Oral de Terminale STMG.'}</p><Link className="mt-2 inline-block font-semibold underline" to={level==='premiere-stmg'?'/grand-oral':'/etude-de-gestion'}>Voir l’outil de mon niveau →</Link></aside>
}
