import fs from 'node:fs'
import * as C from '/workspace/work/audit-global-20261109-2/app/src/data/index.js'
await C.chargerTout()
const out={subjects:[],games:0,chapters:0,duplicateManual:[],empty:[],sample:[]}
for(const s of C.SUBJECTS){if(s.resourceOnly)continue;let count=0;for(const t of s.chapters||[]){const chs=C.themeChapters(t);count+=chs.length;for(const ch of chs){out.chapters++;const games=C.jeuxDuChapitre(ch,t);out.games+=games.length;if(!games.length)out.empty.push({sid:s.id,tid:t.id,idx:ch.idx,title:ch.title});const q=games.flatMap(g=>(g.questions||[]).map(q=>({q,game:g.type})));if(out.sample.length<24||['gf-t1','math-c1','p1-sgn-t1','droit-t5','eco-t7','philo-art'].includes(t.id)&&ch.idx<2)out.sample.push({sid:s.id,tid:t.id,idx:ch.idx,title:ch.title,games:games.map(g=>({id:g.id,type:g.type,count:g.questions?.length||g.cards?.length})),questions:q.slice(0,3)})}}out.subjects.push({id:s.id,themes:s.chapters.length,chapters:count})}
fs.writeFileSync('/workspace/output/audit-global-20261109/agent2/inventaire.json',JSON.stringify(out,null,2))
console.log(JSON.stringify({subjects:out.subjects.length,chapters:out.chapters,games:out.games,empty:out.empty.length}))
