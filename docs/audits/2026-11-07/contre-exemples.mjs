// Lecture seule : depuis app/, npx --no-install vite-node ../docs/audits/2026-11-07/contre-exemples.mjs
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {verifier,estLibre} from '../../../app/src/data/exercicesManuel.js'
import {normalize} from '../../../app/src/games/common.jsx'
import {CALC} from '../../../app/src/calc.js'
import * as C from '../../../app/src/data/index.js'
import {avecGraine} from '../../../app/tests/outils.js'
const out=process.env.REVIZ_AUDIT_DIR||'/tmp/revizstmg-audit-exercices-20261107'
mkdirSync(out,{recursive:true})
const candidates=[
 ['en','en-ex-001','has been working',true],
 ['en','en-ex-088','He does not work on Sundays.',true],
 ['en','en-ex-094','These products are sold.',true],
 ['de','de-ex-008','Würden Sie das bitte wiederholen?',true],
 ['de','de-ex-032','L’article défini féminin au datif.',true],
 ['de','de-ex-064','Morgen arbeite ich.',true],
 ['de','de-ex-068','Obwohl ich müde bin, lerne ich.',true],
 ['de','de-ex-072','Du solltest regelmäßig Deutsch üben.',true],
 ['de','de-ex-079','Darf ich mit Karte bezahlen?',true],
 ['de','de-ex-084','Ich suche ein Praktikum im Bereich Finanzen.',true],
 ['de','de-ex-087','50',true],
 ['de','de-ex-099','Das Dokument behandelt Marketing.',true],
 ['it','it-ex-071','Sono studente.',true],
 ['es','es-ex-117','Mi padre esta en casa.',false],
 ['es','es-ex-006','fuímos',false],
 ['ar','ar-ex-081','مِن',false],
]
const languages=candidates.map(([lang,id,input,expected])=>{
 const m=JSON.parse(readFileSync(`resources/langues/${lang}.json`,'utf8')); const e=m.exercises.find(x=>x.id===id)
 return {lang,id,prompt:e.prompt,answer:e.answer,input,expected,actual:verifier(e,input),selfAssessed:estLibre(e)}
})
const calculations=['seuil','valeur_apres_evolution','taux_evolution'].map(id=>avecGraine('contre-exemple:'+id,()=>{
 const q=CALC[id]();const delta=id==='seuil'?100:id==='valeur_apres_evolution'?0.4:0.1
 const input=Math.round((q.answer+delta)*100)/100
 return {id,...q,input,accepted:Math.abs(input-q.answer)<=q.tolerance}
}))
await C.chargerTout()
const emitted=[]
for(const id of ['maths','p1-maths','sig','droit','gestion-finance','p1-management','histoire-geo','philosophie']){
 const s=C.SUBJECTS.find(x=>x.id===id)
 for(const t of s.chapters)avecGraine('audit-integral:'+t.id+':0',()=>{
  for(const ch of C.themeChapters(t))for(const g of C.jeuxDuChapitre(ch,t)){
   const hits=(g.questions||[]).filter(q=> /(?:2x − 6|SELECT =|nouveaux métiers ou marchés|responsabilité des associés|perte de valeur définitive|Banque de France|liberté comme illusion)/i.test(JSON.stringify(q)))
   if(hits.length)emitted.push({subject:id,theme:t.id,section:ch.idx,title:ch.title,game:g.id,type:g.type,questions:hits})
  }
 })
}
const sqlSource=readFileSync('src/games/SqlQuery.jsx','utf8')
const sqlMatches=new Function('normalize',sqlSource.slice(sqlSource.indexOf('function sqlNorm'),sqlSource.indexOf('// Affiche le schéma'))+';return sqlMatches;')(normalize)
const sql=[
 {input:"SELECT nom FROM CLIENT WHERE ville = 'lyon'",answer:"SELECT nom FROM CLIENT WHERE ville = 'Lyon'",expected:false},
 {input:"SELECT c.nom FROM CLIENT c WHERE c.ville = 'Lyon'",answer:"SELECT nom FROM CLIENT WHERE ville = 'Lyon'",expected:true},
 {input:"SELECT COUNT(numCli) FROM CLIENT",answer:"SELECT COUNT(*) FROM CLIENT",expected:true},
].map(x=>({...x,actual:sqlMatches(x.input,x.answer)}))
const sequence=Array.from({length:12},(_,n)=>({n,A:500+40*n,B:500*1.06**n}))
const result={languages,calculations,emitted,sql,sequence}
writeFileSync(out+'/contre-exemples.json',JSON.stringify(result,null,2))
console.log(JSON.stringify({languageCounterexamples:languages.filter(x=>x.actual!==x.expected&&!x.selfAssessed).length,calculationCounterexamples:calculations.filter(x=>x.accepted).length,emittedGames:emitted.length,sqlCounterexamples:sql.filter(x=>x.actual!==x.expected).length}))
