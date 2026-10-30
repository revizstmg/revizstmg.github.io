import {test,expect,vi} from 'vitest'
import {DEMO,PLANS} from '../src/data/studyJourney.js'
import {readNoteDraft,writeNoteDraft,clearNoteDraft} from '../src/data/noteDraft.js'
import {checkStudyFiles,studyCourses,studyError,studyCourseLink,requestStudy} from '../src/data/studyRequest.js'
vi.mock('../src/auth.js',()=>({getSession:vi.fn(()=>({user:{id:'owner'}})),getValidToken:vi.fn(async()=>'test')}))
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
const draft={saisie:'12',matiere:'gestion-finance',chapitre:'gf-t1',date:'2026-10-25',questionsManquees:'Q3 : TVA',revision:null}
test('exemple : barème cohérent, calculs exacts, contenu séparé des scores réels',()=>{
 expect(DEMO.criteria.reduce((n,c)=>n+c.points,0)).toBe(2)
 expect(DEMO.criteria.reduce((n,c)=>n+c.max,0)).toBe(5)
 expect(1200*.2-600*.2).toBe(120);expect(1500*.2-800*.2).toBe(140)
 expect(DEMO.exercises).toHaveLength(3);expect(new Set(DEMO.exercises.map(e=>e.question)).size).toBe(3)
 expect(DEMO.courseUrl).toContain('/cours/terminale/gestion-et-finance/')
 expect(PLANS.map(p=>p.id)).toEqual(['free','premium','ultimate'])
 expect(PLANS[1].features).toContain('Chaque aide par IA : 1 utilisation par mois')
})
test('brouillon par compte : relecture, séparation, effacement et stockage indisponible',()=>{
 const s=storage();expect(writeNoteDraft('a',draft,s)).toBe(true)
 expect(readNoteDraft('a',s)).toMatchObject(draft);expect(readNoteDraft('b',s)).toBeNull();expect(readNoteDraft(null,s)).toBeNull()
 clearNoteDraft('a',s);expect(readNoteDraft('a',s)).toBeNull()
 expect(writeNoteDraft('a',draft,{setItem(){throw Error('full')}})).toBe(false)
 writeNoteDraft('a',{...draft,questionsManquees:'x'.repeat(6001)},s);expect(readNoteDraft('a',s)).toBeNull()
 writeNoteDraft('a',{...draft,revision:{status:'ready',summary:'x',weaknesses:[{}],exercises:[]}},s);expect(readNoteDraft('a',s)).toBeNull()
})
test('fichiers : limite totale, dépôt incomplet, format et fichier vide contrôlés avant envoi',()=>{
 const pdf={type:'application/pdf',size:1024}
 expect(checkStudyFiles([pdf],[pdf])).toHaveLength(2)
 expect(()=>checkStudyFiles([pdf,pdf,pdf,pdf],[])).toThrow('invalid_files')
 expect(()=>checkStudyFiles([{type:'image/heic',size:100}],[])).toThrow('invalid_files')
 expect(()=>checkStudyFiles([{type:'image/jpeg',size:0}],[])).toThrow('invalid_files')
 expect(()=>checkStudyFiles([{...pdf,size:7*1024*1024}],[])).toThrow('too_large')
})
test('le bilan charge seulement la matière et le thème choisis, liens exacts vers le cours',async()=>{
 const courses=await studyCourses('maths','math-c3')
 expect(courses.length).toBeGreaterThan(0);expect(courses.every(c=>c.id.startsWith('math-c3::')&&c.level==='terminale')).toBe(true)
 expect(studyCourseLink(courses[0].id)).toBe('/subject/maths/theme/math-c3/chapter/0')
 expect(studyCourseLink('inconnu::0')).toBeNull()
 await expect(studyCourses('maths','autre-theme')).rejects.toThrow('choose_chapter')
},30000)
test('annulation : termine même si une étape préalable ne répond jamais',async()=>{
 const {getValidToken}=await import('../src/auth.js');getValidToken.mockImplementationOnce(()=>new Promise(()=>{}))
 const ac=new AbortController(),promise=requestStudy({subject:'maths',chapter:'math-c3',missed:'Q3',owner:'owner',subjectFiles:[],copyFiles:[],signal:ac.signal})
 ac.abort();await expect(promise).rejects.toMatchObject({name:'AbortError'})
 expect(studyError('rate_limit')).toContain('Attends quelques minutes')
 expect(studyError('invalid_response')).toContain('Aucun bilan inventé')
})
test('les offres et leur promesse sont disponibles dans les cinq langues hors ligne',async()=>{
 for(const lang of ['en','es','it','ar','de']){
  const {readFileSync}=await import('node:fs')
  const book=JSON.parse(readFileSync(new URL(`../src/localisation/public.${lang}.json`,import.meta.url),'utf8'))
  for(const text of ['Comprends tes erreurs. Prépare ton prochain contrôle.','Voir un exemple de bilan','Comparer les offres',...PLANS.flatMap(p=>[p.intro,...p.features])])expect(book[text],`${lang}: ${text}`).toBeTruthy()
 }
})
