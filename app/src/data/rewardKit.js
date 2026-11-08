import {SUBJECTS} from './index.js'
import {subjectsForTrack} from './tracks.js'
import {SHOP_REWARDS,rewardProgress} from './shop.js'
import fontUrl from '../../resources/fonts/DejaVuSans.ttf?url'
// Documents préparés uniquement à partir des données réelles du compte.
export function buildRewardKit(state,id){
 const reward=SHOP_REWARDS.find(r=>r.id===id)
 if(!reward?.kit||!rewardProgress(state,reward).eligible||!state.shopRewards?.[id])throw Error('reward_locked')
 const themes=subjectsForTrack(state.track).flatMap(s=>(s.chapters||[]).filter(t=>!t.comingSoon).map(t=>({id:t.id,name:t.name,subject:s.short||s.name,url:`https://revizstmg.github.io/#/subject/${s.id}/theme/${t.id}`,score:state.chapters?.[t.id]?.quiz}))).filter(t=>!t.comingSoon)
 const ordered=[...themes].sort((a,b)=>(Number.isFinite(a.score)?a.score:-1)-(Number.isFinite(b.score)?b.score:-1))
 const names=new Map(SUBJECTS.flatMap(s=>(s.chapters||[]).map(t=>[t.id,t.name])))
 const days=reward.kit==='bac'?14:7
 const activities=[
  ['Lire une section et relever 5 notions à expliquer avec ses mots.','Écrire un exemple concret pour 2 de ces notions.','Fermer le cours et vérifier ces 5 explications.'],
  ['Rappeler de mémoire les 5 notions de la veille avant de consulter la fiche.','Réaliser un exercice du thème en notant les hésitations.','Expliquer chaque erreur avec une phrase du cours.'],
  ['Choisir 2 réponses manquées enregistrées, ou 2 questions du thème si aucune erreur n’est disponible.','Rédiger une justification sans le cours.','Comparer à la correction et noter 1 point précis à reprendre.'],
  ['Comparer 2 notions proches du thème en indiquant leur différence.','Inventer une situation où chacune de ces notions intervient.','Vérifier la cohérence des exemples dans le cours.'],
  ['Faire un exercice du thème sans consulter les fiches.','Noter le résultat et les notions réellement mobilisées.','Reprendre 2 points hésitants avec le cours, sans recopier toute la leçon.'],
  ['Formuler 3 questions ouvertes sur le thème.','Y répondre de mémoire avec une justification et un exemple.','Vérifier les réponses et préparer 3 cartes de rappel.'],
  ['Reprendre les questions difficiles du début du programme.','Comparer les réponses actuelles aux premières, sans inventer de score.','Choisir le prochain objectif à partir des difficultés restantes.'],
 ]
 const plan=Array.from({length:days},(_,i)=>{const target=ordered[Math.floor(i/7)%Math.max(ordered.length,1)];return {day:i+1,subject:target?.subject||'',theme:target?.name||'Choisis une matière',url:target?.url,score:target?.score,steps:activities[i%7]}})
 const question=e=>{const q=e.q||{};return {theme:names.get(e.themeId)||e.themeId,question:String(q.q||q.text||q.statement||q.prompt||''),answer:String(Array.isArray(q.choices)&&Number.isInteger(q.answer)?q.choices[q.answer]:typeof q.answer==='boolean'?(q.answer?'Vrai':'Faux'):q.answer??q.expected??q.correct??q.a??'')}}
 return {kind:reward.kit,title:reward.name,name:[state.profile?.firstName,state.profile?.lastName].filter(Boolean).join(' '),xp:Number(state.xp)||0,plan,themes,errors:reward.kit==='semaine'?[]:(state.erreurs||[]).map(question).filter(q=>q.question).slice(0,40),cards:reward.kit==='bac'?(state.reussites||[]).map(question).filter(q=>q.question&&q.answer).slice(0,30):[]}
}
export async function buildRewardKitPdf(kit,fontBase64){
 const {jsPDF}=await import('jspdf'),doc=new jsPDF({compress:true});let y=24
 doc.addFileToVFS('DejaVuSans.ttf',fontBase64);doc.addFont('DejaVuSans.ttf','DejaVu','normal');doc.setFont('DejaVu')
 const text=(value,size=11)=>{doc.setFontSize(size);const lines=doc.splitTextToSize(String(value).replace(/[—–]/g,'-'),170);for(const line of lines){if(y>274){doc.addPage();y=24}doc.text(line,20,y);y+=size*.48+2}y+=3}
 doc.setTextColor(32,62,54);text('RévizSTMG',12);text(kit.title,22);text(kit.name,14);text(`${kit.xp} XP - Données du ${new Intl.DateTimeFormat('fr-FR').format(new Date())}`);text('Ce document utilise tes résultats enregistrés. Il ne garantit pas une note et ne constitue pas une certification.');
 text('Ton programme',17);text('Les thèmes non encore évalués passent en premier, puis les résultats les plus bas. Adapte ce programme à tes devoirs et aux dates de tes épreuves.');for(const day of kit.plan){text(`Jour ${day.day} - ${day.subject}`,13);text(day.theme);if(day.url){if(y>270){doc.addPage();y=24}doc.setFontSize(9);doc.textWithLink('Ouvrir le cours du thème',20,y,{url:day.url});y+=8}if(Number.isFinite(day.score))text(`Dernier meilleur test : ${day.score} %`);day.steps.forEach(step=>text(step))}
 if(kit.kind!=='semaine'){text('Ton bilan par thème',17);kit.themes.forEach(t=>text(`${t.subject} : ${t.name} - ${Number.isFinite(t.score)?t.score+' %':'pas encore évalué'}`));text('Questions à retravailler',17);if(!kit.errors.length)text('Aucune question manquée enregistrée. Après un exercice, reviens télécharger un dossier actualisé.');kit.errors.forEach((q,i)=>{text(`${i+1}. ${q.theme}`,13);text(q.question);if(q.answer)text('Réponse enregistrée : '+q.answer);text('Ma démarche : ________________________________________')})}
 if(kit.kind==='bac'){text('Cartes de rappel',17);if(!kit.cards.length)text('Aucune carte exploitable enregistrée. Réussis quelques exercices puis télécharge à nouveau ton kit.');kit.cards.forEach((q,i)=>{text(`${i+1}. ${q.question}`,12);text('Réponse : '+q.answer)})}
 return doc
}
let fontPromise
export async function downloadRewardKit(state,id){
 const kit=buildRewardKit(state,id)
 fontPromise ||= fetch(fontUrl).then(async r=>{if(!r.ok)throw Error('pdf_font_unavailable');const bytes=new Uint8Array(await r.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary)}).catch(e=>{fontPromise=null;throw e})
 const doc=await buildRewardKitPdf(kit,await fontPromise);doc.save(`revizstmg-${id}.pdf`)
}
