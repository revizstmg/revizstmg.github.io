export const PUBLIC_ROOTS=['/cours/','/a-propos/','/partager/']
export const PROGRAMME={name:'Éduscol : programmes et ressources en série STMG',url:'https://eduscol.education.gouv.fr/5862/programmes-et-ressources-en-serie-stmg'}
export function sourcesFor(subjectId){
 const list=[PROGRAMME]
 if(/droit/.test(subjectId))list.push({name:'Légifrance : Code civil',url:'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070721/'},{name:'Légifrance : Code du travail',url:'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072050/'})
 if(/economie/.test(subjectId))list.push({name:'Insee : définitions et indicateurs économiques',url:'https://www.insee.fr/fr/accueil'},{name:'Banque de France : ressources économiques',url:'https://www.banque-france.fr/fr'})
 return list
}
