import {useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {Link,useLocation} from 'react-router-dom'
import {useT} from '../i18n.js'
import {ALL_TABS} from '../navTabs.js'
import {navigationMessages} from '../i18n/navigation.js'
import {useFenetreClavier} from './clavier.js'
import {Icon} from './ui.jsx'
import NavigationTabs from './NavigationTabs.jsx'
import './SiteMobileMenu.css'

export default function SiteMobileMenu(props){
 const [open,setOpen]=useState(false),t=useT()
 return <div className={props.className+' site-menu-trigger'}><button type="button" aria-label={t('menu')} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)} className="site-menu-toggle"><Icon.Menu size={22}/></button>
  {open&&createPortal(<Drawer {...props} onClose={()=>setOpen(false)}/>,document.body)}
 </div>
}
function Drawer({parentSeul,state,isDark,standalone,lang,first,last,mono,photo,onSearch,onDict,onCustomize,onA11y,onToggleTheme,onLang,onSignOut,onClose}){
 const t=useT(),m=navigationMessages[lang]||navigationMessages.fr,{pathname}=useLocation()
 const [editing,setEditing]=useState(false),panel=useRef(null),heading=useRef(null)
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous}},[])
 useFenetreClavier(panel,onClose)
 const run=fn=>()=>{onClose();fn?.()}
 const item=key=>{const entry=ALL_TABS[key];return <Link key={key} to={entry.to} onClick={onClose} aria-current={entry.match.some(prefix=>pathname===prefix||pathname.startsWith(prefix+'/'))?'page':undefined}><span aria-hidden>{entry.icon}</span><span>{t(entry.labelKey)}</span><span aria-hidden>›</span></Link>}
 const edit=value=>{setEditing(value);requestAnimationFrame(()=>{heading.current?.focus();panel.current?.querySelector('.site-menu-scroll')?.scrollTo(0,0)})}
 return <div className="site-menu-overlay no-print" onClick={event=>{if(event.target===event.currentTarget)onClose()}}>
  <div ref={panel} role="dialog" aria-modal="true" aria-label={t('menu')} className="site-menu-panel">
   <header className="site-menu-heading"><div><p>RévizSTMG</p><h2 ref={heading} tabIndex={-1}>{editing?m.choose:t('menu')}</h2></div><button type="button" aria-label={t('close')} onClick={onClose}>✕</button></header>
   <div className="site-menu-scroll">
    {editing?<><button type="button" className="site-menu-back" onClick={()=>edit(false)}>← {t('back')}</button><NavigationTabs/></>:<>
     {(first||last)&&<div className="site-menu-profile"><span className="monogram" aria-hidden>{photo?<img src={photo} alt=""/>:mono}</span><div><strong>{`${first} ${last}`.trim()}</strong><small>{state.account?.role==='prof'?t('roleTeacher'):t('roleStudent')}</small></div></div>}
     {!parentSeul&&<nav aria-label={m.main}><section><h3>{m.learn}</h3>{['accueil','cours','revision','bacblanc'].map(item)}</section><section><h3>{m.community}</h3>{['classe','amis','boutique','classement'].map(item)}</section><details><summary>{m.tools}</summary>{['formules','methodo','programme','defi','coach','coachia','grandoral','etudegestion','badges','favoris'].map(item)}</details></nav>}
     {!parentSeul&&<button type="button" className="site-menu-tabs" onClick={()=>edit(true)}><span aria-hidden>☷</span><span>{m.choose}</span><span aria-hidden>›</span></button>}
     <section className="site-menu-account">{!parentSeul&&item('profil')}<Link to="/parent" onClick={onClose}><span aria-hidden>👨‍👩‍👧</span><span>{t('parentSpace')}</span><span aria-hidden>›</span></Link>{!standalone&&<Link to="/guide" onClick={onClose}><span aria-hidden>🎓</span><span>{t('startGuide')}</span><span aria-hidden>›</span></Link>}{!parentSeul&&<button type="button" onClick={run(onCustomize)}><span aria-hidden>🎨</span><span>{t('customize')}</span><span aria-hidden>›</span></button>}</section>
     <section className="site-menu-settings"><h3>{m.quick}</h3><div>{[{key:'search',icon:'🔍',fn:onSearch},{key:'dictionary',icon:'📖',fn:onDict},{key:'accessibility',icon:'♿',fn:onA11y},{key:isDark?'light':'dark',icon:isDark?'☀️':'🌙',fn:onToggleTheme,keep:true}].filter(entry=>!parentSeul||!['search','dictionary'].includes(entry.key)).map(entry=><button type="button" key={entry.key} onClick={entry.keep?entry.fn:run(entry.fn)}><span aria-hidden>{entry.icon}</span><span>{t(entry.key)}</span></button>)}</div></section>
     <details className="site-menu-languages"><summary>{t('language')} · {lang.toUpperCase()}</summary><div>{[{code:'fr',label:'Français'},{code:'en',label:'English'},{code:'es',label:'Español'},{code:'it',label:'Italiano'},{code:'ar',label:'العربية'},{code:'de',label:'Deutsch'}].map(entry=><button type="button" key={entry.code} aria-pressed={lang===entry.code} onClick={()=>onLang(entry.code)}>{entry.label}</button>)}</div></details>
     {(first||last)&&<button type="button" className="site-menu-signout" onClick={run(onSignOut)}>🚪 {t('signOut')}</button>}
    </>}
   </div>
  </div>
 </div>
}
