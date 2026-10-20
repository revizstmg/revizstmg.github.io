import { useEffect, useRef, useState } from 'react'
export default function LegalContents() {
  const ref=useRef(null),[items,setItems]=useState([])
  useEffect(()=>{
    const root=ref.current?.parentElement
    if(!root)return
    const scan=()=>{
      const next=[...root.querySelectorAll('h2')].map((node,i)=>{
        if(!node.id)node.id=`section-legale-${i+1}`
        node.style.scrollMarginTop='6rem'
        return {id:node.id,title:node.textContent}
      })
      setItems(old=>JSON.stringify(old)===JSON.stringify(next)?old:next)
    }
    scan();const observer=new MutationObserver(scan);observer.observe(root,{childList:true,subtree:true,characterData:true})
    return()=>observer.disconnect()
  },[])
  return <nav ref={ref} aria-label="Sommaire" className="card p-4"><p className="font-semibold">Sommaire</p><ol className="mt-2 space-y-2 text-sm">{items.map(item=><li key={item.id}><a className="underline" href={`#${item.id}`} onClick={event=>{event.preventDefault();document.getElementById(item.id)?.scrollIntoView({behavior:'smooth'})}}>{item.title}</a></li>)}</ol></nav>
}
