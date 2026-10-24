import {useEffect,useId,useRef,useState} from 'react'
import {useFenetreClavier} from './clavier.js'

// Le dialogue natif isole la page derrière le panneau et garde la tabulation
// à l’intérieur. Le crochet clavier commun évite un arrêt de tabulation
// supplémentaire sur la racine défilante du dialogue.
export default function ClassNavigation({tabs,tab,profSection,role,className,m,t,onSelect}){
 const [open,setOpen]=useState(false)
 const dialog=useRef(null),id=useId()
 const teacher=role==='prof'
 const current=tab==='prof'&&profSection!=='board'?t(profSection==='groups'?'profGroups':'profSettings'):tabs.find(item=>item.id===tab)?.label
 useEffect(()=>{
  if(!open)return
  const panel=dialog.current
  panel.showModal()
  const previous=document.body.style.overflow
  document.body.style.overflow='hidden'
  const desktop=window.matchMedia('(min-width: 768px)')
  const resize=()=>{if(desktop.matches)setOpen(false)}
  desktop.addEventListener('change',resize)
  resize()
  return()=>{desktop.removeEventListener('change',resize);panel.close();document.body.style.overflow=previous}
 },[open])
 useFenetreClavier(dialog,()=>setOpen(false),open)
 const choose=(id,action)=>{setOpen(false);onSelect(id,action)}
 const groups=[
  {title:m.learning,items:tabs.filter(item=>['overview','quiz','wall'].includes(item.id))},
  {title:m.community,items:tabs.filter(item=>['members','goal','rank'].includes(item.id))},
  ...(teacher?[{title:m.management,items:[
   {...tabs.find(item=>item.id==='prof'),action:'board'},
   {id:'prof',action:'groups',label:t('profGroups'),icon:'🧩'},
   {id:'prof',action:'settings',label:m.settings,icon:'⚙'}
  ]}]:[])
 ]
 return <>
  <div className="class-mobile-navigation">
   <button type="button" className="class-menu-trigger" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(true)}>
    <span className="class-burger-icon" aria-hidden><i/><i/><i/></span>
    <span><strong>{m.menu}</strong><small>{current}</small></span><span aria-hidden>⌄</span>
   </button>
  </div>
  <dialog id={id} ref={dialog} className="class-mobile-dialog no-print" aria-labelledby={id+'-title'} onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)setOpen(false)}}}>
   <header className="class-menu-header"><div><p>{m.menuHelp}</p><h2 id={id+'-title'}>{m.menu}</h2><span translate="no">{className}</span></div><button type="button" aria-label={t('close')} onClick={()=>setOpen(false)}>✕</button></header>
   <nav className="class-menu-sections" aria-label={m.menu}>
    {groups.map(group=><section key={group.title}><h3>{group.title}</h3><div>{group.items.map(item=>{
     const active=tab===item.id&&(item.id!=='prof'||profSection===item.action)
     return <button type="button" key={item.id+':'+(item.action||'')} aria-current={active?'page':undefined} onClick={()=>choose(item.id,item.action)}><span className="class-menu-item-icon" aria-hidden>{item.icon}</span><span>{item.label}</span><span className="class-menu-indicator" aria-hidden>{active?'●':'›'}</span></button>
    })}</div></section>)}
   </nav>
  </dialog>
  <nav className="class-navigation class-desktop-navigation" aria-label={m.overview}>
   <div>{tabs.filter(item=>['overview','quiz','wall',teacher?'prof':'members'].includes(item.id)).map(item=><button type="button" key={item.id} aria-current={tab===item.id?'page':undefined} onClick={()=>onSelect(item.id)}><span aria-hidden>{item.icon}</span>{item.label}</button>)}</div>
   <details><summary>{m.more}</summary><div>{tabs.filter(item=>!['overview','quiz','wall',teacher?'prof':'members'].includes(item.id)).map(item=><button type="button" key={item.id} onClick={event=>{event.currentTarget.closest('details').open=false;onSelect(item.id)}}>{item.label} →</button>)}</div></details>
  </nav>
 </>
}
