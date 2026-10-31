import {useEffect,useRef,useState} from 'react'
import {Link,Navigate,useSearchParams} from 'react-router-dom'
import {useStore} from '../store.jsx'
import {useT} from '../i18n.js'
import {getSession,isSignedIn,upsertProfile,updatePassword} from '../auth.js'
import {nomValide,motDePasseValide} from '../formulaires.js'
import {settingsMessages} from '../i18n/settings.js'
import NavigationTabs from '../components/NavigationTabs.jsx'
import Profile from './Profile.jsx'
import './Settings.css'

export default function Settings(){
 const {state}=useStore()
 return <SettingsContent key={state.account?.id||'guest'}/>
}
function SettingsContent(){
 const {state,setProfile,setA11y,setLang,setTheme,logout}=useStore(),t=useT(),m=settingsMessages[state.lang]||settingsMessages.fr
 const [first,setFirst]=useState(state.profile?.firstName||''),[last,setLast]=useState(state.profile?.lastName||''),[photo,setPhoto]=useState(state.profile?.photo||'')
 const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[photoBusy,setPhotoBusy]=useState(false)
 const [params]=useSearchParams(),heading=useRef(null),firstView=useRef(true)
 const groups=[
  {id:'compte',icon:'👤',title:m.account,description:m.accountHint,children:[{id:'profil',title:m.profile,description:m.profileHint},{id:'securite',title:m.security,description:m.securityHint}]},
  {id:'apparence',icon:'🎨',title:m.display,description:m.displayHint,children:[{id:'apparence',title:m.appearance,description:m.themeHint},{id:'onglets',title:m.tabs,description:m.tabsHint}]},
  {id:'revision',icon:'📚',title:m.study,description:m.studyHint,children:[{id:'langues',title:t('studyLanguagesTitle'),description:m.languagesHint},{id:'examen',title:state.track?.level === 'premiere-stmg' ? t('examCountdown') : t('prefBac'),description:t('prefBacHint')}]},
  {id:'notifications',icon:'🔔',title:m.notifications,description:m.notificationsHint,section:'rappels'},
  {id:'accessibilite',icon:'♿',title:t('accessibility'),description:m.accessibilityHint,section:'accessibilite'},
  {id:'donnees',icon:'🔒',title:m.privacy,description:m.privacyHint,children:[{id:'export',title:t('downloadMyData'),description:m.exportHint},{id:'parents',title:t('studentParentCard'),description:m.parentHint},{id:'suppression',title:state.account?.id?t('deleteAccount'):m.clearLocal||'Effacer mes données locales',description:m.deleteHint}]},
  {id:'application',icon:'📱',title:m.application,description:m.applicationHint,section:'application'},
 ]
 const group=groups.find(g=>g.id===params.get('rubrique')),leaf=group?.children?.find(l=>l.id===params.get('reglage'))
 const section=leaf?.id||group?.section
 const invalid=(params.has('rubrique')&&!group)||(params.has('reglage')&&!leaf)
 const view=`${group?.id||''}/${leaf?.id||''}`
 useEffect(()=>{
  setMessage('');setError('')
  if(section!=='securite'){setPassword('');setConfirmation('')}
  if(!firstView.current){window.scrollTo(0,0);heading.current?.focus({preventScroll:true})}
  firstView.current=false
 },[view])
 if(!state.track)return <Navigate to="/" replace/>
 if(invalid)return <Navigate to="/parametres" replace/>
 const save=async(event)=>{event.preventDefault();setError('');setMessage('');if(!nomValide(first)||!nomValide(last,{obligatoire:false})){setError(m.identityError);return}if(state.account?.id&&!isSignedIn()){setError(m.login);return}setBusy(true);try{if(isSignedIn())await upsertProfile({name:`${first.trim()} ${last.trim()}`.trim(),photo:photo||null});if(getSession()?.user?.id!==state.account?.id)return;setProfile({...state.profile,firstName:first.trim(),lastName:last.trim(),photo:photo||undefined});setMessage(m.saved)}catch{setError(m.offline)}finally{setBusy(false)}}
 const changePassword=async(event)=>{event.preventDefault();setError('');setMessage('');if(!motDePasseValide(password)){setError(m.passwordHelp);return}if(password!==confirmation){setError(m.mismatch);return}if(!isSignedIn()){setError(m.login);return}setBusy(true);try{await updatePassword(password);setPassword('');setConfirmation('');setMessage(m.changed)}catch(e){setError(e?.message||m.offline)}finally{setBusy(false)}}
 const choosePhoto=async(event)=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;setError('');if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError(m.invalidPhoto);return}setPhotoBusy(true);let url;try{url=URL.createObjectURL(file);const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const ctx=canvas.getContext('2d');const scale=Math.max(160/image.width,160/image.height),w=image.width*scale,h=image.height*scale;ctx.drawImage(image,(160-w)/2,(160-h)/2,w,h);setPhoto(canvas.toDataURL('image/jpeg',.85))}catch{setError(m.invalidPhoto)}finally{if(url)URL.revokeObjectURL(url);setPhotoBusy(false)}}
 const linkTo=(g,l)=>`/parametres?rubrique=${g}${l?'&reglage='+l:''}`
 const title=leaf?.title||group?.title||t('meTab')
 return <div className="settings-page space-y-5">
  <header className="settings-hero">
   {group&&<Link className="settings-back lien-retour" to={leaf?linkTo(group.id):'/parametres'}>← {leaf?group.title:t('meTab')}</Link>}
   <p className="kicker">{group?t('meTab'):'RévizSTMG'}</p>
   <h1 ref={heading} tabIndex={-1} className="font-display">{title}</h1>
   <p>{leaf?.description||group?.description||m.chooseCategory}</p>
  </header>
  {!group&&<><nav className="settings-categories" aria-label={m.categories}>{groups.map(g=><Link key={g.id} to={linkTo(g.id)} className="settings-category" aria-label={g.title}><span className="settings-category-icon" aria-hidden>{g.icon}</span><span><strong>{g.title}</strong><small>{g.description}</small></span><span className="settings-chevron" aria-hidden>›</span></Link>)}</nav><Link to="/moi" className="settings-progress-link">{m.progress} →</Link></>}
  {group?.children&&!leaf&&<nav className="settings-subcategories" aria-label={group.title}>{group.children.map(l=><Link key={l.id} to={linkTo(group.id,l.id)} aria-label={l.title}><span><strong>{l.title}</strong><small>{l.description}</small></span><span className="settings-chevron" aria-hidden>›</span></Link>)}</nav>}
  {section&&<><div role="status" aria-live="polite">{message}</div>{error&&<p role="alert" className="settings-error">{error}</p>}
  {section==='profil'&&(<section id="settings-profil" className="card p-5"><form onSubmit={save} className="mt-4 space-y-4"><div className="settings-photo">{photo?<img src={photo} alt={m.photo}/>:<span className="monogram" aria-hidden>{first.slice(0,1)}</span>}<div><label>{m.photo}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||photoBusy} onChange={choosePhoto}/></label><small>{m.photoHelp}</small>{photo&&<button type="button" className="underline" onClick={()=>setPhoto('')} disabled={busy}>{m.removePhoto}</button>}</div></div><label>{t('firstName')}<input autoComplete="given-name" value={first} maxLength={40} onChange={e=>setFirst(e.target.value)} disabled={busy}/></label><label>{t('lastName')}<input autoComplete="family-name" value={last} maxLength={40} onChange={e=>setLast(e.target.value)} disabled={busy}/></label><p className="break-all text-sm">{state.account?.email}</p><button className="btn-primary" disabled={busy||photoBusy}>{busy?t('pleaseWait'):m.save}</button></form></section>)}
  {section==='securite'&&(<section id="settings-securite" className="card p-5"><form onSubmit={changePassword} className="mt-4 space-y-4"><label>{m.password}<input type="password" autoComplete="new-password" value={password} maxLength={72} onChange={e=>setPassword(e.target.value)} disabled={busy}/></label><p className="text-sm">{m.passwordHelp}</p><label>{m.confirm}<input type="password" autoComplete="new-password" value={confirmation} maxLength={72} onChange={e=>setConfirmation(e.target.value)} disabled={busy}/></label><button className="btn-primary" disabled={busy||!isSignedIn()}>{busy?t('pleaseWait'):m.change}</button>{!isSignedIn()&&<p className="text-sm">{m.login}</p>}</form><button className="btn-ghost mt-5" onClick={logout} disabled={busy}>{t('signOut')}</button></section>)}
  {section==='apparence'&&(<section id="settings-affichage" className="card p-5"><label className="mt-4">{t('language')}<select value={state.lang||'fr'} onChange={e=>setLang(e.target.value)}>{[['fr','Français'],['en','English'],['es','Español'],['it','Italiano'],['ar','العربية'],['de','Deutsch']].map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><p className="mt-2 text-sm">La langue choisie concerne l’interface. Les cours de STMG et les énoncés de référence restent en français ; une aide à la traduction peut être proposée.</p><div className="mt-4 flex flex-wrap gap-2">{[['light',m.lightMode],['dark',m.darkMode],['system',m.systemMode]].map(([value,label])=><button key={value} className="btn-ghost" aria-pressed={(state.theme??'system')===value} onClick={()=>setTheme(value==='system'?null:value)}>{label}</button>)}</div><button className="mt-4 underline" onClick={()=>window.dispatchEvent(new CustomEvent('stmg-open-customizer'))}>{t('customizeProfile')}</button></section>)}
  {section==='accessibilite'&&(<section className="card p-5"><div className="mt-4 space-y-4">{[['dys','dysMode','dysDesc'],['contrast','contrastMode','contrastDesc'],['big','bigTextMode','bigTextDesc']].map(([key,label,desc])=><label className="settings-toggle" key={key}><input type="checkbox" checked={!!state.a11y?.[key]} onChange={e=>setA11y({[key]:e.target.checked})}/><span><strong>{t(label)}</strong><small>{t(desc)}</small></span></label>)}</div></section>)}
  {section==='onglets'&&<section className="card p-5" aria-label={m.tabs}><NavigationTabs/></section>}
  {['langues','examen','rappels','application','export','parents','suppression'].includes(section)&&<Profile settingsOnly settingsSection={({export:'donnees',rappels:'notifications'})[section]||section}/>}
  </>}
  {group?.id==='donnees'&&!leaf&&<div className="settings-legal"><Link to="/confidentialite">{t('privacyPolicy')}</Link><Link to="/cgu">{t('termsOfUse')}</Link></div>}
 </div>
}
