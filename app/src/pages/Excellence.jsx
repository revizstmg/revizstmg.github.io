import {useEffect,useRef,useState} from 'react'
import {Link,Navigate} from 'react-router-dom'
import {createPortal} from 'react-dom'
import {useFenetreClavier} from '../components/clavier.js'
import {useStore} from '../store.jsx'
import {usePublicText} from '../i18n.js'
import {EXCELLENCE_SUBJECTS,EXCELLENCE_RUBRIC,readExcellence,excellenceKey,correctExcellence} from '../data/excellence.js'
import {withControlDeadline} from '../controlRequest.js'
import './Excellence.css'
const empty={answer:'',startedAt:null,submitted:false,submittedAt:null,result:null}
export default function Excellence(){
 const {state}=useStore()
 if(state.track?.level==='premiere-stmg')return <Navigate to="/bac-blanc" replace/>
 return <ExcellenceSpace key={state.account?.id||'guest'} owner={state.account?.id}/>
}
function ExcellenceSpace({owner}){
 const [reader,setReader]=useState(false)
 const tr=usePublicText(),[drafts,setDrafts]=useState(()=>readExcellence(owner)),[selected,setSelected]=useState(null),[tab,setTab]=useState('copy'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saveError,setSaveError]=useState(false),[consent,setConsent]=useState(false),[now,setNow]=useState(Date.now()),[texts,setTexts]=useState([]),[textError,setTextError]=useState(false)
 const abort=useRef(null),mounted=useRef(true),lock=useRef(false),title=useRef(null),first=useRef(true)
 const subject=EXCELLENCE_SUBJECTS.find(s=>s.id===selected),draft=drafts[selected]||empty
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;abort.current?.abort(Error('cancelled'))}},[])
 useEffect(()=>{if(!owner)return;try{localStorage.setItem(excellenceKey(owner),JSON.stringify(drafts));setSaveError(false)}catch{setSaveError(true)}},[drafts,owner])
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[])
 useEffect(()=>{if(first.current){first.current=false;return}title.current?.focus();window.scrollTo(0,0);setError('');setConsent(false)},[selected])
 useEffect(()=>{
  setTexts([]);setTextError(false);if(!selected)return
  const ac=new AbortController()
  fetch(`${import.meta.env.BASE_URL}excellence/${selected}/texte.json`,{signal:ac.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(t=>{if(!Array.isArray(t)||t.some(p=>typeof p!=='string'))throw Error();setTexts(t)}).catch(()=>{if(!ac.signal.aborted)setTextError(true)})
  return()=>ac.abort()
 },[selected])
 const update=values=>{setDrafts(all=>({...all,[selected]:{...(all[selected]||empty),...values}}));setError('')}
 const download=()=>{const blob=new Blob([`${subject.title}\nSession ${subject.session}\n\n${draft.answer}`],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`copie-excellence-${selected}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 const send=async()=>{
  if(lock.current||!consent||!draft.answer.trim()||!owner)return
  lock.current=true;setBusy(true);setError('');const ac=new AbortController();abort.current=ac
  try{const result=await withControlDeadline(signal=>correctExcellence(selected,draft.answer,owner,signal),ac,150000);if(mounted.current&&!ac.signal.aborted){update({result});setConsent(false);requestAnimationFrame(()=>document.getElementById('excellence-result')?.focus())}}
  catch(e){if(mounted.current)setError(tr(e.message==='login_required'?'Reconnecte-toi pour faire corriger ta copie.':e.message==='cancelled'?'Attente annulée. Ta copie est conservée.':e.message==='timeout'?'La correction prend trop de temps. Ta copie est conservée ; réessaie.':e.message==='rate_limit'?'Trop de demandes. Patiente avant de réessayer.':e.message==='documents_unavailable'?'Le dossier officiel ne peut pas être chargé pour la correction. Ta copie est conservée ; réessaie plus tard.':['provider_unavailable','provider_unreachable'].includes(e.message)?'Le service de correction est temporairement indisponible. Ta copie est conservée ; réessaie plus tard.':e.message==='invalid_response'?'La correction reçue est incomplète. Aucune note n’a été attribuée. Ta copie est conservée.':'La correction a échoué. Ta copie est conservée ; réessaie.'))}
  finally{lock.current=false;if(mounted.current)setBusy(false)}
 }
 const elapsed=draft.startedAt?Math.max(0,Math.floor(((draft.submittedAt||now)-draft.startedAt)/1000)):0,left=Math.max(0,14400-elapsed)
 return <div className="excellence-page">
  {reader&&subject&&<GrandDossier subject={subject} onClose={()=>setReader(false)}/>}
  <Link className="lien-retour no-print" to="/bac-blanc">← {tr('Bac blanc')}</Link>
  <header className="excellence-hero"><p className="kicker">🏛️ {tr('Économie')}</p><h1 ref={title} tabIndex={-1}>{tr('Prix de l’excellence économique')}</h1><p>{tr('Un dossier à analyser. Une réflexion à construire.')}</p><small>{tr('Entraînement indépendant sur des sujets officiels archivés. Ce site n’inscrit pas au concours et ne représente pas son jury.')}</small></header>
  {!subject?<>
   <section aria-label={tr('Choisir un sujet')} className="excellence-subjects">{EXCELLENCE_SUBJECTS.map((s,i)=><article key={s.id}><div className="excellence-cover" lang="fr" translate="no" aria-hidden><span>{String(i+1).padStart(2,'0')}</span><div><p>PRIX DE L’EXCELLENCE ÉCONOMIQUE</p><strong>{s.session}</strong><hr/><p>{s.title}</p><small>4 h · {s.pages} pages</small></div></div><div className="excellence-subject-body"><p className="kicker">{s.session}</p><h2 lang="fr">{s.title}</h2><p>{tr('4 heures')} · {s.pages} {tr('pages')} · {tr('Composition rédigée')}</p><button className="btn-primary" onClick={()=>setSelected(s.id)}>{tr(drafts[s.id]?.answer?'Reprendre ma copie':'Ouvrir le sujet')}</button><a href={s.sourcePage} target="_blank" rel="noopener noreferrer">{tr('Source officielle')} ↗</a></div></article>)}</section>
   <section className="card p-5"><h2 className="font-display text-2xl">{tr('Comment ça marche ?')}</h2><ol className="mt-3 list-decimal space-y-2 pl-5"><li>{tr('Choisis une session et lis le dossier complet.')}</li><li>{tr('Rédige ta composition à côté des documents. Ta copie reste sur cet appareil.')}</li><li>{tr('Rends ta copie pour obtenir une correction détaillée et une note indicative sur 20.')}</li></ol><p className="mt-3 text-sm">{tr('Les sujets sont en français. Les données et situations sont celles de leur année de publication.')}</p></section>
  </>:<>
   <div className="excellence-toolbar no-print"><button className="btn-ghost" disabled={busy} onClick={()=>setSelected(null)}>← {tr('Les sujets')}</button><strong lang="fr">{subject.title}</strong><a href={`${import.meta.env.BASE_URL}excellence/${selected}/sujet.pdf`} target="_blank" rel="noopener noreferrer">{tr('PDF complet')} ↗</a><a href={subject.source} target="_blank" rel="noopener noreferrer">{tr('Original')} ↗</a></div>
   {!owner&&<p role="status" className="card p-4">{tr('Les documents sont accessibles sans compte. Connecte-toi pour rédiger, retrouver ta copie et demander sa correction.')}</p>}
   {saveError&&<p role="alert" className="card p-4">{tr('Le navigateur ne peut pas enregistrer ta copie. Télécharge-la avant de quitter cette page.')}</p>}
   <div className="excellence-tabs" role="group" aria-label={tr('Espace de travail')}><button id="ex-tab-copy" aria-controls="ex-copy" aria-pressed={tab==='copy'} onClick={()=>setTab('copy')}>{tr('Ma copie')}</button><button id="ex-tab-documents" aria-controls="ex-documents" aria-pressed={tab==='documents'} onClick={()=>setTab('documents')}>{tr('Documents')}</button></div>
   <div className="excellence-workspace">
    <section id="ex-copy" aria-label={tr('Ma copie')} className={`excellence-copy ${tab==='copy'?'is-mobile-active':''}`}>
     <header><div><h2>{tr('Ma copie')}</h2><p>{tr('Session')} {subject.session}</p></div>{draft.startedAt&&<p className="excellence-time" aria-label={tr('Temps restant')}>{left?`${Math.floor(left/3600)}:${String(Math.floor(left/60)%60).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`:tr('Temps écoulé')}</p>}</header>
     {!draft.startedAt?<div className="excellence-start"><p>{tr('Rédige une réflexion structurée en mobilisant le dossier et tes connaissances. Le repère de quatre heures commence quand tu le décides ; aucune copie ne sera envoyée automatiquement.')}</p><button className="btn-primary" disabled={!owner} onClick={()=>update({startedAt:Date.now()})}>{tr('Commencer ma copie')}</button></div>:<>
      <label className="excellence-answer-label" htmlFor="excellence-answer">{tr('Ta composition')}</label><textarea id="excellence-answer" lang="fr" spellCheck maxLength={60000} disabled={busy||draft.submitted||!owner} value={draft.answer} onChange={e=>update({answer:e.target.value,result:null})} placeholder={tr('Introduction, développement, conclusion…')}/>
      <div className="excellence-copy-footer"><small>{draft.answer.length.toLocaleString()} / 60 000 {tr('caractères')} · {tr('Copie locale, sur cet appareil')}</small><button className="underline" disabled={!draft.answer} onClick={download}>{tr('Télécharger ma copie')}</button></div>
      {!draft.submitted?<button className="btn-primary" disabled={!draft.answer.trim()||busy} onClick={()=>{update({submitted:true,submittedAt:Date.now()});setConsent(false)}}>{tr('Rendre ma copie')}</button>:<div className="excellence-submit"><h3>{tr('Copie remise')}</h3><p>{tr('Ta copie reste disponible. La correction est indicative et peut comporter des erreurs. Elle ne donne ni classement ni résultat officiel au concours.')}</p><details><summary>{tr('Voir la grille sur 20')}</summary><ul>{EXCELLENCE_RUBRIC.map(r=><li key={r.id}>{tr(r.label)} · {r.max} {tr('points')}</li>)}</ul><p>{tr('Grille d’entraînement RévizSTMG, distincte du barème officiel du jury.')}</p></details>{!draft.result&&<><label className="excellence-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/><span>{tr('J’accepte l’envoi de ma copie et du dossier à Gemini pour la correction. Je n’ai inclus ni nom ni donnée personnelle.')}</span></label><button className="btn-primary" disabled={busy||!consent} onClick={send}>{tr('Corriger ma copie')}</button></>}<button className="btn-ghost" disabled={busy} onClick={()=>{if(!draft.result||window.confirm(tr('Modifier ta copie effacera cette correction. Continuer ?')))update({submitted:false,submittedAt:null,result:null});setConsent(false)}}>{tr('Revenir à ma copie')}</button></div>}
     </>}
     <details className="excellence-rubric"><summary>{tr('Grille d’entraînement')}</summary><p>{tr('Grille d’entraînement RévizSTMG, distincte du barème officiel du jury.')}</p><ul>{EXCELLENCE_RUBRIC.map(r=><li key={r.id}>{tr(r.label)} : {r.max} {tr('points')}</li>)}</ul></details>
     {busy&&<div className="mt-3"><p role="status">{tr('Lecture du dossier et correction de ta composition…')}</p><button className="btn-ghost mt-2" onClick={()=>abort.current?.abort(Error('cancelled'))}>{tr('Annuler l’attente')}</button></div>}{error&&<p role="alert" className="mt-3">{error}</p>}
    </section>
    <section id="ex-documents" aria-label={tr('Documents')} className={`excellence-documents ${tab==='documents'?'is-mobile-active':''}`}><header><h2>{tr('Le dossier')}</h2><button className="btn-ghost" onClick={()=>setReader(true)}>{tr('Agrandir le PDF')}</button><p>{subject.pages} {tr('pages')} · {tr('Défile indépendamment de ta copie')}</p></header><div className="excellence-document-scroll" tabIndex={0} aria-label={tr('Pages du dossier')} lang="fr">{Array.from({length:subject.pages},(_,i)=><figure key={i}><img src={`${import.meta.env.BASE_URL}excellence/${selected}/${i+1}.jpg`} alt={`${tr('Page')} ${i+1} / ${subject.pages}`} loading={i<2?'eager':'lazy'} width="992" height="1404" onError={e=>{e.currentTarget.hidden=true}}/><figcaption>{tr('Page')} {i+1} / {subject.pages}</figcaption>{texts[i]&&<details><summary>{tr('Lire le texte de la page')}</summary><p className="whitespace-pre-wrap">{texts[i]}</p></details>}</figure>)}{textError&&<p role="alert">{tr('La version texte est indisponible. Ouvre le PDF complet ou réessaie plus tard.')}</p>}</div></section>
   </div>
   {draft.result&&<section className="excellence-result card p-5 sm:p-7" lang="fr"><h2 id="excellence-result" tabIndex={-1}>{tr('Note indicative')} · {draft.result.total}/20</h2><p>{draft.result.feedback}</p><div className="excellence-criteria">{draft.result.criteria.map(c=><article key={c.id}><h3>{tr(EXCELLENCE_RUBRIC.find(r=>r.id===c.id).label)} · {c.points}/{EXCELLENCE_RUBRIC.find(r=>r.id===c.id).max}</h3><p>{c.feedback}</p></article>)}</div><h3>{tr('Tes points forts')}</h3><ul>{draft.result.strengths.map((s,i)=><li key={i}>{s}</li>)}</ul><h3>{tr('Tes priorités')}</h3><ol>{draft.result.priorities.map((s,i)=><li key={i}>{s}</li>)}</ol>{!!draft.result.passages.length&&<><h3>{tr('Retour sur ta copie')}</h3>{draft.result.passages.map((p,i)=><article key={i}><blockquote>{p.quote}</blockquote><p>{p.feedback}</p><p><strong>{tr('Pour améliorer ce passage')} :</strong> {p.suggestion}</p></article>)}</>}<details><summary>{tr('Une proposition de plan')}</summary><ol>{draft.result.outline.map((s,i)=><li key={i}>{s}</li>)}</ol></details><p className="text-sm">{tr('Correction automatique indicative. Relis-la avec le dossier et demande conseil à ton professeur en cas de désaccord.')}</p></section>}
  </>}
 </div>
}

function GrandDossier({subject,onClose}){
 const [zoom,setZoom]=useState(()=>window.innerWidth<768?200:100)
 const tr=usePublicText(),panel=useRef(null),url=`${import.meta.env.BASE_URL}excellence/${subject.id}/sujet.pdf`
 useFenetreClavier(panel,onClose)
 useEffect(()=>{const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=before}},[])
 return createPortal(<section ref={panel} role="dialog" aria-modal="true" aria-label={tr('Le dossier')} className="excellence-pdf-reader"><header role="group" aria-label={tr('Le dossier')}><h2>{subject.title}</h2><a className="btn-primary" href={url} target="_blank" rel="noopener noreferrer">{tr('Ouvrir le PDF dans un nouvel onglet')} ↗</a><div className="excellence-zoom"><button className="btn-ghost" aria-label={tr('Réduire le zoom')} disabled={zoom<=75} onClick={()=>setZoom(z=>z-25)}>−</button><output aria-live="polite">{zoom}%</output><button className="btn-ghost" aria-label={tr('Augmenter le zoom')} disabled={zoom>=250} onClick={()=>setZoom(z=>z+25)}>+</button></div><button className="btn-ghost" onClick={onClose}>{tr('Fermer')}</button></header><div className="excellence-reader-pages" tabIndex={0} role="region" aria-label={tr('Pages du dossier')}>{Array.from({length:subject.pages},(_,i)=><figure key={i} style={{width:`${zoom}%`,maxWidth:`${zoom*10}px`}}><img src={`${import.meta.env.BASE_URL}excellence/${subject.id}/${i+1}.jpg`} alt={`${tr('Page')} ${i+1} / ${subject.pages}`} loading={i?'lazy':'eager'} width="992" height="1404"/><figcaption>{tr('Page')} {i+1} / {subject.pages}</figcaption></figure>)}</div><p>{tr('Utilise le zoom du lecteur ou ouvre le PDF dans un nouvel onglet.')}</p></section>,document.body)
}
