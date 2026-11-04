import {lazy, Suspense, useEffect, useRef, useState} from 'react'
import {useStore} from '../store.jsx'
import {useLang, usePublicText} from '../i18n.js'
import {TextePublic} from '../localisation/PublicText.jsx'
import {epsPreparationText} from '../i18n/epsPreparation.js'
import {activities, EPS, preparation, activityFor, defaultEvent, emptySport, emptyPreparation, eventsFor, fieldFor, metricFor, validateSelection, validatePreparation, buildPreparation, formatPerformance, readPreparation, savePreparation, draftKey} from '../data/epsPreparation.js'
import './EpsPreparation.css'
const Reference=lazy(()=>import('./SportBacReference.jsx'))
export default function SportBac(){
 const {state}=useStore(),lang=useLang(),t=(key,v)=>epsPreparationText(lang,key,v)
 const [reference,setReference]=useState(false)
 if(reference)return <div><button type="button" className="btn-secondary mb-4 no-print" onClick={()=>setReference(false)}>{t('returnTrio')}</button><Suspense fallback={<p>{t('loading')}</p>}><Reference/></Suspense></div>
 return <Preparation key={state.account?.id||'trial'} accountId={state.account?.id} onReference={()=>setReference(true)}/>
}
function Preparation({accountId,onReference}){
 const lang=useLang(),tr=usePublicText(),t=(key,v)=>epsPreparationText(lang,key,v)
 const key=draftKey(accountId)
 const [draft,setDraft]=useState(()=>{try{return readPreparation(window.localStorage,key)}catch{return emptyPreparation()}})
 const [step,setStep]=useState(1),[errors,setErrors]=useState({}),[sheet,setSheet]=useState(null),[stored,setStored]=useState(true)
 const heading=useRef(null),errorBox=useRef(null)
 useEffect(()=>{try{setStored(savePreparation(window.localStorage,key,draft))}catch{setStored(false)}},[draft,key])
 useEffect(()=>{if(step>1)heading.current?.focus()},[step])
 const change=(index,patch)=>{setDraft(d=>({...d,sports:d.sports.map((s,i)=>i===index?{...s,...patch}:s)}));setErrors({});setSheet(null)}
 const report=e=>{setErrors(e);requestAnimationFrame(()=>errorBox.current?.focus())}
 const submit=e=>{
  e.preventDefault()
  if(step===1){const error=validateSelection(draft);if(error)return report({selection:error});setErrors({});setStep(2)}
  else {const e=validatePreparation(draft);if(Object.keys(e).length)return report(e);setSheet(buildPreparation(draft));setErrors({});setStep(3)}
 }
 return <div className="eps-preparation">
  <div className="eps-prep-heading"><p className="kicker">🏃 EPS</p><h1 className="font-display">{t('title')}</h1><p>{t('intro')}</p></div>
  <ol className="eps-prep-steps" aria-label={t('title')}>{[1,2,3].map(n=><li key={n} aria-current={step===n?'step':undefined}><span aria-hidden>0{n}</span>{t('step'+n)}</li>)}</ol>
  {Object.keys(errors).length>0&&<div ref={errorBox} tabIndex={-1} role="alert" className="eps-prep-error">{t(errors.selection||'checkFields')}</div>}
  {step<3&&<form noValidate onSubmit={submit} className="eps-prep-form">
   <h2 className="font-display" ref={heading} tabIndex={-1}>{t('step'+step)}</h2>
   {step===1?<>
    <fieldset className="eps-prep-category"><legend>{t('category')}</legend>{[['g','male'],['f','female']].map(([value,label])=><label key={value}><input type="radio" name="eps-category" value={value} checked={draft.category===value} onChange={()=>{setDraft(d=>({...d,category:value}));setErrors({})}}/>{t(label)}</label>)}</fieldset>
    <p className="eps-prep-hint">{t('categoryHelp')}</p>
    <div className="eps-prep-choice-grid">{draft.sports.map((sport,i)=><div key={i}><label htmlFor={'eps-choice-'+i}>{t('sport',{n:i+1})}</label><select id={'eps-choice-'+i} value={sport.activityId} onChange={e=>change(i,emptySport(e.target.value))} required><option value="">{t('choose')}</option>{EPS.champs.map(c=><optgroup key={c.id} label={tr(['Performance','Déplacement adapté','Expression','Affrontement','Entretien de soi'][c.numero-1])}>{activities.filter(a=>a.ca===c.numero).map(a=><option key={a.id} value={a.id} disabled={draft.sports.some((s,j)=>j!==i&&s.activityId===a.id)}>{tr(a.name)}</option>)}</optgroup>)}</select></div>)}</div>
    <p className="eps-prep-hint">{t('fieldsHelp')}</p>
   </>:<>
    <p className="eps-prep-hint">{t('sameConditions')}</p>
    {draft.sports.map((sport,i)=>{
     const activity=activityFor(sport.activityId),metric=metricFor(sport)
     if(!activity)return null
     const helper=metric?.kind==='time'?'formatTime':metric?.kind==='count'?'formatCount':metric?.kind==='minutes'?'formatMinutes':'formatDistance'
     return <section className="eps-prep-sport" key={i} aria-labelledby={'sport-title-'+i}>
      <h3 id={'sport-title-'+i} className="font-display"><span aria-hidden>{activity.icon}</span> {tr(activity.name)}</h3>
      {activity.ca===1&&<div className="eps-prep-control"><label htmlFor={'eps-event-'+i}>{t('event')}</label><select id={'eps-event-'+i} value={sport.eventId} onChange={e=>change(i,{eventId:e.target.value,current:'',target:''})}>{eventsFor(activity.id).map(e=><option key={e.id} value={e.id}>{tr(e.nom)}</option>)}</select></div>}
      {metric&&<><p className="eps-prep-measure"><TextePublic text={metric.label}/></p>{metric.event?.detail&&<p className="eps-prep-hint"><TextePublic text={metric.event.detail}/></p>}<div className="eps-prep-values">{[['current','current'],['target','goal']].map(([field,label])=><div key={field}><label htmlFor={`eps-${i}-${field}`}>{t(label)}</label><input id={`eps-${i}-${field}`} type="text" inputMode={metric.kind==='time'?'text':'decimal'} maxLength={24} value={sport[field]} aria-invalid={Boolean(errors[`${i}.${field}`])} aria-describedby={`eps-help-${i}${errors[`${i}.${field}`]?` eps-error-${i}-${field}`:''}`} onChange={e=>change(i,{[field]:e.target.value})} required/>{errors[`${i}.${field}`]&&<span id={`eps-error-${i}-${field}`} className="eps-prep-field-error">{t(errors[`${i}.${field}`])}</span>}</div>)}</div><p className="eps-prep-hint" id={`eps-help-${i}`}>{t(helper,{max:metric.max})}</p>{activity.ca!==1&&<p className="eps-prep-hint">{t('personalMetric')}</p>}</>}
      <Rubric sport={sport} category={draft.category} onSplit={split=>change(i,{split})} index={i}/>
     </section>
    })}
   </>}
   <div className="eps-prep-actions">{step===2&&<button type="button" className="btn-secondary" onClick={()=>{setStep(1);setErrors({})}}>{t('back')}</button>}<button className="btn-primary" type="submit">{t(step===1?'continue':'create')}</button></div>
  </form>}
  {step===3&&sheet&&<section className="eps-sheet" aria-labelledby="eps-sheet-title">
   <div className="eps-prep-actions no-print"><button type="button" className="btn-secondary" onClick={()=>setStep(2)}>{t('edit')}</button><button type="button" className="btn-primary" onClick={()=>window.print()}>{t('print')}</button></div>
   <h2 className="font-display" id="eps-sheet-title" ref={heading} tabIndex={-1}>{t('step3')}</h2>
   <p><TextePublic text={preparation.schedule}/></p>
   <p className="eps-prep-hint">{t('category')} : {t(sheet.category==='g'?'male':'female')}</p>
   {sheet.sports.map((s,i)=><article className="eps-sheet-sport" key={s.activity.id}>
    <h3 className="font-display">{s.activity.icon} {tr(s.activity.name)}{s.metric.event&&<span> · {tr(s.metric.event.nom)}</span>}</h3>
    <div className="eps-prep-summary"><div><small>{t('current')}</small><strong>{formatPerformance(s.current,s.metric)}</strong></div><span aria-hidden>→</span><div><small>{t('goal')}</small><strong>{formatPerformance(s.target,s.metric)}</strong></div></div>
    <p>{t('gap',{value:formatPerformance(s.gap,{...s.metric,kind:s.metric.kind==='time'?'distance':s.metric.kind})})}</p>
    <AflPoints afl2={s.afl2} afl3={s.afl3}/>
    <h4><span translate="no">AFL 1</span> · <TextePublic text={s.priority.title}/></h4><p><TextePublic text={s.priority.advice}/></p><p><TextePublic text={s.activity.skill1}/>. <TextePublic text={s.activity.skill2}/>.</p>
    {s.improvement>0&&<><p className="eps-prep-next">{t('intermediate',{value:formatPerformance(s.intermediate,s.metric)})}</p><p className="eps-prep-hint">{t('noPromise')}</p></>}
    <div className="eps-prep-exercises"><div><h4>{t('supervised')}</h4><p><TextePublic text={s.activity.practice}/></p><p className="eps-prep-hint"><TextePublic text={s.activity.conditions}/></p></div><div><h4>{t('home')}</h4><p><TextePublic text={s.activity.home}/></p></div></div>
    <div className="eps-prep-sheet-roles"><div><h4><span translate="no">AFL 2</span> · {t('prepare')}</h4><p>{t('logAdvice')}</p></div><div><h4><span translate="no">AFL 3</span> · {t('roles')}</h4><p><TextePublic text={s.activity.role}/></p></div></div>
    {s.referenceLabel&&<p className="eps-prep-hint">{t('median',{value:s.referenceLabel})}{s.metric.event?.detail&&<> <TextePublic text={s.metric.event.detail}/></>}</p>}
   </article>)}
   <div className="eps-prep-session"><h3 className="font-display">{t('session')}</h3><ol>{preparation.session.map(item=><li key={item}><TextePublic text={item}/></li>)}</ol></div>
   <p className="eps-prep-hint">{t('maxima')}</p>
  </section>}
  <div className="eps-prep-footer no-print"><p className="eps-prep-hint" role={stored?undefined:'status'}>{t(stored?'local':'localError')}</p><div><a href="/eps/referentiel-ccf-2026.pdf" target="_blank" rel="noreferrer">{t('official')} ↗</a><button type="button" onClick={onReference}>{t('reference')}</button></div></div>
 </div>
}
function AflPoints({afl2,afl3}){
 const lang=useLang(),t=(key,v)=>epsPreparationText(lang,key,v)
 return <div className="eps-prep-afl">{[['AFL 1',12,'perform'],['AFL 2',afl2,'prepare'],['AFL 3',afl3,'roles']].map(([label,n,key])=><div key={label}><strong>{label} · {t('outOf',{n})}</strong><small>{t(key)}</small></div>)}</div>
}
function Rubric({sport,category,onSplit,index}){
 const lang=useLang(),t=(key,v)=>epsPreparationText(lang,key,v),field=fieldFor(sport.activityId),metric=metricFor(sport),[afl2,afl3]=sport.split.split('-').map(Number)
 return <div className="eps-prep-rubric"><AflPoints afl2={afl2} afl3={afl3}/><details><summary>{t('rubric')}</summary><p className="eps-prep-hint">{t('maxima')}</p><div className="eps-prep-control"><label htmlFor={'eps-split-'+index}>{t('split')}</label><select id={'eps-split-'+index} value={sport.split} onChange={e=>onSplit(e.target.value)}>{['4-4','6-2','2-6'].map(v=><option key={v} value={v}>{v.replace('-', ' / ')}</option>)}</select></div><h4>AFL 1 · {t('outOf',{n:12})}</h4><p><TextePublic text={field.afl1.intitule}/></p>{field.afl1.elements.map(el=><div key={el.id}><strong><TextePublic text={el.nom}/> · {t('outOf',{n:el.points})}</strong><ul>{el.criteres.map(c=><li key={c}><TextePublic text={c}/></li>)}</ul></div>)}{[['AFL 2',field.afl2],['AFL 3',field.afl3]].map(([name,afl])=><div key={name}><h4>{name}</h4><p><TextePublic text={afl.intitule}/></p><ol>{afl.degres.map(d=><li key={d}><TextePublic text={d}/></li>)}</ol></div>)}</details>{metric?.event&&<p className="eps-prep-hint">{t('median',{value:category==='g'?metric.event.g:metric.event.f})}</p>}</div>
}
