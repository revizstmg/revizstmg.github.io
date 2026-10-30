import {chargerMatiere,themeChapters,getChapter} from './index.js'
import {reserverIA,messageAccesIA} from './ia.js'
import {courseText} from './examenPersonnalise.js'
import {getSession,getValidToken} from '../auth.js'
import {SUPA_URL,SUPA_ANON} from '../supabase.js'
import {checkFiles,COPY_TYPES,MAX_COPY_BYTES} from '../../../supabase/functions/examen-blanc/grading.js'
import {checkStudyResult} from '../../../supabase/functions/examen-blanc/study.js'

export const STUDY_TIMEOUT=120000
export function checkStudyFiles(subjectFiles,copyFiles){
 const all=[...subjectFiles,...copyFiles]
 if(subjectFiles.length>3||copyFiles.length>3||all.some(f=>!COPY_TYPES.includes(f.type)||!f.size))throw Error('invalid_files')
 if(all.reduce((n,f)=>n+f.size,0)>MAX_COPY_BYTES)throw Error('too_large')
 return all
}
export async function studyCourses(subject,chapter){
 const s=await chargerMatiere(subject)
 const chapters=s.chapters.filter(t=>chapter==='*'||t.id===chapter).flatMap(t=>themeChapters(t))
 if(!chapters.length)throw Error('choose_chapter')
 if(chapters.length>24)throw Error('choose_chapter')
 return chapters.map(c=>({id:c.id,title:c.title,subject:s.name,level:s.niveau==='premiere'?'premiere':'terminale',text:courseText(c.section)}))
}
export function studyCourseLink(id){
 const [tid,index]=String(id).split('::'),theme=getChapter(tid)
 if(!theme||!/^\d+$/.test(index||''))return null
 return `/subject/${theme.subjectId}/theme/${tid}/chapter/${Number(index)}`
}
function interrupted(signal,task){
 if(signal.aborted)return Promise.reject(new DOMException('Aborted','AbortError'))
 return new Promise((resolve,reject)=>{
  const abort=()=>reject(new DOMException('Aborted','AbortError'))
  signal.addEventListener('abort',abort,{once:true})
  Promise.resolve(task).then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort))
 })
}
const read=f=>new Promise((resolve,reject)=>{
 const r=new FileReader();r.onload=()=>resolve({mimeType:f.type,data:String(r.result).split(',')[1]});r.onerror=()=>reject(Error('invalid_files'));r.readAsDataURL(f)
})
export async function requestStudy({subject,chapter,missed,owner,subjectFiles,copyFiles,signal}){
 if(!subject||!chapter)throw Error('choose_chapter')
 const all=checkStudyFiles(subjectFiles,copyFiles)
 const token=await interrupted(signal,getValidToken())
 if(!token||getSession()?.user?.id!==owner)throw Error('login_required')
 const courses=await interrupted(signal,studyCourses(subject,chapter))
 const files=all.length?checkFiles(await interrupted(signal,Promise.all(all.map(read)))):[]
 if(getSession()?.user?.id!==owner)throw Error('login_required')
 const valider=reserverIA('etude');const r=await interrupted(signal,fetch(`${SUPA_URL}/functions/v1/examen-blanc`,{method:'POST',headers:{apikey:SUPA_ANON,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},signal,body:JSON.stringify({action:'study',missed:missed.trim()||'Comparer les erreurs de la copie au sujet fourni.',courses,files,subjectFiles:subjectFiles.length})}))
 const data=await interrupted(signal,r.json().catch(()=>({})))
 if(!r.ok)throw Error(r.status===401?'login_required':r.status===429?'rate_limit':data.error||'server_error')
 valider()
 if(signal.aborted)throw new DOMException('Aborted','AbortError')
 if(getSession()?.user?.id!==owner)throw Error('login_required')
 return {...checkStudyResult(data.study,courses),origin:files.length?'files':'declared'}
}
export function studyError(code){
 const messages={
  login_required:'Reconnecte-toi pour demander une analyse. Ton brouillon est conservé.',
  choose_chapter:'Choisis un chapitre précis pour cibler tes révisions.',
  invalid_files:'Fichier vide, endommagé ou non reconnu. Utilise un PDF, JPEG, PNG ou WebP lisible.',
  too_large:'6 Mo maximum pour tous les fichiers. Réduis leur taille puis réessaie.',
  rate_limit:'Trop de demandes pour le moment. Attends quelques minutes avant de réessayer. Ton brouillon est conservé.',
  invalid_response:'La réponse reçue est incomplète. Aucun bilan inventé n’est affiché. Réessaie avec ton brouillon.',
  grading_unavailable:'L’analyse des fichiers est temporairement indisponible. Tu peux retirer les fichiers et décrire tes questions manquées.',
  provider_quota:'Le service de correction a atteint sa limite temporaire. Réessaie plus tard avec ton brouillon.',
 }
 return messageAccesIA(code)||messages[code]||'Analyse indisponible. Tes questions et tes fichiers restent dans cette page ; réessaie.'
}
