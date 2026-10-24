import {useId} from 'react'
import {useStore} from '../store.jsx'
import {useT} from '../i18n.js'
import {ALL_TABS,TAB_ORDER,resolveTabs} from '../navTabs.js'
import {navigationMessages} from '../i18n/navigation.js'
import './SiteMobileMenu.css'

// Le même éditeur dans le menu et la personnalisation, avec les préférences
// existantes du compte : 2 à 5 raccourcis, ordre conservé par setTabs.
export default function NavigationTabs(){
 const {state,setTabs}=useStore(),t=useT(),id=useId()
 const m=navigationMessages[state.lang]||navigationMessages.fr
 const selected=resolveTabs(state.tabs,state.account?.role),available=TAB_ORDER.filter(key=>!selected.includes(key))
 const move=(index,delta)=>{const next=[...selected],target=index+delta;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];setTabs(next)}
 return <section className="navigation-tabs-editor" aria-labelledby={id}>
  <h3 id={id}>{t('secTabs')}</h3><p>{t('tabsHint')} <span aria-live="polite">{selected.length}/5</span></p>
  <ol>{selected.map((key,index)=>{const item=ALL_TABS[key],label=t(item.labelKey);return <li key={key} data-tab-id={key}><span aria-hidden>{item.icon}</span><strong>{label}</strong><div>
   <button type="button" aria-label={m.up+' '+label} disabled={index===0} onClick={()=>move(index,-1)}>↑</button>
   <button type="button" aria-label={m.down+' '+label} disabled={index===selected.length-1} onClick={()=>move(index,1)}>↓</button>
   <button type="button" aria-label={m.remove+' '+label} disabled={selected.length<=2} onClick={()=>setTabs(selected.filter(value=>value!==key))}>×</button>
  </div></li>})}</ol>
  <label htmlFor={id+'-add'}>{t('tabsAdd')}</label><select id={id+'-add'} value="" disabled={selected.length>=5} onChange={event=>{if(event.target.value&&selected.length<5)setTabs([...selected,event.target.value])}}><option value="">{t('tabsAdd')}</option>{available.map(key=><option key={key} value={key}>{t(ALL_TABS[key].labelKey)}</option>)}</select>
  {selected.length>=5&&<p>{m.limit}</p>}
  <button type="button" className="navigation-tabs-reset" onClick={()=>setTabs(null)}>{t('tabsReset')}</button>
 </section>
}
