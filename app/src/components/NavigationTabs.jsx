import {useId,useRef,useState,useEffect} from 'react'
import {useStore} from '../store.jsx'
import {useT} from '../i18n.js'
import {ALL_TABS,TAB_ORDER,resolveTabs} from '../navTabs.js'
import {navigationMessages} from '../i18n/navigation.js'
import './SiteMobileMenu.css'

export default function NavigationTabs(){
 const {state,setTabs}=useStore(),t=useT(),id=useId(),list=useRef(null),hold=useRef(null),gesture=useRef(null)
 const [drag,setDrag]=useState(null),[draft,setDraft]=useState(null),[announcement,setAnnouncement]=useState('')
 const m=navigationMessages[state.lang]||navigationMessages.fr
 const selected=resolveTabs(state.tabs,state.account?.role),display=draft||selected,available=TAB_ORDER.filter(key=>!selected.includes(key))
 const stop=()=>{clearTimeout(hold.current);hold.current=null;gesture.current=null;setDrag(null);setDraft(null)}
 useEffect(()=>()=>clearTimeout(hold.current),[])
 useEffect(()=>{stop()},[state.account?.id])
 const move=(index,delta)=>{const next=[...selected],target=index+delta;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];setTabs(next);setAnnouncement(t(ALL_TABS[next[target]].labelKey)+' '+(target+1)+'/'+next.length)}
 const start=(event,key)=>{if(event.button!==0)return;stop();const node=list.current;gesture.current={key,x:event.clientX,y:event.clientY,active:false,order:[...selected],pointer:event.pointerId};node.setPointerCapture(event.pointerId);hold.current=setTimeout(()=>{if(!gesture.current)return;gesture.current.active=true;setDrag(key);setDraft([...selected]);setAnnouncement(m.dragActive)},350)}
 const motion=event=>{const g=gesture.current;if(!g)return;if(!g.active){if(Math.hypot(event.clientX-g.x,event.clientY-g.y)>10)stop();return}event.preventDefault();const rows=[...list.current.querySelectorAll('li')],target=rows.findIndex(row=>{const r=row.getBoundingClientRect();return event.clientY>=r.top&&event.clientY<=r.bottom});if(target<0)return;const source=g.order.indexOf(g.key);if(source===target)return;const next=[...g.order];next.splice(source,1);next.splice(target,0,g.key);g.order=next;setDraft(next);setAnnouncement(t(ALL_TABS[g.key].labelKey)+' '+(target+1)+'/'+next.length);const scroll=list.current.closest('.site-menu-scroll');if(scroll){const r=scroll.getBoundingClientRect();if(event.clientY>r.bottom-60)scroll.scrollTop+=24;else if(event.clientY<r.top+60)scroll.scrollTop-=24}}
 const finish=event=>{const g=gesture.current;if(g?.active){setTabs(g.order);setAnnouncement(m.dragSaved)}if(event.currentTarget.hasPointerCapture?.(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);stop()}
 return <section className="navigation-tabs-editor" aria-labelledby={id}>
  <h3 id={id}>{t('secTabs')}</h3><p>{t('tabsHint')} <span>{selected.length}/5</span></p><p id={id+'-help'}>{m.dragHelp}</p><span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  <ol ref={list} onPointerMove={motion} onPointerUp={finish} onPointerCancel={stop} onLostPointerCapture={stop}>{display.map((key,index)=>{const item=ALL_TABS[key],label=t(item.labelKey);return <li key={key} data-tab-id={key} data-dragging={drag===key||undefined}><button type="button" className="tab-drag-handle" aria-label={m.drag+' '+label} aria-describedby={id+'-help'} onPointerDown={e=>start(e,key)} onKeyDown={e=>{if(e.key==='Escape'){stop();return}if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();move(index,e.key==='ArrowUp'?-1:1)}}}><span aria-hidden>⠿</span></button><span aria-hidden>{item.icon}</span><strong>{label}</strong><div>
   <button type="button" aria-label={m.up+' '+label} disabled={index===0||!!drag} onClick={()=>move(index,-1)}>↑</button>
   <button type="button" aria-label={m.down+' '+label} disabled={index===display.length-1||!!drag} onClick={()=>move(index,1)}>↓</button>
   <button type="button" aria-label={m.remove+' '+label} disabled={selected.length<=2||!!drag} onClick={()=>setTabs(selected.filter(value=>value!==key))}>×</button>
  </div></li>})}</ol>
  <label htmlFor={id+'-add'}>{t('tabsAdd')}</label><select id={id+'-add'} value="" disabled={selected.length>=5||!!drag} onChange={event=>{if(event.target.value&&selected.length<5)setTabs([...selected,event.target.value])}}><option value="">{t('tabsAdd')}</option>{available.map(key=><option key={key} value={key}>{t(ALL_TABS[key].labelKey)}</option>)}</select>
  {selected.length>=5&&<p>{m.limit}</p>}
  <button type="button" className="navigation-tabs-reset" onClick={()=>setTabs(null)} disabled={!!drag}>{t('tabsReset')}</button>
 </section>
}
