import { useEffect, useState } from 'react'
export default function OfflineStatus() {
  const [status,setStatus]=useState('checking')
  useEffect(()=>{
    let alive=true,timer,port,generation=0
    const check=async()=>{
      const current=++generation;clearTimeout(timer);port?.close()
      if(!('serviceWorker' in navigator)){setStatus('unsupported');return}
      timer=setTimeout(()=>{if(alive)setStatus('waiting')},5000)
      try {
        const registration=await navigator.serviceWorker.ready
        if(!alive || current!==generation)return
        const channel=new MessageChannel();port=channel.port1
        port.onmessage=event=>{if(alive && current===generation){clearTimeout(timer);setStatus(event.data?.ready?'ready':'waiting')}}
        registration.active?.postMessage({type:'OFFLINE_STATUS'},[channel.port2])
      } catch {if(alive)setStatus('waiting')}
    }
    check();navigator.serviceWorker?.addEventListener('controllerchange',check)
    return()=>{alive=false;clearTimeout(timer);port?.close();navigator.serviceWorker?.removeEventListener('controllerchange',check)}
  },[])
  return <section className="card p-4" role="status"><h3 className="font-display font-semibold">Tes cours hors connexion</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{status==='ready'?'✓ Les cours et exercices de cette version sont téléchargés sur cet appareil. Les fonctions de classe, amis et synchronisation nécessitent Internet.':status==='unsupported'?'Ce navigateur ne permet pas de préparer les cours hors connexion.':'Le téléchargement complet des cours n’est pas encore confirmé. Garde une connexion Internet avant de partir réviser hors ligne.'}</p></section>
}
