import {SUBJECTS} from './index.js'
import {subjectsForTrack} from './tracks.js'
import {SHOP_REWARDS,rewardProgress} from './shop.js'
// Documents préparés uniquement à partir des données réelles du compte.
export function buildRewardKit(state,id){
 const reward=SHOP_REWARDS.find(r=>r.id===id)
 if(!reward?.kit||!rewardProgress(state,reward).eligible||!state.shopRewards?.[id])throw Error('reward_locked')
 const themes=subjectsForTrack(state.track).flatMap(s=>(s.chapters||[]).filter(t=>!t.comingSoon).map(t=>({id:t.id,name:t.name,subject:s.short||s.name,score:state.chapters?.[t.id]?.quiz}))).filter(t=>!t.comingSoon)
 const ordered=[...themes].sort((a,b)=>(Number.isFinite(a.score)?a.score:-1)-(Number.isFinite(b.score)?b.score:-1))
 const names=new Map(SUBJECTS.flatMap(s=>(s.chapters||[]).map(t=>[t.id,t.name])))
 const days=reward.kit==='bac'?14:7
 const plan=Array.from({length:days},(_,i)=>{const target=ordered[i%Math.max(ordered.length,1)];return {day:i+1,subject:target?.subject||'',theme:target?.name||'Choisis une matière',score:target?.score,steps:i%3===2?['Reprendre les réponses manquées.','Refaire un exercice sans consulter le cours.','Noter les notions encore difficiles.']:['Lire une section du cours.','Fermer la fiche et rappeler les notions importantes.','Faire un exercice puis vérifier la correction.']}})
 const question=e=>{const q=e.q||{};return {theme:names.get(e.themeId)||e.themeId,question:String(q.q||q.text||q.statement||q.prompt||''),answer:String(Array.isArray(q.choices)&&Number.isInteger(q.answer)?q.choices[q.answer]:typeof q.answer==='boolean'?(q.answer?'Vrai':'Faux'):q.answer??q.expected??q.correct??q.a??'')}}
 return {title:reward.name,name:[state.profile?.firstName,state.profile?.lastName].filter(Boolean).join(' '),xp:Number(state.xp)||0,plan,themes,errors:reward.kit==='semaine'?[]:(state.erreurs||[]).map(question).filter(q=>q.question).slice(0,40),cards:reward.kit==='bac'?(state.reussites||[]).map(question).filter(q=>q.question&&q.answer).slice(0,30):[]}
}
export async function downloadRewardKit(state,id){
 const kit=buildRewardKit(state,id),{jsPDF}=await import('jspdf'),doc=new jsPDF();let y=24
 const text=(value,size=11)=>{doc.setFontSize(size);const lines=doc.splitTextToSize(String(value).replace(/[—–]/g,'-'),170);for(const line of lines){if(y>274){doc.addPage();y=24}doc.text(line,20,y);y+=size*.48+2}y+=3}
 doc.setTextColor(32,62,54);text('RévizSTMG',12);text(kit.title,22);text(kit.name,14);text(`${kit.xp} XP - Données du ${new Intl.DateTimeFormat('fr-FR').format(new Date())}`);text('Ce document utilise tes résultats enregistrés. Il ne garantit pas une note et ne constitue pas une certification.');
 text('Ton programme',17);text('Les thèmes non encore évalués passent en premier, puis les résultats les plus bas. Adapte ce programme à tes devoirs et aux dates de tes épreuves.');for(const day of kit.plan){text(`Jour ${day.day} - ${day.subject}`,13);text(day.theme);if(Number.isFinite(day.score))text(`Dernier meilleur test : ${day.score} %`);day.steps.forEach(step=>text(step))}
 if(id!=='kit-semaine'){text('Ton bilan par thème',17);kit.themes.forEach(t=>text(`${t.subject} : ${t.name} - ${Number.isFinite(t.score)?t.score+' %':'pas encore évalué'}`));text('Questions à retravailler',17);if(!kit.errors.length)text('Aucune question manquée enregistrée. Après un exercice, reviens télécharger un dossier actualisé.');kit.errors.forEach((q,i)=>{text(`${i+1}. ${q.theme}`,13);text(q.question);if(q.answer)text('Réponse enregistrée : '+q.answer);text('Ma démarche : ________________________________________')})}
 if(id==='kit-bac'){text('Cartes de rappel',17);if(!kit.cards.length)text('Aucune carte exploitable enregistrée. Réussis quelques exercices puis télécharge à nouveau ton kit.');kit.cards.forEach((q,i)=>{text(`${i+1}. ${q.question}`,12);text('Réponse : '+q.answer)})}
 doc.save(`revizstmg-${id}.pdf`)
}
