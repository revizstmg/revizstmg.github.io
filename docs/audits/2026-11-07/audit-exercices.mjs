// Audit en lecture seule. Depuis app/ : npx vite-node ../docs/audits/2026-11-07/audit-exercices.mjs
// Les sorties détaillées vont hors dépôt ; les alertes sont des candidats à relire, pas des verdicts sémantiques.
import * as C from '../../../app/src/data/index.js'
import {THEME_TERMS} from '../../../app/src/data/keyterms.js'
import {avecGraine} from '../../../app/tests/outils.js'
import {formeCanonique,answerMatchesCours} from '../../../app/src/games/common.jsx'
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {execFileSync} from 'node:child_process'
const APP=resolve(dirname(fileURLToPath(import.meta.url)),'../../../app')
const OUT=process.env.REVIZ_AUDIT_DIR||'/tmp/revizstmg-audit-exercices-20261107'
mkdirSync(OUT,{recursive:true})
await C.chargerTout()
const summary=[],alerts=new Map(),catalogue=[],rawQuestions=[],corpus=[]
let inspections=0,gameInspections=0
const clean=x=>String(x??'').replace(/\*+/g,'').replace(/\s+/g,' ').trim()
function alert(kind,where,data){const key=JSON.stringify([kind,where.subject,where.theme,where.section,where.game,where.index,data]);if(!alerts.has(key))alerts.set(key,{kind,...where,...data,statut:'candidat_a_relire'})}
function inspect(g,where){
 gameInspections++
 for(const [index,q] of (g.questions||[]).entries()){
  inspections++;const at={...where,game:g.id,type:g.type,index}
  if(Array.isArray(q.choices)){
   if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.choices.length)alert('indice_reponse_invalide',at,{question:q})
   const seen=new Map()
   for(const [i,a] of q.choices.entries()){
    const key=formeCanonique(a)
    if(seen.has(key))alert('choix_equivalents',at,{question:q,indices:[seen.get(key),i]})
    seen.set(key,i)
    if(i!==q.answer && Number.isInteger(q.answer)&&answerMatchesCours(a,q.choices[q.answer],q.alt||[]))alert('distracteur_accepte_par_correcteur',at,{question:q,distracteur:i})
   }
  }
  const answer=typeof q.answer==='number'&&q.choices?q.choices[q.answer]:q.answer
  if(typeof answer==='string'&&/^(cet exemple|cette situation|ce cas|étape \d+|la méthode|à retenir|attention|point clé)$/i.test(clean(answer)))alert('marqueur_sans_notion',at,{question:q})
  if(typeof q.text==='string'&&g.type==='trou'&&!/_{2,}/.test(q.text))alert('trou_sans_emplacement',at,{question:q})
 }
 if(['association','memory'].includes(g.type))for(const side of g.type==='memory'?['a','b']:['left','right']){
  const seen=new Map()
  for(const [i,p] of (g.pairs||[]).entries()){
   const key=formeCanonique(p[side]);if(!key)alert('paire_vide',{...where,game:g.id,type:g.type,index:i},{side,pair:p})
   if(seen.has(key))alert('etiquette_paire_dupliquee',{...where,game:g.id,type:g.type,index:i},{side,pairs:[g.pairs[seen.get(key)],p]})
   seen.set(key,i)
  }
 }
}
function walkRaw(v,path,file){
 if(Array.isArray(v)){v.forEach((x,i)=>walkRaw(x,path+'/'+i,file));return}
 if(!v||typeof v!=='object')return
 if(Array.isArray(v.choices)&&('answer'in v)&&('q'in v||'prompt'in v||'text'in v)){
  const row={file,path,...v};rawQuestions.push(row)
  inspect({id:file+path,type:'qcm',questions:[v]},{subject:file.split('/')[0],theme:'source',section:null})
 }
 Object.entries(v).forEach(([k,x])=>walkRaw(x,path+'/'+k,file))
}
for(const s of C.SUBJECTS){
 const rows=[],terms=[],seenTerms=new Set();let games=0,questions=0,sections=0,rawDefs=0
 for(const t of s.chapters||[]){
  for(const [term,def] of THEME_TERMS[t.id]||[]){rawDefs++;catalogue.push({subject:s.id,theme:t.id,section:null,origin:'definitions.json',term,def})}
  for(let seed=0;seed<5;seed++)avecGraine('audit-integral:'+t.id+':'+seed,()=>{
   const chapters=C.themeChapters(t)
   if(!seed)sections+=chapters.length
   for(const ch of chapters){
    const gs=C.jeuxDuChapitre(ch,t);games+=gs.length;questions+=gs.reduce((n,g)=>n+(g.questions?.length||g.cards?.length||g.pairs?.length||g.items?.length||g.cases?.length||0),0)
    if(!seed){
     rows.push({subject:s.id,theme:t.id,index:ch.idx,title:ch.title,section:ch.section,games:gs})
     const ds=C.sectionDefinitions(ch.section,t.id,s.id,ch.idx,1000).defs
     for(const d of ds){catalogue.push({subject:s.id,theme:t.id,section:ch.idx,origin:'definitions_affichees',...d});const key=clean(d.term)+'|'+clean(d.def);if(!seenTerms.has(key)){seenTerms.add(key);terms.push({theme:t.id,section:ch.idx,...d})}}
    }
    for(const g of gs)inspect(g,{subject:s.id,theme:t.id,section:ch.idx,seed})
   }
  })
  for(const g of t.games||[])inspect(g,{subject:s.id,theme:t.id,section:null,origin:'banque_theme'})
 }
 writeFileSync(resolve(OUT,s.id+'.json'),JSON.stringify(rows,null,1))
 writeFileSync(resolve(OUT,'definitions-'+s.id+'.tsv'),['theme\tsection\tterme\tdefinition',...terms.map(d=>[d.theme,d.section,clean(d.term),clean(d.def)].join('\t'))].join('\n'))
 const item={subject:s.id,name:s.name,level:s.niveau||'terminale',themes:s.chapters?.length||0,sections,rawDefs,definitionsAfficheesDistinctes:terms.length,gameInspections:games,unitInspections:questions,mode:/^(?:p1-)?langues$/.test(s.id)?'banques_heritees_langues':'cours_navigation'}
 summary.push(item);console.log(JSON.stringify(item))
}
for(const dir of readdirSync(resolve(APP,'content'),{withFileTypes:true}).filter(x=>x.isDirectory()))for(const file of readdirSync(resolve(APP,'content',dir.name)).filter(n=>n.endsWith('.json'))){
 const name=dir.name+'/'+file;walkRaw(JSON.parse(readFileSync(resolve(APP,'content',name),'utf8')),'',name)
}
const manuals=[]
for(const lang of ['en','es','de','it','ar']){
 const m=JSON.parse(readFileSync(resolve(APP,'resources/langues',lang+'.json'),'utf8'))
 for(const e of m.exercises||[]){
  if(e.type==='qcm'&&(!e.choices?.includes(e.answer)||new Set(e.choices).size!==e.choices.length))alert('qcm_manuel_invalide',{subject:lang,game:e.id},{question:e})
 }
 manuals.push({lang,lessons:m.lessons.length,exercises:m.exercises.length})
 writeFileSync(resolve(OUT,'manuel-'+lang+'.tsv'),['id\ttype\tenonce\treponse\talternatives\tcorrection',...m.exercises.map(e=>[e.id,e.type,clean(e.prompt),clean(e.answer),JSON.stringify(e.alternatives||[]),clean(e.explanation)].join('\t'))].join('\n'))
}
const result={source:execFileSync('git',['rev-parse','HEAD'],{cwd:APP,encoding:'utf8'}).trim(),seeds:5,subjects:summary,manuals,totals:{subjects:summary.length,themes:summary.reduce((n,x)=>n+x.themes,0),sections:summary.reduce((n,x)=>n+x.sections,0),rawDefinitions:summary.reduce((n,x)=>n+x.rawDefs,0),displayedDefinitionRows:catalogue.filter(x=>x.origin==='definitions_affichees').length,gameInspections,questionInspections:inspections,rawQcm:rawQuestions.length,alerts:alerts.size},limits:'Contrôles structurels sur cinq réalisations par chapitre ; ne vaut pas validation sémantique ni exploration exhaustive de toutes les variantes.'}
writeFileSync(resolve(OUT,'inventaire.json'),JSON.stringify(result,null,2))
writeFileSync(resolve(OUT,'alertes.json'),JSON.stringify([...alerts.values()],null,2))
writeFileSync(resolve(OUT,'definitions.json'),JSON.stringify(catalogue,null,1))
writeFileSync(resolve(OUT,'qcm-sources.json'),JSON.stringify(rawQuestions,null,1))
console.log(JSON.stringify(result.totals))
