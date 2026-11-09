// Repérage d'intérêts déclaré par l'élève, sans diagnostic ni prédiction d'admission.
export const DOMAINES = [
 ['finance','Gestion et finance','Analyser, vérifier et organiser des chiffres.',[
 'Comprendre comment une entreprise gagne ou perd de l’argent.', 'Vérifier une facture et repérer une erreur de calcul.', 'Comparer les coûts de deux projets avant de choisir.', 'Construire un budget et suivre les écarts.', 'Lire un bilan pour comprendre la situation d’une entreprise.', 'Utiliser un tableur pour expliquer un résultat financier.'
 ],['BTS Comptabilité et gestion','BUT Gestion des entreprises et des administrations (GEA)'],['Comptable','Contrôleur ou contrôleuse de gestion'], 'La rigueur, les calculs et le suivi des règles occupent une place importante.'],
 ['commerce','Commerce et marketing','Comprendre les clients et développer une offre.',[
 'Chercher pourquoi un client choisit un produit plutôt qu’un autre.', 'Présenter une offre et répondre aux objections.', 'Comparer des prix et des offres concurrentes.', 'Analyser les résultats d’une enquête auprès de clients.', 'Organiser une action pour fidéliser des clients.', 'Négocier un accord tout en respectant les besoins de l’autre.'
 ],['BTS Management commercial opérationnel (MCO)','BTS Négociation et digitalisation de la relation client (NDRC)','BUT Techniques de commercialisation'],['Chargé ou chargée de clientèle','Responsable commercial'], 'Les objectifs commerciaux, le contact client et parfois des horaires variables sont à examiner.'],
 ['rh','Ressources humaines','Accompagner les personnes dans les organisations.',[
 'Préparer l’accueil d’une nouvelle personne dans une équipe.', 'Chercher une solution à un désaccord au travail.', 'Organiser un recrutement à partir de critères précis.', 'Identifier les besoins de formation d’une équipe.', 'Comprendre les règles qui encadrent les conditions de travail.', 'Traiter des dossiers confidentiels avec méthode et discrétion.'
 ],['BTS Support à l’action managériale (SAM)','BUT GEA, parcours Gestion et pilotage des ressources humaines'],['Assistant ou assistante RH','Chargé ou chargée de recrutement'], 'Le suivi administratif, le droit et la confidentialité comptent autant que le relationnel.'],
 ['numerique','Numérique et systèmes','Résoudre des problèmes et organiser l’information.',[
 'Chercher la cause d’un problème informatique.', 'Apprendre à programmer même si plusieurs essais sont nécessaires.', 'Organiser des données pour retrouver une information rapidement.', 'Comprendre comment sécuriser les accès à un service.', 'Tester un outil et décrire précisément ce qui ne fonctionne pas.', 'Écouter un besoin puis imaginer un outil numérique adapté.'
 ],['BTS Services informatiques aux organisations (SIO)','BUT Informatique (candidature à examiner selon le dossier)'],['Développeur ou développeuse','Technicien ou technicienne systèmes et réseaux'], 'La logique, la pratique régulière et l’apprentissage technique sont essentiels ; les attendus varient selon la formation.'],
 ['droit','Droit et administration','Analyser des situations et appliquer des règles.',[
 'Lire un contrat pour comprendre les obligations de chacun.', 'Justifier une réponse à partir d’un texte juridique.', 'Comparer plusieurs arguments avant de conclure.', 'Aider une personne à comprendre une démarche administrative.', 'Constituer un dossier en vérifiant toutes les pièces.', 'Suivre l’évolution d’une règle et ses conséquences concrètes.'
 ],['BUT Carrières juridiques','Licence Droit'],['Gestionnaire de dossiers','Juriste (après poursuite d’études)'], 'La lecture soutenue, la rédaction et la précision du vocabulaire demandent un travail régulier.'],
 ['economie','Économie et analyse','Comprendre les décisions et les phénomènes collectifs.',[
 'Expliquer les effets d’une hausse des prix sur les ménages.', 'Comparer des données économiques et leurs sources.', 'Discuter les effets d’une décision de politique publique.', 'Interpréter un graphique sans se limiter à le décrire.', 'Relier une actualité à des notions économiques.', 'Explorer plusieurs explications avant de retenir une conclusion.'
 ],['Licence Administration économique et sociale (AES)','Licence Économie et gestion'],['Chargé ou chargée d’études (après poursuite d’études)','Gestionnaire administratif'], 'L’autonomie universitaire et, en économie-gestion, la place des mathématiques doivent être vérifiées dans chaque programme.'],
 ['communication','Communication et projets','Transmettre une idée et coordonner des actions.',[
 'Adapter un message à différents publics.', 'Rédiger un texte clair pour présenter un projet.', 'Préparer un événement en coordonnant plusieurs personnes.', 'Choisir des supports pour rendre une information compréhensible.', 'Présenter oralement un projet puis répondre aux questions.', 'Mesurer les résultats d’une action de communication.'
 ],['BTS Communication','BUT Information-communication'],['Chargé ou chargée de communication','Assistant ou assistante chef de projet'], 'La créativité s’accompagne de rédaction, de délais, de coordination et de contraintes budgétaires.'],
 ['entreprendre','Entrepreneuriat et organisation','Construire un projet et prendre des décisions.',[
 'Repérer un besoin et imaginer un service pour y répondre.', 'Tester une idée auprès de personnes avant de la lancer.', 'Répartir les tâches et suivre l’avancement d’un projet.', 'Modifier un projet après des retours critiques.', 'Évaluer les risques avant d’engager du temps ou de l’argent.', 'Concilier les attentes des clients, de l’équipe et des partenaires.'
 ],['BTS Gestion de la PME','BUT Gestion administrative et commerciale des organisations (GACO)'],['Assistant ou assistante de gestion','Responsable de projet (selon expérience)'], 'Créer une entreprise n’exige pas un diplôme unique ; gestion, expérience et connaissance du secteur restent nécessaires.'],
].map(([id,title,intro,questions,formations,metiers,vigilance])=>({id,title,intro,questions:questions.map((label,i)=>({id:`${id}-${i}`,label})),formations,metiers,vigilance}))
export const ECHELLE = [
 {value:0,label:'Pas du tout'}, {value:1,label:'Plutôt non'}, {value:2,label:'Un peu'}, {value:3,label:'Plutôt oui'}, {value:4,label:'Beaucoup'}, {value:'?',label:'Je ne sais pas encore'},
]
export const CONTEXTE = [
 ['duree','Quelle durée d’études envisages-tu après le bac ?',['2 ans environ','3 ans environ','5 ans ou plus','Je ne sais pas encore']],
 ['alternance','Quelle place souhaites-tu donner à l’alternance ?',['Je la recherche','Je préfère la formation initiale','Je veux comparer les deux','Je ne sais pas encore']],
 ['mobilite','Où pourrais-tu étudier ?',['Près de chez moi uniquement','Dans ma région','Dans une autre région si nécessaire','À préciser avec ma famille']],
 ['cout','Quel point financier veux-tu vérifier en priorité ?',['Les frais de scolarité','Le logement et les transports','La rémunération en alternance','Je dois faire un budget global']],
 ['cadre','Dans quel cadre travailles-tu le plus facilement ?',['Avec un suivi régulier et une classe','Avec beaucoup d’autonomie','Avec un équilibre entre les deux','Je dois encore le découvrir']],
 ['apprendre','Qu’est-ce qui t’aide le plus à comprendre ?',['Des cas concrets et de la pratique','Des explications théoriques approfondies','Un mélange de pratique et de théorie','Je veux tester différentes méthodes']],
 ['maths','Comment abordes-tu actuellement les calculs et les données ?',['Je suis à l’aise','Je progresse avec des exemples','J’ai besoin d’un accompagnement','Je manque de recul']],
 ['redaction','Comment abordes-tu actuellement la lecture et la rédaction ?',['Je suis à l’aise','Je progresse avec une méthode','J’ai besoin d’un accompagnement','Je manque de recul']],
].map(([id,label,options])=>({id,label,options}))
export const ETAPES = [...DOMAINES.map(d=>({id:d.id,title:d.title,questions:d.questions})),{id:'contexte',title:'Mes conditions d’études',questions:CONTEXTE}]
export const TOTAL = ETAPES.reduce((n,s)=>n+s.questions.length,0)
export function reponseValide(q,v){return q.options?Number.isInteger(v)&&v>=0&&v<q.options.length:v==='?'||Number.isInteger(v)&&v>=0&&v<=4}
export function nettoyerReponses(raw){return Object.fromEntries(ETAPES.flatMap(s=>s.questions).filter(q=>reponseValide(q,raw?.[q.id])).map(q=>[q.id,raw[q.id]]))}
export function bilanAvenir(raw){
 const answers=nettoyerReponses(raw)
 return DOMAINES.map(d=>{
  const known=d.questions.filter(q=>typeof answers[q.id]==='number'),positifs=known.filter(q=>answers[q.id]>=3)
  return {...d,known:known.length,positifs:positifs.map(q=>q.label),moyenne:known.length?known.reduce((s,q)=>s+answers[q.id],0)/known.length:0,explorable:known.length>=4&&positifs.length>=2}
 }).sort((a,b)=>Number(b.explorable)-Number(a.explorable)||b.moyenne-a.moyenne)
}
export function conseilsContexte(a){
 const tips=[]
 if(a.duree===0)tips.push('Compare les BTS : généralement deux ans, avec un cadre structuré et une spécialisation professionnelle. Une poursuite d’études peut ensuite être envisagée selon le dossier.')
 if(a.duree===1)tips.push('Compare les BUT et les licences : ils se préparent généralement en trois ans, avec des approches et des niveaux d’encadrement différents.')
 if(a.duree===2)tips.push('Examine les possibilités de poursuite après un premier diplôme. Un master ou une école suppose une nouvelle admission ; elle n’est pas automatique.')
 if(a.alternance===0||a.alternance===2)tips.push('Vérifie l’alternance formation par formation : année d’ouverture, rythme et recherche d’employeur. Une admission en formation ne garantit pas un contrat.')
 if(a.mobilite===0)tips.push('Repère d’abord les formations accessibles en transport depuis chez toi. La localisation ne modifie pas tes intérêts ; elle sert à construire une liste réalisable.')
 if(a.cadre===0)tips.push('Demande la fréquence des évaluations, la taille des groupes et les possibilités de tutorat. Un BTS est souvent plus encadré qu’une licence, mais vérifie chaque établissement.')
 if(a.maths===2)tips.push('Pour les formations quantitatives, regarde les attendus et les dispositifs de soutien. Tes difficultés actuelles sont un point de préparation, pas une exclusion automatique.')
 if(a.redaction===2)tips.push('Pour le droit, la communication et l’université, demande des exemples de travaux écrits et les aides méthodologiques disponibles.')
 if(Number.isInteger(a.cout))tips.push('Établis un budget avec les frais de scolarité, le logement, les transports et les aides éventuelles. Consulte le CROUS et compare les frais réels des établissements.')
 return tips
}
export const SOURCES = [
 ['Onisep : formations et métiers','https://www.onisep.fr/'],['Avenir(s) : explorer son orientation','https://avenirs.onisep.fr/'],['Parcoursup : formations et attendus','https://www.parcoursup.gouv.fr/'],['Les CROUS : aides et vie étudiante','https://www.lescrous.fr/'],
]
