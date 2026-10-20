import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { pendingQuizResults, flushQuizResults } from '../quizOutbox.js'
export default function QuizOutboxStatus() {
  const {state}=useStore(),owner=state.account?.id
  const [count,setCount]=useState(0),[busy,setBusy]=useState(false)
  useEffect(()=>{
    let alive=true
    const update=()=>{if(alive)setCount(pendingQuizResults(owner).length)}
    const retry=async()=>{if(!owner || !pendingQuizResults(owner).length)return;setBusy(true);try{await flushQuizResults(owner)}catch{/* reste en attente */}finally{if(alive){setBusy(false);update()}}}
    update();retry()
    window.addEventListener('stmg-quiz-outbox',update);window.addEventListener('online',retry)
    const interval=setInterval(retry,30000)
    return()=>{alive=false;clearInterval(interval);window.removeEventListener('stmg-quiz-outbox',update);window.removeEventListener('online',retry)}
  },[owner])
  if(!count)return null
  return <div role="status" className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100"><div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3"><span>{count} <span>résultat(s) de classe en attente sur cet appareil. Tu n’as pas besoin de refaire le QCM.</span></span><button className="font-semibold underline" disabled={busy} onClick={async()=>{setBusy(true);try{await flushQuizResults(owner)}catch{/* statut conservé */}finally{setBusy(false);setCount(pendingQuizResults(owner).length)}}}>Renvoyer mes résultats</button></div></div>
}
